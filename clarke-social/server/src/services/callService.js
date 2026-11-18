// One-to-one WebRTC call state. Audio/video media flows peer-to-peer (or via TURN), never through here.
const crypto = require('crypto');
const { many, one, query } = require('../db/pool');
const env = require('../config/env');
const { iso } = require('../utils/serializers');

const activeCalls = new Map();
const callRate = new Map();

const isCallParticipant = (call, userId) => call && (call.caller === userId || call.callee === userId);
const otherParty = (call, userId) => (call.caller === userId ? call.callee : call.caller);

function withinRateLimit(userId) {
  const now = Date.now();
  const recent = (callRate.get(userId) || []).filter((t) => now - t < 60000);
  const allowed = recent.length < 20;
  if (allowed) recent.push(now);
  callRate.set(userId, recent);
  return allowed;
}

const isAnyoneBusy = (...userIds) =>
  [...activeCalls.values()].some((c) => userIds.includes(c.caller) || userIds.includes(c.callee));

async function startCall({ callId, caller, callee, type }) {
  activeCalls.set(callId, { callId, caller, callee, type, status: 'ringing' });
  await query(`INSERT INTO call_history(call_id,caller_id,callee_id,call_type,status) VALUES($1,$2,$3,$4,'ringing')`, [
    callId,
    caller,
    callee,
    type,
  ]);
}

async function markAnswered(call) {
  call.status = 'answered';
  await query(`UPDATE call_history SET status='answered', answered_at=now() WHERE call_id=$1`, [call.callId]);
}

async function finishCall(callId, status) {
  const call = activeCalls.get(callId);
  if (!call) return null;
  activeCalls.delete(callId);
  await query('UPDATE call_history SET status=$1, ended_at=now() WHERE call_id=$2', [status, callId]);
  return call;
}

// STUN always; TURN when configured. With TURN_SHARED_SECRET, credentials are short-lived
// (coturn "REST API" scheme: username = expiry:userId, credential = base64(HMAC-SHA1(secret, username))).
function iceConfig(userId) {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  const { urls, username, credential, sharedSecret, ttlSeconds } = env.turn;
  if (urls.length && sharedSecret) {
    const user = `${Math.floor(Date.now() / 1000) + ttlSeconds}:${userId || 'guest'}`;
    const pass = crypto.createHmac('sha1', sharedSecret).update(user).digest('base64');
    iceServers.push({ urls, username: user, credential: pass });
  } else if (urls.length && username && credential) {
    iceServers.push({ urls, username, credential });
  }
  return { iceServers, turnConfigured: iceServers.length > 1 };
}

async function history(userId) {
  const rows = await many(
    `SELECT c.call_id, c.call_type, c.status, c.started_at, c.answered_at, c.ended_at,
       CASE WHEN c.caller_id=$1 THEN 'outgoing' ELSE 'incoming' END direction,
       u.id peer_id, u.username peer_username, u.display_name peer_name
     FROM call_history c JOIN users u ON u.id = CASE WHEN c.caller_id=$1 THEN c.callee_id ELSE c.caller_id END
     WHERE c.caller_id=$1 OR c.callee_id=$1 ORDER BY c.id DESC LIMIT 50`,
    [userId]
  );
  return rows.map((r) => ({
    ...r,
    started_at: iso(r.started_at),
    answered_at: iso(r.answered_at),
    ended_at: iso(r.ended_at),
  }));
}

const findUser = (id) => one('SELECT id, username, display_name FROM users WHERE id=$1', [id]);

module.exports = {
  activeCalls,
  isCallParticipant,
  otherParty,
  withinRateLimit,
  isAnyoneBusy,
  startCall,
  markAnswered,
  finishCall,
  iceConfig,
  history,
  findUser,
};
