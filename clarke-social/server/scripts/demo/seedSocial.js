// Posts (text, photo, video), likes, comments, saves, shares and active stories.
const { one, many, query } = require('../../src/db/pool');
const postService = require('../../src/services/postService');
const storyService = require('../../src/services/storyService');
const { TEXT_POSTS, PHOTO_CAPTIONS, VIDEO_CAPTIONS, COMMENTS, STORY_CAPTIONS, OWN_POSTS } = require('./data');
const { scene } = require('./images');
const { rng, pick, shuffle, hoursAgo, store, clip, log } = require('./context');

const FEELINGS = ['happy', 'grateful', 'excited', 'blessed', 'relaxed', 'proud', 'motivated', ''];

function planPosts(members) {
  const r = rng(23);
  const author = (i, step) => members[(i * step + 3) % members.length];
  const plan = [
    ...TEXT_POSTS.map((body, i) => ({ body, kind: 'text', member: author(i, 7) })),
    ...PHOTO_CAPTIONS.map((body, i) => ({ body, kind: 'photo', member: author(i, 11), art: i })),
    ...VIDEO_CAPTIONS.map((body, i) => ({ body, kind: 'video', member: author(i, 13), art: i })),
  ].map((p) => ({ ...p, at: hoursAgo(2 + r() * 24 * 30), feeling: r() < 0.25 ? pick(r, FEELINGS) : '' }));
  // Oldest first: the feed orders by id, so ids must follow the dates.
  return plan.sort((a, b) => a.at - b.at);
}

function mediaFor(post) {
  if (post.kind === 'photo') return store(scene(post.art + 1), 'png', 'image/png');
  if (post.kind === 'video') return store(clip(post.art), 'mp4', 'video/mp4');
  return undefined;
}

async function createPost(userId, post) {
  const existing = await one('SELECT id, created_at FROM posts WHERE user_id=$1 AND body=$2', [userId, post.body]);
  if (existing) return existing;
  const created = await postService.createPost(
    userId,
    { body: post.body, feeling: post.feeling, allowDownload: String(post.kind === 'video' && post.art % 3 === 0) },
    mediaFor(post)
  );
  await query('UPDATE posts SET created_at=$2 WHERE id=$1', [created.id, post.at]);
  return { id: created.id, created_at: post.at, isNew: true };
}

async function seedPosts(members, clarke) {
  const posts = [];
  for (const p of planPosts(members))
    posts.push({ ...(await createPost(p.member.user.id, p)), userId: p.member.user.id });
  const own = [];
  for (const [i, p] of OWN_POSTS.entries()) {
    const post = await createPost(clarke.id, { ...p, art: 40 + i, at: hoursAgo(24 * (20 - i * 5) + 3), feeling: '' });
    await query('UPDATE posts SET is_demo=true WHERE id=$1', [post.id]);
    own.push({ ...post, userId: clarke.id });
  }
  log(`posts ready: ${posts.length} member posts, ${own.length} for clarke_demo`);
  return [...posts, ...own];
}

async function seedReactions(posts, members, clarke) {
  const r = rng(37);
  const people = members.map((m) => m.user.id);
  for (const post of posts) {
    const likers = shuffle(
      r,
      people.filter((id) => id !== post.userId)
    ).slice(0, Math.floor(r() * 22) + 2);
    if (post.userId !== clarke.id && r() < 0.25) likers.push(clarke.id);
    for (const id of likers) {
      if (!(await one('SELECT 1 FROM likes WHERE user_id=$1 AND post_id=$2', [id, post.id])))
        await postService.toggleLike(id, post.id);
    }

    const commenters =
      r() < 0.65
        ? shuffle(
            r,
            people.filter((id) => id !== post.userId)
          ).slice(0, 1 + Math.floor(r() * 4))
        : [];
    for (const id of commenters) {
      // Draw every random value before the existence check so re-runs follow the same sequence.
      const body = pick(r, COMMENTS);
      const at = new Date(Math.min(Date.now(), new Date(post.created_at).getTime() + r() * 36 * 3600 * 1000));
      if (await one('SELECT 1 FROM comments WHERE user_id=$1 AND post_id=$2 AND body=$3', [id, post.id, body]))
        continue;
      const c = await postService.addComment(id, post.id, body);
      await query('UPDATE comments SET created_at=$2 WHERE id=$1', [c.id, at]);
    }

    const savers = shuffle(r, people).slice(0, Math.floor(r() * 3));
    if (post.userId !== clarke.id && r() < 0.08) savers.push(clarke.id);
    for (const id of savers) {
      if (!(await one('SELECT 1 FROM saved_posts WHERE user_id=$1 AND post_id=$2', [id, post.id])))
        await postService.toggleSave(id, post.id);
    }

    const sharer = pick(r, people);
    if (r() < 0.3 && !(await one('SELECT 1 FROM post_shares WHERE user_id=$1 AND post_id=$2', [sharer, post.id])))
      await postService.recordShare(sharer, post.id);
  }
  log('likes, comments, saves and shares ready');
}

// Stories last 24 hours, so every run tops up members whose demo stories have expired.
async function seedStories(members) {
  const r = rng(53);
  let created = 0;
  for (const [i, m] of members.slice(0, 14).entries()) {
    const active = await many('SELECT id FROM stories WHERE user_id=$1 AND expires_at > now()', [m.user.id]);
    if (active.length) continue;
    const count = 1 + (i % 2);
    for (let k = 0; k < count; k++) {
      const media =
        i % 4 === 3 && k === 0
          ? store(clip(i + k), 'mp4', 'video/mp4')
          : store(scene(100 + i * 3 + k, 720, 1280), 'png', 'image/png');
      const { id } = await storyService.create(m.user.id, pick(r, STORY_CAPTIONS), media);
      const at = hoursAgo(1 + r() * 18);
      await query("UPDATE stories SET created_at=$2, expires_at=$2::timestamptz + interval '24 hours' WHERE id=$1", [
        id,
        at,
      ]);
      created += 1;
    }
  }
  log(`stories created: ${created}`);
}

module.exports = { seedPosts, seedReactions, seedStories };
