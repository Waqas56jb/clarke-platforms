// One-to-one messaging. Messages are stored as plain text in the database and delivered live over
// Socket.IO. This is NOT end-to-end encrypted.
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso, toPublicUser } = require('../utils/serializers');
const { emitToUser } = require('../sockets/registry');
const { notify } = require('./notificationService');
const { canMessage } = require('./messagingRules');

const toMessage = (m) => ({
  id: m.id,
  senderId: m.sender_id,
  recipientId: m.recipient_id,
  body: m.body,
  read: Boolean(m.read_at),
  createdAt: iso(m.created_at),
});

async function conversations(userId) {
  const rows = await many(
    `WITH last AS (
       SELECT DISTINCT ON (partner) partner, id, body, sender_id, created_at FROM (
         SELECT CASE WHEN sender_id=$1 THEN recipient_id ELSE sender_id END partner, id, body, sender_id, created_at
         FROM messages WHERE sender_id=$1 OR recipient_id=$1) x
       ORDER BY partner, id DESC)
     SELECT last.*, u.username, u.display_name, u.avatar, u.bio, u.created_at user_created_at,
       (SELECT COUNT(*)::int FROM messages m WHERE m.sender_id=last.partner AND m.recipient_id=$1 AND m.read_at IS NULL) unread
     FROM last JOIN users u ON u.id=last.partner ORDER BY last.id DESC`,
    [userId]
  );
  return rows.map((r) => ({
    user: toPublicUser({ ...r, id: r.partner, created_at: r.user_created_at }),
    lastMessage: { body: r.body, fromMe: r.sender_id === userId, createdAt: iso(r.created_at) },
    unread: r.unread,
  }));
}

// Members the user may start a conversation with: mutual matches and mutual follows, not blocked.
async function contacts(userId) {
  const rows = await many(
    `SELECT u.* FROM users u WHERE u.id <> $1
       AND NOT EXISTS(SELECT 1 FROM dating_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=u.id) OR (b.blocker_id=u.id AND b.blocked_id=$1))
       AND ((EXISTS(SELECT 1 FROM dating_likes a WHERE a.from_user=$1 AND a.to_user=u.id)
             AND EXISTS(SELECT 1 FROM dating_likes b WHERE b.from_user=u.id AND b.to_user=$1))
         OR (EXISTS(SELECT 1 FROM follows a WHERE a.follower_id=$1 AND a.following_id=u.id)
             AND EXISTS(SELECT 1 FROM follows b WHERE b.follower_id=u.id AND b.following_id=$1)))
     ORDER BY u.display_name LIMIT 100`,
    [userId]
  );
  return rows.map(toPublicUser);
}

async function thread(userId, otherId) {
  const other = await one('SELECT * FROM users WHERE id=$1', [otherId]);
  if (!other) throw new HttpError(404, 'Member not found.');
  const rows = await many(
    `SELECT * FROM (SELECT * FROM messages
       WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1)
       ORDER BY id DESC LIMIT 200) x ORDER BY id ASC`,
    [userId, otherId]
  );
  return { user: toPublicUser(other), canMessage: await canMessage(userId, otherId), messages: rows.map(toMessage) };
}

async function send(userId, otherId, body) {
  const text = String(body || '').trim();
  if (!text) throw new HttpError(400, 'Write a message first.');
  if (text.length > 2000) throw new HttpError(400, 'Messages can be up to 2,000 characters.');
  if (!(await canMessage(userId, otherId)))
    throw new HttpError(403, 'You can message members you have matched with or who follow you back.');
  const row = await one('INSERT INTO messages(sender_id,recipient_id,body) VALUES($1,$2,$3) RETURNING *', [
    userId,
    otherId,
    text,
  ]);
  const message = toMessage(row);
  emitToUser(otherId, 'message:new', message);
  emitToUser(userId, 'message:new', message);
  await notify(otherId, userId, 'message', row.id);
  return message;
}

async function markRead(userId, otherId) {
  const { rowCount } = await query(
    'UPDATE messages SET read_at=now() WHERE sender_id=$1 AND recipient_id=$2 AND read_at IS NULL',
    [otherId, userId]
  );
  if (rowCount) emitToUser(otherId, 'message:read', { readerId: userId });
  emitToUser(userId, 'message:unread-changed', {});
}

async function unreadCount(userId) {
  const { count } = await one('SELECT COUNT(*)::int count FROM messages WHERE recipient_id=$1 AND read_at IS NULL', [
    userId,
  ]);
  return count;
}

module.exports = { conversations, contacts, thread, send, markRead, unreadCount };
