// One-to-one WebRTC signalling state. Audio/video media is never relayed through the server.
const db = require('../db/connection');
const env = require('../config/env');

const activeCalls = new Map();
const callRate = new Map();

const insertCall = db.prepare(`INSERT INTO call_history(call_id,caller_id,callee_id,call_type,status)
 VALUES(@callId,@caller,@callee,@type,@status)`);

const isCallParticipant = (call, userId) => call && (call.caller === userId || call.callee === userId);
const otherParty = (call, userId) => (call.caller === userId ? call.callee : call.caller);

function withinRateLimit(userId) {
  const now = Date.now();
  const recent = (callRate.get(userId) || []).filter((t) => now - t < 60000);
  if (recent.length >= 20) {
    callRate.set(userId, recent);
    return false;
  }
  recent.push(now);
  callRate.set(userId, recent);
  return true;
}

const userExists = (id) => !!db.prepare('SELECT id FROM users WHERE id=?').get(id);
const isAnyoneBusy = (...userIds) =>
  [...activeCalls.values()].some((c) => userIds.includes(c.caller) || userIds.includes(c.callee));

function startCall({ callId, caller, callee, type }) {
  const call = { callId, caller, callee, type, createdAt: Date.now(), status: 'ringing' };
  activeCalls.set(callId, call);
  insertCall.run({ callId, caller, callee, type, status: 'ringing' });
  return call;
}

function markAnswered(call) {
  call.status = 'answered';
  db.prepare(`UPDATE call_history SET status='answered',answered_at=CURRENT_TIMESTAMP WHERE call_id=?`).run(
    call.callId
  );
}

function finishCall(callId, status) {
  const call = activeCalls.get(callId);
  if (!call) return null;
  db.prepare(`UPDATE call_history SET status=?, ended_at=CURRENT_TIMESTAMP WHERE call_id=?`).run(status, callId);
  activeCalls.delete(callId);
  return call;
}

// Browser receives only configured ICE server settings; credentials stay in environment config.
function iceConfig() {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (env.turn.url && env.turn.username && env.turn.credential)
    iceServers.push({ urls: env.turn.url, username: env.turn.username, credential: env.turn.credential });
  return { iceServers };
}

// Only the two participants can see each record.
function history(userId) {
  return db
    .prepare(
      `SELECT c.call_id,c.call_type,c.status,c.started_at,c.answered_at,c.ended_at,
    CASE WHEN c.caller_id=? THEN 'outgoing' ELSE 'incoming' END direction,
    u.id peer_id,u.username peer_username,u.display_name peer_name
    FROM call_history c JOIN users u ON u.id=CASE WHEN c.caller_id=? THEN c.callee_id ELSE c.caller_id END
    WHERE c.caller_id=? OR c.callee_id=? ORDER BY c.id DESC LIMIT 50`
    )
    .all(userId, userId, userId, userId);
}

module.exports = {
  activeCalls,
  isCallParticipant,
  otherParty,
  withinRateLimit,
  userExists,
  isAnyoneBusy,
  startCall,
  markAnswered,
  finishCall,
  iceConfig,
  history,
};
