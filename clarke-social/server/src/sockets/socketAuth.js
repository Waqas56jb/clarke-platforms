// The browser connects straight to the API host (WebSockets cannot pass through the website proxy), so it
// authenticates with a short-lived token from GET /api/auth/socket-token instead of the session cookie.
const { one } = require('../db/pool');
const { verifyToken } = require('../utils/tokens');

async function socketAuth(socket, next) {
  try {
    const payload = verifyToken(String(socket.handshake.auth?.token || ''), 'socket');
    const user = await one('SELECT id, username, display_name FROM users WHERE id=$1', [payload.sub]);
    if (!user) return next(new Error('Sign in required'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Sign in required'));
  }
}

module.exports = socketAuth;
