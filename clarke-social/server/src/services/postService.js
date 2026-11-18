const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');
const { toPost } = require('../utils/serializers');
const { notify } = require('./notificationService');

const FEELINGS = ['happy', 'grateful', 'excited', 'loved', 'blessed', 'relaxed', 'tired', 'sad', 'proud', 'motivated'];

// $1 is always the viewer id (0 when signed out).
const SELECT = `SELECT p.*, u.username, u.display_name, u.avatar,
  (SELECT COUNT(*)::int FROM likes l WHERE l.post_id=p.id) likes,
  (SELECT COUNT(*)::int FROM comments c WHERE c.post_id=p.id) comments,
  (SELECT COUNT(*)::int FROM post_shares s WHERE s.post_id=p.id) shares,
  (SELECT COUNT(*)::int FROM posts r WHERE r.repost_of=p.id) reposts,
  EXISTS(SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=$1) liked,
  EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id=p.id AND s.user_id=$1) saved,
  EXISTS(SELECT 1 FROM posts r WHERE r.repost_of=p.id AND r.user_id=$1) reposted,
  o.id original_id, ou.username original_username, ou.display_name original_display_name,
  o.body original_body, o.media_path original_media_path, o.media_type original_media_type
  FROM posts p JOIN users u ON u.id=p.user_id
  LEFT JOIN posts o ON o.id=p.repost_of LEFT JOIN users ou ON ou.id=o.user_id`;

const FILTERS = {
  all: 'TRUE',
  videos: `p.media_type LIKE 'video/%'`,
  saved: 'EXISTS(SELECT 1 FROM saved_posts s WHERE s.post_id=p.id AND s.user_id=$1)',
  updates: `p.media_path='' AND p.repost_of IS NULL OR p.repost_of IS NOT NULL`,
};

async function listPosts(viewerId, { view = 'all', userId, sort } = {}) {
  const where = [`(${FILTERS[view] || FILTERS.all})`];
  const params = [viewerId || 0];
  if (userId) {
    params.push(userId);
    where.push(`p.user_id=$${params.length}`);
  }
  const order = sort === 'popular' ? 'likes DESC, p.id DESC' : 'p.id DESC';
  const rows = await many(`${SELECT} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT 60`, params);
  return rows.map(toPost);
}

async function getPost(viewerId, postId) {
  const row = await one(`${SELECT} WHERE p.id=$2`, [viewerId || 0, postId]);
  if (!row) throw new HttpError(404, 'Post not found.');
  return toPost(row);
}

async function createPost(userId, { body, feeling, allowDownload }, upload) {
  const text = String(body || '')
    .trim()
    .slice(0, 2000);
  if (!text && !upload) throw new HttpError(400, 'Write something or attach a photo/video.');
  const mood = FEELINGS.includes(feeling) ? feeling : '';
  const mediaType = upload?.type || '';
  const allow = String(allowDownload) === 'true' && mediaType.startsWith('video/');
  const row = await one(
    'INSERT INTO posts(user_id,body,feeling,media_path,media_type,allow_download) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
    [userId, text, mood, upload?.stored || '', mediaType, allow]
  );
  return getPost(userId, row.id);
}

async function deletePost(userId, postId) {
  const post = await one('DELETE FROM posts WHERE id=$1 AND user_id=$2 RETURNING media_path', [postId, userId]);
  if (!post) throw new HttpError(404, 'Post not found.');
  await removeStored(post.media_path);
}

async function requirePost(postId) {
  const post = await one('SELECT * FROM posts WHERE id=$1', [postId]);
  if (!post) throw new HttpError(404, 'Post not found.');
  return post;
}

async function toggleLike(userId, postId) {
  const post = await requirePost(postId);
  const removed = await query('DELETE FROM likes WHERE user_id=$1 AND post_id=$2', [userId, postId]);
  if (!removed.rowCount) {
    await query('INSERT INTO likes(user_id,post_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [userId, postId]);
    await notify(post.user_id, userId, 'like', postId);
  }
  const { n } = await one('SELECT COUNT(*)::int n FROM likes WHERE post_id=$1', [postId]);
  return { liked: !removed.rowCount, likes: n };
}

async function toggleSave(userId, postId) {
  await requirePost(postId);
  const removed = await query('DELETE FROM saved_posts WHERE user_id=$1 AND post_id=$2', [userId, postId]);
  if (!removed.rowCount) await query('INSERT INTO saved_posts(user_id,post_id) VALUES($1,$2)', [userId, postId]);
  return { saved: !removed.rowCount };
}

async function recordShare(userId, postId) {
  await requirePost(postId);
  await query('INSERT INTO post_shares(user_id,post_id) VALUES($1,$2)', [userId || null, postId]);
  const { n } = await one('SELECT COUNT(*)::int n FROM post_shares WHERE post_id=$1', [postId]);
  return { shares: n };
}

// Reposting again undoes the repost.
async function toggleRepost(userId, postId) {
  const original = await requirePost(postId);
  const targetId = original.repost_of || original.id;
  const removed = await query('DELETE FROM posts WHERE user_id=$1 AND repost_of=$2', [userId, targetId]);
  if (!removed.rowCount) await query('INSERT INTO posts(user_id,repost_of) VALUES($1,$2)', [userId, targetId]);
  return { reposted: !removed.rowCount };
}

const COMMENT_SELECT = `SELECT c.id, c.body, c.created_at, u.id user_id, u.username, u.display_name, u.avatar
  FROM comments c JOIN users u ON u.id=c.user_id`;

async function listComments(postId) {
  await requirePost(postId);
  return many(`${COMMENT_SELECT} WHERE c.post_id=$1 ORDER BY c.id ASC`, [postId]);
}

async function addComment(userId, postId, body) {
  const text = String(body || '')
    .trim()
    .slice(0, 800);
  if (!text) throw new HttpError(400, 'Write a comment first.');
  const post = await requirePost(postId);
  const row = await one('INSERT INTO comments(user_id,post_id,body) VALUES($1,$2,$3) RETURNING id', [
    userId,
    postId,
    text,
  ]);
  await notify(post.user_id, userId, 'comment', postId);
  return one(`${COMMENT_SELECT} WHERE c.id=$1`, [row.id]);
}

async function reportPost(userId, postId, reason) {
  await requirePost(postId);
  const text = String(reason || '')
    .trim()
    .slice(0, 120);
  if (!text) throw new HttpError(400, 'Tell us why you are reporting this post.');
  await query(`INSERT INTO reports(reporter_id,post_id,target_type,target_id,reason) VALUES($1,$2,'post',$2,$3)`, [
    userId,
    postId,
    text,
  ]);
}

// Creator-controlled downloads: checked when the link is issued and again when it is used.
async function assertCanDownload(userId, postId) {
  const post = await requirePost(postId);
  if (!post.media_path) throw new HttpError(404, 'Media not found.');
  if (!post.allow_download && post.user_id !== userId)
    throw new HttpError(403, 'The creator has not enabled downloads.');
  return post;
}

module.exports = {
  FEELINGS,
  listPosts,
  getPost,
  createPost,
  deletePost,
  toggleLike,
  toggleSave,
  recordShare,
  toggleRepost,
  listComments,
  addComment,
  reportPost,
  assertCanDownload,
};
