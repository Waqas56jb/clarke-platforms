const { one, many, query, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');
const { toPublicUser } = require('../utils/serializers');
const { notify } = require('./notificationService');
const { confirmPassword } = require('./authService');
const { canMessage } = require('./messagingRules');

async function updateProfile(userId, body) {
  const displayName = String(body.displayName || '')
    .trim()
    .slice(0, 60);
  const bio = String(body.bio || '')
    .trim()
    .slice(0, 240);
  if (!displayName) throw new HttpError(400, 'Display name cannot be empty.');
  return one('UPDATE users SET display_name=$1, bio=$2 WHERE id=$3 RETURNING *', [displayName, bio, userId]);
}

async function setAvatar(user, upload) {
  if (!upload) throw new HttpError(400, 'Choose an image for your profile photo.');
  const updated = await one('UPDATE users SET avatar=$1 WHERE id=$2 RETURNING *', [upload.stored, user.id]);
  await removeStored(user.avatar);
  return updated;
}

// Collects every file the member uploaded, deletes the account (rows cascade), then the files.
async function deleteAccount(user, password) {
  await confirmPassword(user, password);
  const files = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT media_path p FROM posts WHERE user_id=$1
       UNION ALL SELECT media_path FROM stories WHERE user_id=$1
       UNION ALL SELECT audio_path FROM tracks WHERE owner_id=$1
       UNION ALL SELECT proof_path FROM tracks WHERE owner_id=$1
       UNION ALL SELECT unnest(ARRAY[poster_path, trailer_path, video_path]) FROM movies WHERE owner_id=$1`,
      [user.id]
    );
    await client.query('DELETE FROM users WHERE id=$1', [user.id]);
    return rows.map((r) => r.p);
  });
  await removeStored(user.avatar, ...files);
}

async function toggleFollow(followerId, targetId) {
  if (targetId === followerId) throw new HttpError(400, 'You cannot follow yourself.');
  if (!(await one('SELECT id FROM users WHERE id=$1', [targetId]))) throw new HttpError(404, 'User not found.');
  const removed = await query('DELETE FROM follows WHERE follower_id=$1 AND following_id=$2', [followerId, targetId]);
  if (removed.rowCount) return false;
  await query('INSERT INTO follows(follower_id,following_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [
    followerId,
    targetId,
  ]);
  await notify(targetId, followerId, 'follow');
  return true;
}

const FOLLOW_FLAG = `EXISTS(SELECT 1 FROM follows f WHERE f.follower_id=$1 AND f.following_id=u.id) AS is_following`;

const toListedUser = (r) => ({ ...toPublicUser(r), isFollowing: r.is_following });

async function search(viewerId, text) {
  const q = `%${String(text || '')
    .trim()
    .slice(0, 40)}%`;
  const rows = await many(
    `SELECT u.*, ${FOLLOW_FLAG} FROM users u
     WHERE (u.username ILIKE $2 OR u.display_name ILIKE $2) AND u.id <> $1
     ORDER BY u.display_name LIMIT 20`,
    [viewerId || 0, q]
  );
  return rows.map(toListedUser);
}

// "People to know": members the viewer does not follow yet, most-followed first.
async function suggestions(viewerId) {
  const rows = await many(
    `SELECT u.*, false AS is_following FROM users u
     WHERE u.id <> $1 AND NOT EXISTS(SELECT 1 FROM follows f WHERE f.follower_id=$1 AND f.following_id=u.id)
     ORDER BY (SELECT COUNT(*) FROM follows f WHERE f.following_id=u.id) DESC, u.id DESC LIMIT 3`,
    [viewerId || 0]
  );
  return rows.map(toListedUser);
}

async function profile(viewerId, userId) {
  const row = await one(
    `SELECT u.*, ${FOLLOW_FLAG},
       (SELECT COUNT(*)::int FROM follows WHERE following_id=u.id) followers,
       (SELECT COUNT(*)::int FROM follows WHERE follower_id=u.id) following,
       (SELECT COUNT(*)::int FROM posts WHERE user_id=u.id) posts
     FROM users u WHERE u.id=$2`,
    [viewerId || 0, userId]
  );
  if (!row) throw new HttpError(404, 'Member not found.');
  return {
    ...toListedUser(row),
    followers: row.followers,
    following: row.following,
    posts: row.posts,
    canMessage: viewerId ? await canMessage(viewerId, userId) : false,
  };
}

module.exports = { updateProfile, setAvatar, deleteAccount, toggleFollow, search, suggestions, profile };
