const { verifyToken } = require('../utils/tokens');
const { COOKIE_NAME } = require('../utils/sessionCookie');

function tokenFromCookie(cookieHeader) {
  const entry = (cookieHeader || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : '';
}

// Session cookie (browser client) or handshake auth token (starter-style clients).
function socketAuth(socket, next) {
  try {
    const token = tokenFromCookie(socket.handshake.headers.cookie) || socket.handshake.auth?.token;
    if (!token) return next(new Error('Sign in required'));
    socket.user = verifyToken(token);
    next();
  } catch {
    next(new Error('Invalid session'));
  }
}

module.exports = socketAuth;
