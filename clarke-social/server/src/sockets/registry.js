// Lets services push real-time events to a member's connected browsers without importing the server.
let io = null;

const setIo = (instance) => {
  io = instance;
};

function emitToUser(userId, event, payload) {
  if (io) io.to(`user:${Number(userId)}`).emit(event, payload);
}

module.exports = { setIo, emitToUser };
