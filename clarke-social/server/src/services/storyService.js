// Stories disappear 24 hours after posting: hidden from queries immediately and deleted (with their
// files) by an hourly clean-up.
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');
const { iso } = require('../utils/serializers');

async function listActive() {
  const rows = await many(
    `SELECT s.id, s.media_path, s.media_type, s.caption, s.created_at, s.expires_at,
            u.id user_id, u.username, u.display_name, u.avatar
     FROM stories s JOIN users u ON u.id=s.user_id
     WHERE s.expires_at > now() ORDER BY s.created_at ASC`
  );
  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.user_id))
      byUser.set(r.user_id, {
        user: { id: r.user_id, username: r.username, displayName: r.display_name, avatar: r.avatar },
        stories: [],
      });
    byUser.get(r.user_id).stories.push({
      id: r.id,
      mediaUrl: r.media_path,
      mediaType: r.media_type,
      caption: r.caption,
      createdAt: iso(r.created_at),
      expiresAt: iso(r.expires_at),
    });
  }
  // Most recently updated story rings first.
  return [...byUser.values()].sort((a, b) => b.stories.at(-1).createdAt.localeCompare(a.stories.at(-1).createdAt));
}

async function create(userId, caption, upload) {
  if (!upload) throw new HttpError(400, 'Choose a photo or video for your story.');
  return one(
    `INSERT INTO stories(user_id,media_path,media_type,caption,expires_at)
     VALUES($1,$2,$3,$4, now() + interval '24 hours') RETURNING id`,
    [
      userId,
      upload.stored,
      upload.type,
      String(caption || '')
        .trim()
        .slice(0, 200),
    ]
  );
}

async function remove(userId, storyId) {
  const row = await one('DELETE FROM stories WHERE id=$1 AND user_id=$2 RETURNING media_path', [storyId, userId]);
  if (!row) throw new HttpError(404, 'Story not found.');
  await removeStored(row.media_path);
}

async function deleteExpired() {
  const { rows } = await query('DELETE FROM stories WHERE expires_at <= now() RETURNING media_path');
  await removeStored(...rows.map((r) => r.media_path));
}

module.exports = { listActive, create, remove, deleteExpired };
