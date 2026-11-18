// Clarke Music tracks (generated audio), playlists and likes; Clarke Movies films (generated posters
// and clips), ratings and watchlists.
const { one, query } = require('../../src/db/pool');
const musicService = require('../../src/services/musicService');
const movieService = require('../../src/services/movieService');
const { TRACKS, MOVIES } = require('./data');
const { track } = require('./audio');
const { poster } = require('./images');
const { rng, shuffle, daysAgo, store, clip, log } = require('./context');

async function seedMusic(byName, members, clarke) {
  const r = rng(89);
  const ids = [];
  for (const [i, [title, artist, owner]] of TRACKS.entries()) {
    const ownerId = byName[owner]?.user.id;
    if (!ownerId) continue;
    let row = await one('SELECT id FROM tracks WHERE owner_id=$1 AND title=$2', [ownerId, title]);
    if (!row) {
      row = await musicService.create(
        ownerId,
        { title, artist, rights: 'original', declaration: 'true' },
        { audio: store(track(i + 1), 'wav', 'audio/wav') }
      );
      await query('UPDATE tracks SET created_at=$2 WHERE id=$1', [row.id, daysAgo(28 - i * 2)]);
    }
    ids.push(row.id);
  }

  for (const id of ids) {
    const fans = shuffle(r, members).slice(0, 3 + Math.floor(r() * 12));
    for (const m of fans)
      if (!(await one('SELECT 1 FROM track_likes WHERE user_id=$1 AND track_id=$2', [m.user.id, id])))
        await musicService.toggleLike(m.user.id, id);
  }
  for (const id of ids.slice(0, 5))
    if (!(await one('SELECT 1 FROM track_likes WHERE user_id=$1 AND track_id=$2', [clarke.id, id])))
      await musicService.toggleLike(clarke.id, id);

  const playlists = [
    ['Beach Vibes', [0, 3, 9, 10]],
    ['Focus Flow', [2, 9, 11]],
  ];
  for (const [name, picks] of playlists) {
    let list = await one('SELECT id FROM playlists WHERE user_id=$1 AND name=$2', [clarke.id, name]);
    if (!list) list = await musicService.createPlaylist(clarke.id, name);
    await query('UPDATE playlists SET is_demo=true WHERE id=$1', [list.id]);
    for (const p of picks) if (ids[p]) await musicService.addToPlaylist(clarke.id, list.id, ids[p]);
  }
  log(`music ready: ${ids.length} tracks, ${playlists.length} playlists for clarke_demo`);
  return ids;
}

async function seedMovies(byName, members, clarke) {
  const r = rng(97);
  const ids = [];
  for (const [i, [title, genre, access, price, label, owner, description]] of MOVIES.entries()) {
    const ownerId = byName[owner]?.user.id;
    if (!ownerId) continue;
    let row = await one('SELECT id FROM movies WHERE owner_id=$1 AND title=$2', [ownerId, title]);
    if (!row) {
      row = await movieService.create(
        ownerId,
        { title, genre, access, price: String(price), label, description, declaration: 'true' },
        {
          poster: store(poster(i + 1), 'png', 'image/png'),
          trailer: store(clip(i + 2), 'mp4', 'video/mp4'),
          video: store(clip(i), 'mp4', 'video/mp4', { private: true }),
        }
      );
      await query('UPDATE movies SET created_at=$2 WHERE id=$1', [row.id, daysAgo(25 - i * 3)]);
    }
    ids.push(row.id);
  }

  for (const id of ids)
    for (const m of shuffle(r, members).slice(0, 4 + Math.floor(r() * 10)))
      await movieService.rate(m.user.id, id, 6 + Math.floor(r() * 5));
  for (const id of ids.slice(1, 4))
    if (!(await one('SELECT 1 FROM movie_watchlist WHERE user_id=$1 AND movie_id=$2', [clarke.id, id])))
      await movieService.toggleWatchlist(clarke.id, id);
  log(`movies ready: ${ids.length} films`);
  return ids;
}

module.exports = { seedMusic, seedMovies };
