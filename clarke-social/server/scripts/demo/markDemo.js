// Flags seeded rows with is_demo. Demo members only ever act through this seed, so anything they
// created is demo data; rows clarke_demo created during the seed are the ones that point at demo
// members or demo content. Payments, memberships, rentals, calls, clarke_demo's own posts and
// playlists are flagged when they are inserted.
const { one, query } = require('../../src/db/pool');

const DEMO_USERS = '(SELECT id FROM users WHERE is_demo)';
const DEMO_POSTS = '(SELECT id FROM posts WHERE is_demo)';

function statements(clarkeId) {
  const c = Number(clarkeId);
  return [
    `UPDATE follows SET is_demo=true WHERE follower_id IN ${DEMO_USERS} OR (follower_id=${c} AND following_id IN ${DEMO_USERS})`,
    `UPDATE posts SET is_demo=true WHERE user_id IN ${DEMO_USERS}`,
    ...['likes', 'comments', 'saved_posts', 'post_shares'].map(
      (t) =>
        `UPDATE ${t} SET is_demo=true WHERE user_id IN ${DEMO_USERS} OR (user_id=${c} AND post_id IN ${DEMO_POSTS})`
    ),
    `UPDATE stories SET is_demo=true WHERE user_id IN ${DEMO_USERS}`,
    `UPDATE notifications SET is_demo=true WHERE actor_id IN ${DEMO_USERS} OR (actor_id=${c} AND user_id IN ${DEMO_USERS})`,
    `UPDATE messages SET is_demo=true WHERE sender_id IN ${DEMO_USERS}`,
    `UPDATE dating_profiles SET is_demo=true WHERE user_id IN ${DEMO_USERS}`,
    `UPDATE dating_likes SET is_demo=true WHERE from_user IN ${DEMO_USERS} OR (from_user=${c} AND to_user IN ${DEMO_USERS})`,
    `UPDATE tracks SET is_demo=true WHERE owner_id IN ${DEMO_USERS}`,
    `UPDATE track_likes SET is_demo=true WHERE user_id IN ${DEMO_USERS} OR (user_id=${c} AND track_id IN (SELECT id FROM tracks WHERE is_demo))`,
    `UPDATE playlists SET is_demo=true WHERE user_id IN ${DEMO_USERS}`,
    `UPDATE playlist_tracks SET is_demo=true WHERE playlist_id IN (SELECT id FROM playlists WHERE is_demo)`,
    `UPDATE movies SET is_demo=true WHERE owner_id IN ${DEMO_USERS}`,
    ...['movie_watchlist', 'movie_ratings'].map(
      (t) =>
        `UPDATE ${t} SET is_demo=true WHERE user_id IN ${DEMO_USERS} OR (user_id=${c} AND movie_id IN (SELECT id FROM movies WHERE is_demo))`
    ),
  ];
}

async function markDemo(clarkeId) {
  for (const sql of statements(clarkeId)) await query(sql);
}

const DEMO_TABLES = [
  'users',
  'follows',
  'posts',
  'likes',
  'comments',
  'saved_posts',
  'post_shares',
  'stories',
  'notifications',
  'messages',
  'payments',
  'memberships',
  'dating_profiles',
  'dating_likes',
  'call_history',
  'tracks',
  'track_likes',
  'playlists',
  'playlist_tracks',
  'movies',
  'movie_watchlist',
  'movie_ratings',
  'movie_rentals',
];

// Rows currently flagged as demo data, per table.
async function countDemo() {
  const counts = {};
  for (const t of DEMO_TABLES) counts[t] = (await one(`SELECT COUNT(*)::int n FROM ${t} WHERE is_demo`)).n;
  return counts;
}

module.exports = { markDemo, countDemo };
