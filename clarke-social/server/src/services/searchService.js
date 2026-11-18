const { many } = require('../db/pool');
const userService = require('./userService');
const postService = require('./postService');

// Members by name/username and posts by text or hashtag.
async function search(viewerId, text) {
  const q = String(text || '')
    .trim()
    .slice(0, 60);
  if (!q) return { users: [], posts: [] };
  const ids = await many(`SELECT id FROM posts WHERE body ILIKE $1 AND repost_of IS NULL ORDER BY id DESC LIMIT 20`, [
    `%${q}%`,
  ]);
  const posts = await Promise.all(ids.map((r) => postService.getPost(viewerId, r.id)));
  return { users: await userService.search(viewerId, q), posts };
}

// Most-used hashtags in the last 7 days.
async function trending() {
  return many(
    `SELECT '#' || lower(m[1]) AS tag, COUNT(*)::int AS posts
     FROM posts, regexp_matches(body, '#([A-Za-z0-9_]+)', 'g') AS m
     WHERE created_at > now() - interval '7 days'
     GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 4`
  );
}

module.exports = { search, trending };
