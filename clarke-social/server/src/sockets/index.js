const { Server } = require('socket.io');
const env = require('../config/env');
const socketAuth = require('./socketAuth');
const registerCallHandlers = require('./callHandlers');
const { setIo } = require('./registry');

// Browsers connect directly (WebSocket) from the website origin, authenticated with a short-lived token.
function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.appOrigin, credentials: false },
    maxHttpBufferSize: 1e6,
  });
  io.use(socketAuth);
  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    registerCallHandlers(io, socket);
  });
  setIo(io);
  return io;
}

module.exports = createSocketServer;
