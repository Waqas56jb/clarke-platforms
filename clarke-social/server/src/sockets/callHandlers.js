// One-to-one WebRTC signalling over Socket.IO. Members can call people they can message
// (mutual match or mutual follow) and never anyone who has blocked them or whom they blocked.
const calls = require('../services/callService');
const { canMessage } = require('../services/messagingRules');

const CALL_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Wraps async handlers so a database error ends the call attempt instead of crashing the process.
const safe = (socket, fn) => (payload) =>
  Promise.resolve(fn(payload || {})).catch((err) => {
    console.error('Call handler failed', err.message);
    socket.emit('call:error', { message: 'The call could not be completed. Please try again.' });
  });

function registerCallHandlers(io, socket) {
  const userId = socket.user.id;
  const toUser = (id) => io.to(`user:${id}`);

  socket.on(
    'call:invite',
    safe(socket, async ({ to, offer, callType, callId }) => {
      if (!calls.withinRateLimit(userId))
        return socket.emit('call:error', { message: 'Too many call attempts. Please wait a moment.' });
      const target = Number(to);
      if (
        !Number.isSafeInteger(target) ||
        target < 1 ||
        target === userId ||
        !offer ||
        !['audio', 'video'].includes(callType) ||
        !CALL_ID_PATTERN.test(String(callId || ''))
      )
        return socket.emit('call:error', { message: 'Invalid call request.' });
      if (!(await calls.findUser(target)))
        return socket.emit('call:error', { message: 'That Clarke member could not be found.' });
      if (!(await canMessage(userId, target)))
        return socket.emit('call:error', {
          message: 'You can call members you have matched with or who follow you back.',
        });
      if (calls.isAnyoneBusy(userId, target))
        return socket.emit('call:error', { message: 'One of the members is already in a call.' });
      if (calls.activeCalls.has(String(callId)))
        return socket.emit('call:error', { message: 'That call request has already been used.' });
      await calls.startCall({ callId: String(callId), caller: userId, callee: target, type: callType });
      toUser(target).emit('call:incoming', {
        from: userId,
        username: socket.user.username,
        displayName: socket.user.display_name,
        offer,
        callType,
        callId: String(callId),
      });
      socket.emit('call:ringing', { callId: String(callId), to: target });
    })
  );

  socket.on(
    'call:answer',
    safe(socket, async ({ to, answer, callId }) => {
      const call = calls.activeCalls.get(String(callId || ''));
      if (!call || call.callee !== userId || call.caller !== Number(to) || !answer) return;
      await calls.markAnswered(call);
      toUser(call.caller).emit('call:answered', { from: userId, answer, callId: call.callId });
    })
  );

  socket.on('call:ice', ({ to, candidate, callId } = {}) => {
    const call = calls.activeCalls.get(String(callId || ''));
    if (!call || !candidate || !calls.isCallParticipant(call, userId)) return;
    const other = calls.otherParty(call, userId);
    if (Number(to) !== other) return;
    toUser(other).emit('call:ice', { from: userId, candidate, callId: call.callId });
  });

  socket.on(
    'call:decline',
    safe(socket, async ({ to, callId }) => {
      const call = calls.activeCalls.get(String(callId || ''));
      if (!call || call.callee !== userId || call.caller !== Number(to)) return;
      await calls.finishCall(call.callId, 'declined');
      toUser(call.caller).emit('call:declined', { from: userId, callId: call.callId });
    })
  );

  socket.on(
    'call:end',
    safe(socket, async ({ to, callId }) => {
      const call = calls.activeCalls.get(String(callId || ''));
      if (!call || !calls.isCallParticipant(call, userId)) return;
      const other = calls.otherParty(call, userId);
      if (Number(to) !== other) return;
      await calls.finishCall(call.callId, call.status === 'ringing' ? 'missed' : 'ended');
      toUser(other).emit('call:ended', { from: userId, callId: call.callId });
    })
  );

  // A call ends when either side's last connection drops.
  socket.on(
    'disconnect',
    safe(socket, async () => {
      if ((await io.in(`user:${userId}`).fetchSockets()).length) return;
      for (const [id, call] of calls.activeCalls) {
        if (!calls.isCallParticipant(call, userId)) continue;
        const other = calls.otherParty(call, userId);
        await calls.finishCall(id, call.status === 'ringing' ? 'missed' : 'ended');
        toUser(other).emit('call:ended', { from: userId, callId: id });
      }
    })
  );
}

module.exports = registerCallHandlers;
