const fs = require('fs');
const path = require('path');
const db = require('../db/connection');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { toPost } = require('../utils/serializers');

const postSelect = `SELECT p.*, u.username, u.display_name, u.avatar,
 (SELECT COUNT(*) FROM likes l WHERE l.post_id=p.id) AS likes,
 (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS comments,
 EXISTS(SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=?) AS liked
 FROM posts p JOIN users u ON u.id=p.user_id`;

const commentSelect =
  'SELECT c.id,c.body,c.created_at,u.username,u.display_name,u.avatar FROM comments c JOIN users u ON u.id=c.user_id';

function listPosts(viewerId) {
  return db.prepare(`${postSelect} ORDER BY p.id DESC LIMIT 60`).all(viewerId).map(toPost);
}

function createPost(userId, body, file, allowDownload) {
  const text = String(body || '')
    .trim()
    .slice(0, 2000);
  if (!text && !file) throw new HttpError(400, 'Write something or attach a photo/video.');
  const mediaPath = file ? `/uploads/${file.filename}` : '';
  const mediaType = file ? file.mimetype : '';
  const allow = allowDownload === 'true' && mediaType.startsWith('video/') ? 1 : 0;
  const result = db
    .prepare('INSERT INTO posts(user_id,body,media_path,media_type,allow_download) VALUES(?,?,?,?,?)')
    .run(userId, text, mediaPath, mediaType, allow);
  return toPost(db.prepare(`${postSelect} WHERE p.id=?`).get(userId, result.lastInsertRowid));
}

function toggleLike(userId, postId) {
  if (!db.prepare('SELECT id FROM posts WHERE id=?').get(postId)) throw new HttpError(404, 'Post not found.');
  const exists = db.prepare('SELECT 1 FROM likes WHERE user_id=? AND post_id=?').get(userId, postId);
  if (exists) db.prepare('DELETE FROM likes WHERE user_id=? AND post_id=?').run(userId, postId);
  else db.prepare('INSERT INTO likes(user_id,post_id) VALUES(?,?)').run(userId, postId);
  return { liked: !exists, likes: db.prepare('SELECT COUNT(*) n FROM likes WHERE post_id=?').get(postId).n };
}

function listComments(postId) {
  return db.prepare(`${commentSelect} WHERE c.post_id=? ORDER BY c.id ASC`).all(postId);
}

function addComment(userId, postId, body) {
  const text = String(body || '')
    .trim()
    .slice(0, 800);
  if (!text) throw new HttpError(400, 'Write a comment first.');
  const result = db.prepare('INSERT INTO comments(user_id,post_id,body) VALUES(?,?,?)').run(userId, postId, text);
  return db.prepare(`${commentSelect} WHERE c.id=?`).get(result.lastInsertRowid);
}

function reportPost(userId, postId, reason) {
  db.prepare('INSERT INTO reports(reporter_id,post_id,reason) VALUES(?,?,?)').run(
    userId,
    postId,
    String(reason || 'Other').slice(0, 120)
  );
}

function resolveDownload(userId, postId) {
  const post = db.prepare('SELECT user_id,media_path,media_type,allow_download FROM posts WHERE id=?').get(postId);
  if (!post || !post.media_path) throw new HttpError(404, 'Media not found.');
  if (!post.allow_download && post.user_id !== userId)
    throw new HttpError(403, 'The creator has not enabled downloads.');
  const filePath = path.join(env.uploadDir, path.basename(post.media_path));
  if (!fs.existsSync(filePath)) throw new HttpError(404, 'Media file is unavailable.');
  return filePath;
}

module.exports = { listPosts, createPost, toggleLike, listComments, addComment, reportPost, resolveDownload };
