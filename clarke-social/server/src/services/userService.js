const db = require('../db/connection');
const HttpError = require('../utils/httpError');
const { findUserById } = require('./authService');

function updateProfile(userId, body) {
  const displayName = String(body.displayName || '')
    .trim()
    .slice(0, 60);
  const bio = String(body.bio || '')
    .trim()
    .slice(0, 240);
  if (!displayName) throw new HttpError(400, 'Display name cannot be empty.');
  db.prepare('UPDATE users SET display_name=?, bio=? WHERE id=?').run(displayName, bio, userId);
  return findUserById(userId);
}

function toggleFollow(followerId, targetId) {
  if (targetId === followerId) throw new HttpError(400, 'You cannot follow yourself.');
  if (!db.prepare('SELECT id FROM users WHERE id=?').get(targetId)) throw new HttpError(404, 'User not found.');
  const exists = db.prepare('SELECT 1 FROM follows WHERE follower_id=? AND following_id=?').get(followerId, targetId);
  if (exists) db.prepare('DELETE FROM follows WHERE follower_id=? AND following_id=?').run(followerId, targetId);
  else db.prepare('INSERT INTO follows(follower_id,following_id) VALUES(?,?)').run(followerId, targetId);
  return !exists;
}

// Starter behaviour: follow only (never unfollows) and always reports following.
function followLegacy(followerId, targetId) {
  if (targetId === followerId) throw new HttpError(400, 'You cannot follow yourself.');
  try {
    db.prepare('INSERT INTO follows(follower_id,following_id) VALUES(?,?)').run(followerId, targetId);
  } catch {
    // Already following, or the target does not exist: the starter reported success either way.
  }
  return true;
}

function search(query) {
  const q = `%${String(query || '')
    .trim()
    .slice(0, 40)}%`;
  return db
    .prepare(
      'SELECT id,username,display_name,bio,avatar FROM users WHERE username LIKE ? OR display_name LIKE ? LIMIT 20'
    )
    .all(q, q);
}

module.exports = { updateProfile, toggleFollow, followLegacy, search };
