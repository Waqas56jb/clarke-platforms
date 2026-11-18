// Deletes every row the demo seed created (is_demo = true) and the files those rows point to.
// Real members' rows are never flagged. Deleting a demo member also removes anything that only
// existed because of that member (for example a real member's like on a demo post), as with any
// account deletion. Usage: npm run remove-demo
const path = require('path');
const { many, pool, withTransaction } = require('../src/db/pool');
const migrate = require('../src/db/migrate');
const { removeStored } = require('../src/utils/storage');

// Children before parents, so every flagged row is deleted explicitly rather than by cascade.
const TABLES = [
  'notifications',
  'messages',
  'comments',
  'likes',
  'saved_posts',
  'post_shares',
  'stories',
  'follows',
  'dating_likes',
  'dating_profiles',
  'call_history',
  'playlist_tracks',
  'playlists',
  'track_likes',
  'movie_watchlist',
  'movie_ratings',
  'movie_rentals',
  'memberships',
  'payments',
  'tracks',
  'movies',
  'posts',
  'users',
];

const FILE_QUERIES = [
  `SELECT avatar AS f FROM users WHERE is_demo`,
  `SELECT media_path AS f FROM posts WHERE is_demo`,
  `SELECT media_path AS f FROM stories WHERE is_demo`,
  `SELECT unnest(ARRAY[audio_path, proof_path]) AS f FROM tracks WHERE is_demo`,
  `SELECT unnest(ARRAY[poster_path, trailer_path, video_path]) AS f FROM movies WHERE is_demo`,
];

async function demoFiles() {
  const stored = (await Promise.all(FILE_QUERIES.map((sql) => many(sql)))).flat().map((r) => r.f);
  // Dating photos are stored as full https URLs pointing at /uploads/<file>.
  const photos = await many(
    `SELECT photo_url AS f FROM dating_profiles WHERE is_demo AND photo_url LIKE '%/uploads/demo-%'`
  );
  return [...stored, ...photos.map((r) => `/uploads/${path.basename(new URL(r.f).pathname)}`)].filter(Boolean);
}

async function main() {
  await migrate();
  const files = await demoFiles();
  const counts = await withTransaction(async (client) => {
    const result = {};
    for (const table of TABLES) result[table] = (await client.query(`DELETE FROM ${table} WHERE is_demo`)).rowCount;
    return result;
  });
  await removeStored(...files);
  console.info('[demo] removed rows:', JSON.stringify(counts));
  console.info(`[demo] removed files: ${files.length}`);
}

main()
  .catch((err) => {
    console.error('[demo] removal failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
