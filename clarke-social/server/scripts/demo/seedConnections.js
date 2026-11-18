// Clarke Dating profiles, likes and matches; clarke_demo's conversations; call history.
const { one, query } = require('../../src/db/pool');
const datingService = require('../../src/services/datingService');
const messageService = require('../../src/services/messageService');
const callService = require('../../src/services/callService');
const { INTERESTS, CONVERSATIONS } = require('./data');
const { scene } = require('./images');
const { rng, pick, hoursAgo, store, log } = require('./context');
const { follow } = require('./seedUsers');

const DATING_COUNT = 26;
const MATCHES = ['keisha_joseph', 'andre_baptiste', 'malik_celestine', 'sofia_ramirez', 'liam_oconnor'];
const LIKES_WAITING = ['dwayne_francis', 'chen_wei', 'grace_mensah'];

// Dating cards show an https image URL, so photos are served from the API's public /uploads address.
function datingPhoto(seed, mediaOrigin) {
  if (!mediaOrigin) return '';
  const { stored } = store(scene(seed, 600, 800), 'png', 'image/png');
  return `${mediaOrigin}${stored}`;
}

async function seedDating(members, byName, clarke, mediaOrigin) {
  const r = rng(71);
  for (const [i, m] of members.slice(0, DATING_COUNT).entries()) {
    const interests = pick(r, INTERESTS);
    if (await one('SELECT 1 FROM dating_profiles WHERE user_id=$1', [m.user.id])) continue;
    const [, , location, bio, gender, interestedIn, year] = m.meta;
    await datingService.saveProfile(m.user.id, {
      birthDate: `${year}-${String(1 + (i % 12)).padStart(2, '0')}-${String(3 + (i % 25)).padStart(2, '0')}`,
      gender,
      interestedIn,
      location,
      bio: bio.replace(/ 📍.*$/, ''),
      interests,
      photoUrl: datingPhoto(200 + i, mediaOrigin),
    });
  }

  if (!(await one('SELECT 1 FROM dating_profiles WHERE user_id=$1', [clarke.id]))) {
    await datingService.saveProfile(clarke.id, {
      birthDate: '1995-05-14',
      gender: 'Woman',
      interestedIn: 'Everyone',
      location: "St. George's, Grenada",
      bio: 'New to Clarke Dating. Beach walks, good food and great conversation.',
      interests: 'Music, beaches, cooking',
      photoUrl: datingPhoto(260, mediaOrigin),
    });
    await query('UPDATE dating_profiles SET is_demo=true WHERE user_id=$1', [clarke.id]);
  }

  for (const name of MATCHES.filter((n) => byName[n])) {
    await datingService.like(byName[name].user.id, clarke.id);
    await datingService.like(clarke.id, byName[name].user.id);
  }
  for (const name of LIKES_WAITING.filter((n) => byName[n])) await datingService.like(byName[name].user.id, clarke.id);
  log(
    `dating ready: ${Math.min(DATING_COUNT, members.length)} profiles, ${MATCHES.length} matches, ${LIKES_WAITING.length} likes waiting`
  );
}

async function seedConversation(convo, partner, clarke, startHoursAgo) {
  const existing = await one(
    'SELECT 1 FROM messages WHERE (sender_id=$1 AND recipient_id=$2) OR (sender_id=$2 AND recipient_id=$1) LIMIT 1',
    [clarke.id, partner.id]
  );
  if (existing) {
    // Already seeded: restore the conversation's unread messages so the demo always shows some.
    if (convo.unread)
      await query(
        `UPDATE messages SET read_at=NULL WHERE id IN (SELECT id FROM messages WHERE sender_id=$1 AND recipient_id=$2
           AND is_demo ORDER BY created_at DESC LIMIT $3)`,
        [partner.id, clarke.id, convo.unread]
      );
    return false;
  }
  await follow(clarke.id, partner.id, hoursAgo(startHoursAgo + 48));
  await follow(partner.id, clarke.id, hoursAgo(startHoursAgo + 48));
  const lines = convo.lines;
  for (const [i, [who, body]] of lines.entries()) {
    const [from, to] = who === 'me' ? [clarke.id, partner.id] : [partner.id, clarke.id];
    const message = await messageService.send(from, to, body);
    const at = hoursAgo(startHoursAgo - i * 0.15);
    const unread = who === 'them' && i >= lines.length - convo.unread;
    await query(`UPDATE messages SET created_at=$2, read_at=$3, is_demo=true WHERE id=$1`, [
      message.id,
      at,
      unread ? null : new Date(at.getTime() + 10 * 60 * 1000),
    ]);
  }
  return true;
}

async function seedMessages(byName, clarke) {
  let count = 0;
  for (const [i, convo] of CONVERSATIONS.entries()) {
    const partner = byName[convo.with]?.user;
    if (partner && (await seedConversation(convo, partner, clarke, 2 + i * 9))) count += 1;
  }
  log(`conversations created: ${count}`);
}

// [n, caller, callee, type, outcome, hours ago, minutes long]
const CALLS = [
  [1, 'clarke', 'keisha_joseph', 'video', 'answered', 26, 14],
  [2, 'andre_baptiste', 'clarke', 'audio', 'answered', 50, 6],
  [3, 'malik_celestine', 'clarke', 'audio', 'missed', 5, 0],
  [4, 'sofia_ramirez', 'clarke', 'video', 'declined', 74, 0],
  [5, 'clarke', 'liam_oconnor', 'audio', 'missed', 98, 0],
  [6, 'tamara_greenidge', 'clarke', 'audio', 'answered', 146, 22],
];

async function seedCalls(byName, clarke) {
  const id = (name) => (name === 'clarke' ? clarke.id : byName[name]?.user.id);
  for (const [n, caller, callee, type, outcome, ago, minutes] of CALLS) {
    const callId = `demo-call-${n}`;
    if (!id(caller) || !id(callee) || (await one('SELECT 1 FROM call_history WHERE call_id=$1', [callId]))) continue;
    await callService.startCall({ callId, caller: id(caller), callee: id(callee), type });
    if (outcome === 'answered') await callService.markAnswered({ callId });
    await callService.finishCall(callId, outcome === 'answered' ? 'ended' : outcome);
    const started = hoursAgo(ago);
    await query(`UPDATE call_history SET started_at=$2, answered_at=$3, ended_at=$4, is_demo=true WHERE call_id=$1`, [
      callId,
      started,
      outcome === 'answered' ? new Date(started.getTime() + 8000) : null,
      new Date(started.getTime() + (outcome === 'answered' ? minutes * 60000 : 30000)),
    ]);
  }
  log('call history ready');
}

module.exports = { seedDating, seedMessages, seedCalls };
