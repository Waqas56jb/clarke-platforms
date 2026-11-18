// One-to-one WebRTC signalling. Audio/video media is never relayed through Socket.IO.
// Deploy behind HTTPS and configure TURN for reliable NAT traversal before production.
const calls = require('../services/callService');

const CALL_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function registerCallHandlers(io, socket) {
  const userId = Number(socket.user.sub);
  const toUser = (id) => io.to(`user:${id}`);

  socket.on('call:invite', ({ to, offer, callType, callId: requestedCallId } = {}) => {
    if (!calls.withinRateLimit(userId))
      return socket.emit('call:error', { message: 'Too many call attempts. Please wait a moment.' });
    const target = Number(to);
    if (
      !Number.isSafeInteger(target) ||
      target < 1 ||
      target === userId ||
      !offer ||
      !['audio', 'video'].includes(callType) ||
      !CALL_ID_PATTERN.test(String(requestedCallId || ''))
    )
      return socket.emit('call:error', { message: 'Invalid call request.' });
    if (!calls.userExists(target))
      return socket.emit('call:error', { message: 'That Clarke member could not be found.' });
    if (calls.isAnyoneBusy(userId, target))
      return socket.emit('call:error', { message: 'One of the members is already in a call.' });
    const callId = String(requestedCallId);
    if (calls.activeCalls.has(callId))
      return socket.emit('call:error', { message: 'That call request has already been used.' });
    calls.startCall({ callId, caller: userId, callee: target, type: callType });
    toUser(target).emit('call:incoming', { from: userId, username: socket.user.username, offer, callType, callId });
    socket.emit('call:ringing', { callId, to: target });
  });

  socket.on('call:answer', ({ to, answer, callId } = {}) => {
    const call = calls.activeCalls.get(String(callId || ''));
    if (!call || call.callee !== userId || call.caller !== Number(to) || !answer) return;
    calls.markAnswered(call);
    toUser(call.caller).emit('call:answered', { from: userId, answer, callId: call.callId });
  });

  socket.on('call:ice', ({ to, candidate, callId } = {}) => {
    const call = calls.activeCalls.get(String(callId || ''));
    if (!call || !candidate || !calls.isCallParticipant(call, userId)) return;
    const other = calls.otherParty(call, userId);
    if (Number(to) !== other) return;
    toUser(other).emit('call:ice', { from: userId, candidate, callId: call.callId });
  });

  socket.on('call:decline', ({ to, callId } = {}) => {
    const call = calls.activeCalls.get(String(callId || ''));
    if (!call || call.callee !== userId || call.caller !== Number(to)) return;
    calls.finishCall(call.callId, 'declined');
    toUser(call.caller).emit('call:declined', { from: userId, callId: call.callId });
  });

  socket.on('call:end', ({ to, callId } = {}) => {
    const call = calls.activeCalls.get(String(callId || ''));
    if (!call || !calls.isCallParticipant(call, userId)) return;
    const other = calls.otherParty(call, userId);
    if (Number(to) !== other) return;
    calls.finishCall(call.callId, call.status === 'ringing' ? 'missed' : 'ended');
    toUser(other).emit('call:ended', { from: userId, callId: call.callId });
  });

  // Generic signalling relay carried over from the Clarke Social starter.
  socket.on('call:signal', ({ to, payload } = {}) => {
    if (!Number.isInteger(Number(to)) || !payload || typeof payload !== 'object') return;
    toUser(Number(to)).emit('call:signal', { from: userId, payload });
  });

  socket.on('disconnect', () => {
    for (const [id, call] of calls.activeCalls) {
      if (!calls.isCallParticipant(call, userId)) continue;
      const other = calls.otherParty(call, userId);
      calls.finishCall(id, call.status === 'ringing' ? 'missed' : 'ended');
      toUser(other).emit('call:ended', { from: userId, callId: id });
    }
  });
}

module.exports = registerCallHandlers;
