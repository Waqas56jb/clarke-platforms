// Clarke Dating: adults only, mutual matching, and member-controlled safety tools.
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { notify } = require('./notificationService');
const { isBlockedBetween, block: blockMember } = require('./blockService');
const { activePlans } = require('./membershipService');

function datingAge(birthDate) {
  const text = String(birthDate || '');
  const d = new Date(`${text}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== text)
    return -1;
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  if (
    now.getUTCMonth() < d.getUTCMonth() ||
    (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())
  )
    age--;
  return age;
}

// VIP beats Plus; free members see up to 20 profiles per discovery page.
async function datingTier(userId) {
  const plans = await activePlans(userId);
  const tier = ['dating_vip_monthly', 'dating_plus_monthly'].find((k) => plans.some((p) => p.planKey === k));
  return tier ? plans.find((p) => p.planKey === tier) : null;
}

const getProfile = (userId) => one('SELECT * FROM dating_profiles WHERE user_id=$1', [userId]);

async function saveProfile(userId, b) {
  const age = datingAge(b.birthDate);
  if (age < 18 || age > 110)
    throw new HttpError(400, 'Clarke Dating is for adults aged 18 and over. Enter a valid date of birth.');
  const clean = (v, n) =>
    String(v || '')
      .trim()
      .slice(0, n);
  const [gender, interested, location, bio, interests, photo] = [
    clean(b.gender, 40),
    clean(b.interestedIn, 80),
    clean(b.location, 100),
    clean(b.bio, 500),
    clean(b.interests, 300),
    clean(b.photoUrl, 500),
  ];
  if (!gender || !interested || !location || !bio)
    throw new HttpError(400, 'Complete gender, who you want to meet, location and dating bio.');
  if (photo && !/^https:\/\//i.test(photo))
    throw new HttpError(400, 'Profile photo must use a secure https:// image URL.');
  await query(
    `INSERT INTO dating_profiles(user_id,birth_date,gender,interested_in,location,dating_bio,interests,photo_url)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT(user_id) DO UPDATE SET birth_date=excluded.birth_date,gender=excluded.gender,
       interested_in=excluded.interested_in,location=excluded.location,dating_bio=excluded.dating_bio,
       interests=excluded.interests,photo_url=excluded.photo_url,updated_at=now()`,
    [userId, b.birthDate, gender, interested, location, bio, interests, photo]
  );
}

async function discover(userId) {
  const me = await getProfile(userId);
  if (!me) throw new HttpError(409, 'Create your dating profile first.');
  const tier = await datingTier(userId);
  const limit = tier?.planKey === 'dating_vip_monthly' ? 60 : tier?.planKey === 'dating_plus_monthly' ? 35 : 20;
  const rows = await many(
    `SELECT d.user_id, d.birth_date, d.gender, d.interested_in, d.location, d.dating_bio, d.interests, d.photo_url,
       u.username, u.display_name,
       EXISTS(SELECT 1 FROM dating_likes l WHERE l.from_user=$1 AND l.to_user=d.user_id) liked,
       EXISTS(SELECT 1 FROM dating_likes l WHERE l.from_user=d.user_id AND l.to_user=$1) likes_you
     FROM dating_profiles d JOIN users u ON u.id=d.user_id
     WHERE d.user_id <> $1
       AND NOT EXISTS(SELECT 1 FROM dating_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=d.user_id) OR (b.blocker_id=d.user_id AND b.blocked_id=$1))
       AND NOT EXISTS(SELECT 1 FROM dating_passes p WHERE p.from_user=$1 AND p.to_user=d.user_id)
       AND (d.interested_in='Everyone' OR d.interested_in=$2)
       AND ($3='Everyone' OR $3=d.gender)
     ORDER BY d.updated_at DESC LIMIT $4`,
    [userId, me.gender, me.interested_in, limit]
  );
  return {
    profiles: rows.map(({ birth_date: birthDate, likes_you: likesYou, ...r }) => ({
      ...r,
      age: datingAge(birthDate),
      likesYou,
    })),
    tier: tier?.planKey || 'free',
    dailyLimit: limit,
  };
}

const isInvalidTarget = (userId, target) => !Number.isSafeInteger(target) || target === userId;

async function like(userId, target) {
  if (isInvalidTarget(userId, target)) throw new HttpError(400, 'Invalid member.');
  if (!(await getProfile(target))) throw new HttpError(404, 'Dating profile not found.');
  if (await isBlockedBetween(userId, target)) throw new HttpError(403, 'This connection is unavailable.');
  const inserted = await query('INSERT INTO dating_likes(from_user,to_user) VALUES($1,$2) ON CONFLICT DO NOTHING', [
    userId,
    target,
  ]);
  const matched = Boolean(await one('SELECT 1 FROM dating_likes WHERE from_user=$1 AND to_user=$2', [target, userId]));
  if (matched && inserted.rowCount) {
    await notify(target, userId, 'match');
    await notify(userId, target, 'match');
  }
  return { liked: true, matched };
}

// Passing hides the profile from this member's discovery. It does not notify the other member or undo a like.
async function pass(userId, target) {
  if (isInvalidTarget(userId, target)) throw new HttpError(400, 'Invalid member.');
  if (!(await getProfile(target))) throw new HttpError(404, 'Dating profile not found.');
  await query('INSERT INTO dating_passes(from_user,to_user) VALUES($1,$2) ON CONFLICT DO NOTHING', [userId, target]);
}

function matches(userId) {
  return many(
    `SELECT u.id, u.username, u.display_name, u.avatar, d.photo_url, d.location
     FROM dating_likes a JOIN dating_likes b ON b.from_user=a.to_user AND b.to_user=a.from_user
     JOIN users u ON u.id=a.to_user LEFT JOIN dating_profiles d ON d.user_id=u.id
     WHERE a.from_user=$1
       AND NOT EXISTS(SELECT 1 FROM dating_blocks x WHERE (x.blocker_id=$1 AND x.blocked_id=u.id) OR (x.blocker_id=u.id AND x.blocked_id=$1))
     ORDER BY GREATEST(a.created_at, b.created_at) DESC`,
    [userId]
  );
}

const block = (userId, target) => blockMember(userId, target);

async function report(userId, target, reasonInput) {
  const reason = String(reasonInput || '')
    .trim()
    .slice(0, 500);
  if (isInvalidTarget(userId, target) || !reason)
    throw new HttpError(400, 'Choose a member and provide a report reason.');
  if (!(await one('SELECT id FROM users WHERE id=$1', [target]))) throw new HttpError(404, 'Member not found.');
  await query('INSERT INTO dating_reports(reporter_id,reported_id,reason) VALUES($1,$2,$3)', [userId, target, reason]);
}

module.exports = { datingTier, getProfile, saveProfile, discover, like, pass, matches, block, report };
