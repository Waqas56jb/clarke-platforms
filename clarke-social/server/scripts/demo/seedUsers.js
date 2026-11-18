// Demo members (each with its own random password and a generated avatar) and the follow graph.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { one, query } = require('../../src/db/pool');
const userService = require('../../src/services/userService');
const { MEMBERS } = require('./data');
const { avatar } = require('./images');
const { rng, shuffle, daysAgo, store, log } = require('./context');

// Inserted directly (same hashing as registration) rather than through authService.register,
// which would send a verification email once email is configured. Demo members never sign in.
async function createMember([username, displayName, location, bio], index) {
  const existing = await one('SELECT * FROM users WHERE username=$1', [username]);
  if (existing && !existing.is_demo) {
    log(`skipped ${username}: a real account already uses this username`);
    return null;
  }
  let user = existing;
  if (!user) {
    const password = crypto.randomBytes(24).toString('base64url');
    user = await one(
      `INSERT INTO users(username,email,password_hash,display_name,bio,is_demo,created_at)
       VALUES($1,$2,$3,$4,$5,true,$6) RETURNING *`,
      [
        username,
        `${username}@demo.clarke.invalid`,
        await bcrypt.hash(password, 12),
        displayName,
        `${bio} 📍 ${location}`,
        daysAgo(40 + index * 3),
      ]
    );
  }
  if (!user.avatar) user = await userService.setAvatar(user, store(avatar(index + 1), 'png', 'image/png'));
  return user;
}

async function follow(from, to, when) {
  const exists = await one('SELECT 1 FROM follows WHERE follower_id=$1 AND following_id=$2', [from, to]);
  if (exists) return;
  await userService.toggleFollow(from, to);
  await query('UPDATE follows SET created_at=$3 WHERE follower_id=$1 AND following_id=$2', [from, to, when]);
}

async function seedUsers(clarke) {
  const members = [];
  for (const [i, row] of MEMBERS.entries()) {
    const user = await createMember(row, i);
    if (user) members.push({ user, username: row[0], meta: row, index: i });
  }
  log(`members ready: ${members.length}`);

  const r = rng(11);
  for (const m of members) {
    const others = shuffle(
      r,
      members.filter((o) => o !== m)
    ).slice(0, 8 + Math.floor(r() * 7));
    for (const o of others) await follow(m.user.id, o.user.id, daysAgo(1 + r() * 30));
  }
  // Most members follow clarke_demo; clarke_demo follows most of them back (mutual follows can message).
  for (const [i, m] of members.entries()) {
    if (i % 8 === 7) continue;
    await follow(m.user.id, clarke.id, daysAgo(1 + r() * 28));
    if (i % 9 !== 4) await follow(clarke.id, m.user.id, daysAgo(r() * 25));
  }
  log('follow graph ready');

  const byName = Object.fromEntries(members.map((m) => [m.username, m]));
  return { members, byName };
}

module.exports = { seedUsers, follow };
