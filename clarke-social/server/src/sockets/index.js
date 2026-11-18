const { Server } = require('socket.io');
const socketAuth = require('./socketAuth');
const registerCallHandlers = require('./callHandlers');

function createSocketServer(httpServer) {
  const io = new Server(httpServer, { cors: { origin: false }, maxHttpBufferSize: 1e6 });
  io.use(socketAuth);
  io.on('connection', (socket) => {
    socket.join(`user:${Number(socket.user.sub)}`);
    registerCallHandlers(io, socket);
  });
  return io;
}

module.exports = createSocketServer;
