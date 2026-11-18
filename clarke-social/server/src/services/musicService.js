// Clarke Music: member uploads with a rights declaration, likes ("Liked Songs") and playlists.
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { removeStored } = require('../utils/storage');
const { iso } = require('../utils/serializers');

const toTrack = (r) => ({
  id: r.id,
  title: r.title,
  artist: r.artist,
  rightsCategory: r.rights_category,
  audioUrl: r.audio_path,
  ownerId: r.owner_id,
  ownerName: r.owner_name,
  likes: r.likes,
  liked: r.liked,
  createdAt: iso(r.created_at),
});

const SELECT = `SELECT t.*, u.display_name owner_name,
  (SELECT COUNT(*)::int FROM track_likes l WHERE l.track_id=t.id) likes,
  EXISTS(SELECT 1 FROM track_likes l WHERE l.track_id=t.id AND l.user_id=$1) liked
  FROM tracks t JOIN users u ON u.id=t.owner_id`;

async function catalogue(viewerId) {
  return (await many(`${SELECT} ORDER BY t.id DESC LIMIT 200`, [viewerId || 0])).map(toTrack);
}

async function create(userId, body, uploads) {
  const title = String(body.title || '')
    .trim()
    .slice(0, 120);
  const artist = String(body.artist || '')
    .trim()
    .slice(0, 120);
  if (!title || !artist) throw new HttpError(400, 'Enter the track title and the artist or rights holder.');
  if (!['original', 'licensed'].includes(body.rights)) throw new HttpError(400, 'Choose a rights category.');
  if (String(body.declaration) !== 'true') throw new HttpError(400, 'Confirm the rights declaration to upload.');
  if (!uploads.audio) throw new HttpError(400, 'Choose an audio file.');
  const row = await one(
    `INSERT INTO tracks(owner_id,title,artist,rights_category,audio_path,audio_type,proof_path)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [userId, title, artist, body.rights, uploads.audio.stored, uploads.audio.type, uploads.proof?.stored || '']
  );
  return toTrack(await one(`${SELECT} WHERE t.id=$2`, [userId, row.id]));
}

async function remove(userId, trackId) {
  const row = await one('DELETE FROM tracks WHERE id=$1 AND owner_id=$2 RETURNING audio_path, proof_path', [
    trackId,
    userId,
  ]);
  if (!row) throw new HttpError(404, 'Track not found.');
  await removeStored(row.audio_path, row.proof_path);
}

async function requireTrack(trackId) {
  if (!(await one('SELECT id FROM tracks WHERE id=$1', [trackId]))) throw new HttpError(404, 'Track not found.');
}

async function toggleLike(userId, trackId) {
  await requireTrack(trackId);
  const removed = await query('DELETE FROM track_likes WHERE user_id=$1 AND track_id=$2', [userId, trackId]);
  if (!removed.rowCount) await query('INSERT INTO track_likes(user_id,track_id) VALUES($1,$2)', [userId, trackId]);
  return { liked: !removed.rowCount };
}

async function playlists(userId) {
  const rows = await many(
    `SELECT p.id, p.name, COALESCE(array_agg(pt.track_id ORDER BY pt.added_at) FILTER (WHERE pt.track_id IS NOT NULL), '{}') track_ids
     FROM playlists p LEFT JOIN playlist_tracks pt ON pt.playlist_id=p.id
     WHERE p.user_id=$1 GROUP BY p.id ORDER BY p.id`,
    [userId]
  );
  return rows.map((r) => ({ id: r.id, name: r.name, trackIds: r.track_ids }));
}

async function createPlaylist(userId, name) {
  const clean = String(name || '')
    .trim()
    .slice(0, 60);
  if (!clean) throw new HttpError(400, 'Give your playlist a name.');
  return one('INSERT INTO playlists(user_id,name) VALUES($1,$2) RETURNING id, name', [userId, clean]);
}

async function addToPlaylist(userId, playlistId, trackId) {
  if (!(await one('SELECT id FROM playlists WHERE id=$1 AND user_id=$2', [playlistId, userId])))
    throw new HttpError(404, 'Playlist not found.');
  await requireTrack(trackId);
  await query('INSERT INTO playlist_tracks(playlist_id,track_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [
    playlistId,
    trackId,
  ]);
}

async function report(userId, trackId, reason) {
  await requireTrack(trackId);
  const text = String(reason || '')
    .trim()
    .slice(0, 300);
  if (!text) throw new HttpError(400, 'Tell us why you are reporting this track.');
  await query(`INSERT INTO reports(reporter_id,target_type,target_id,reason) VALUES($1,'track',$2,$3)`, [
    userId,
    trackId,
    text,
  ]);
}

module.exports = { catalogue, create, remove, toggleLike, playlists, createPlaylist, addToPlaylist, report };
