const { many, one, query } = require('../db/pool');
const { emitToUser } = require('../sockets/registry');
const { iso } = require('../utils/serializers');

const SELECT = `SELECT n.id, n.type, n.entity_id, n.read_at, n.created_at, u.id actor_id, u.username, u.display_name, u.avatar
  FROM notifications n LEFT JOIN users u ON u.id = n.actor_id`;

const toNotification = (r) => ({
  id: r.id,
  type: r.type,
  entityId: r.entity_id,
  read: Boolean(r.read_at),
  createdAt: iso(r.created_at),
  actor: r.actor_id ? { id: r.actor_id, username: r.username, displayName: r.display_name, avatar: r.avatar } : null,
});

// Records a notification and pushes it live. Members are never notified about their own actions.
async function notify(userId, actorId, type, entityId = null) {
  if (Number(userId) === Number(actorId)) return;
  const row = await one('INSERT INTO notifications(user_id,actor_id,type,entity_id) VALUES($1,$2,$3,$4) RETURNING id', [
    userId,
    actorId,
    type,
    entityId,
  ]);
  const full = await one(`${SELECT} WHERE n.id=$1`, [row.id]);
  emitToUser(userId, 'notification:new', toNotification(full));
}

async function list(userId) {
  const rows = await many(`${SELECT} WHERE n.user_id=$1 ORDER BY n.id DESC LIMIT 40`, [userId]);
  const { count } = await one('SELECT COUNT(*)::int count FROM notifications WHERE user_id=$1 AND read_at IS NULL', [
    userId,
  ]);
  return { notifications: rows.map(toNotification), unread: count };
}

const markAllRead = (userId) =>
  query('UPDATE notifications SET read_at=now() WHERE user_id=$1 AND read_at IS NULL', [userId]);

module.exports = { notify, list, markAllRead };
