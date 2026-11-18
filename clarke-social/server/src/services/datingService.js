// Clarke Dating: adults only, mutual matching, and member-controlled safety tools.
const db = require('../db/connection');
const HttpError = require('../utils/httpError');

function datingAge(birthDate) {
  const d = new Date(`${birthDate}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(String(birthDate)) ||
    Number.isNaN(d.getTime()) ||
    d.toISOString().slice(0, 10) !== birthDate
  )
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

function datingTier(userId) {
  return (
    db
      .prepare("SELECT plan_key,status FROM dating_subscriptions WHERE user_id=? AND status IN ('active','trialing')")
      .get(userId) || null
  );
}

function getProfile(userId) {
  return db.prepare('SELECT * FROM dating_profiles WHERE user_id=?').get(userId) || null;
}

function saveProfile(userId, b) {
  const age = datingAge(b.birthDate);
  if (age < 18 || age > 110)
    throw new HttpError(400, 'Clarke Dating is for adults aged 18 and over. Enter a valid date of birth.');
  const gender = String(b.gender || '')
    .trim()
    .slice(0, 40);
  const interested = String(b.interestedIn || '')
    .trim()
    .slice(0, 80);
  const location = String(b.location || '')
    .trim()
    .slice(0, 100);
  const bio = String(b.bio || '')
    .trim()
    .slice(0, 500);
  const interests = String(b.interests || '')
    .trim()
    .slice(0, 300);
  const photo = String(b.photoUrl || '')
    .trim()
    .slice(0, 500);
  if (!gender || !interested || !location || !bio)
    throw new HttpError(400, 'Complete gender, who you want to meet, location and dating bio.');
  if (photo && !/^https:\/\//i.test(photo))
    throw new HttpError(400, 'Profile photo must use a secure https:// image URL.');
  db.prepare(
    `INSERT INTO dating_profiles(user_id,birth_date,gender,interested_in,location,dating_bio,interests,photo_url) VALUES(?,?,?,?,?,?,?,?)
  ON CONFLICT(user_id) DO UPDATE SET birth_date=excluded.birth_date,gender=excluded.gender,interested_in=excluded.interested_in,location=excluded.location,dating_bio=excluded.dating_bio,interests=excluded.interests,photo_url=excluded.photo_url,updated_at=CURRENT_TIMESTAMP`
  ).run(userId, b.birthDate, gender, interested, location, bio, interests, photo);
}

function discover(userId) {
  const me = getProfile(userId);
  if (!me) throw new HttpError(409, 'Create your dating profile first.');
  const tier = datingTier(userId);
  const limit = tier?.plan_key === 'dating_vip_monthly' ? 60 : tier?.plan_key === 'dating_plus_monthly' ? 35 : 20;
  const rows = db
    .prepare(
      `SELECT d.user_id,d.birth_date,d.gender,d.interested_in,d.location,d.dating_bio,d.interests,d.photo_url,u.username,u.display_name,
    EXISTS(SELECT 1 FROM dating_likes l WHERE l.from_user=? AND l.to_user=d.user_id) AS liked,
    EXISTS(SELECT 1 FROM dating_likes l WHERE l.from_user=d.user_id AND l.to_user=?) AS likes_you
    FROM dating_profiles d JOIN users u ON u.id=d.user_id
    WHERE d.user_id!=? AND NOT EXISTS(SELECT 1 FROM dating_blocks b WHERE (b.blocker_id=? AND b.blocked_id=d.user_id) OR (b.blocker_id=d.user_id AND b.blocked_id=?))
    AND (d.interested_in='Everyone' OR d.interested_in=?)
    AND (?='Everyone' OR ?=d.gender)
    ORDER BY d.updated_at DESC LIMIT ?`
    )
    .all(userId, userId, userId, userId, userId, me.gender, me.interested_in, me.interested_in, limit);
  return {
    profiles: rows.map((r) => ({
      ...r,
      birth_date: undefined,
      age: datingAge(r.birth_date),
      liked: !!r.liked,
      likesYou: !!r.likes_you,
    })),
    tier: tier?.plan_key || 'free',
    dailyLimit: limit,
  };
}

const isInvalidTarget = (userId, target) => !Number.isSafeInteger(target) || target === userId;

function like(userId, target) {
  if (isInvalidTarget(userId, target)) throw new HttpError(400, 'Invalid member.');
  if (!db.prepare('SELECT user_id FROM dating_profiles WHERE user_id=?').get(target))
    throw new HttpError(404, 'Dating profile not found.');
  if (
    db
      .prepare('SELECT 1 FROM dating_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)')
      .get(userId, target, target, userId)
  )
    throw new HttpError(403, 'This connection is unavailable.');
  const existing = db.prepare('SELECT 1 FROM dating_likes WHERE from_user=? AND to_user=?').get(userId, target);
  if (!existing) db.prepare('INSERT INTO dating_likes(from_user,to_user) VALUES(?,?)').run(userId, target);
  const matched = !!db.prepare('SELECT 1 FROM dating_likes WHERE from_user=? AND to_user=?').get(target, userId);
  return { liked: true, matched };
}

function matches(userId) {
  return db
    .prepare(
      `SELECT u.id,u.username,u.display_name,d.photo_url,d.location FROM dating_likes a JOIN dating_likes b ON b.from_user=a.to_user AND b.to_user=a.from_user JOIN users u ON u.id=a.to_user LEFT JOIN dating_profiles d ON d.user_id=u.id WHERE a.from_user=? ORDER BY a.created_at DESC`
    )
    .all(userId);
}

function block(userId, target) {
  if (isInvalidTarget(userId, target)) throw new HttpError(400, 'Invalid member.');
  db.prepare('INSERT OR IGNORE INTO dating_blocks(blocker_id,blocked_id) VALUES(?,?)').run(userId, target);
  db.prepare('DELETE FROM dating_likes WHERE (from_user=? AND to_user=?) OR (from_user=? AND to_user=?)').run(
    userId,
    target,
    target,
    userId
  );
}

function report(userId, target, reasonInput) {
  const reason = String(reasonInput || '')
    .trim()
    .slice(0, 500);
  if (isInvalidTarget(userId, target) || !reason)
    throw new HttpError(400, 'Choose a member and provide a report reason.');
  db.prepare('INSERT INTO dating_reports(reporter_id,reported_id,reason) VALUES(?,?,?)').run(userId, target, reason);
}

module.exports = { datingTier, getProfile, saveProfile, discover, like, matches, block, report };
