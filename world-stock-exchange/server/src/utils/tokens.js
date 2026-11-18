const jwt = require('jsonwebtoken');
const env = require('../config/env');

const SESSION_TTL = '7d';

// Session cookie token. `tv` must match users.token_version, so a password reset ends old sessions.
const signSession = (user) =>
  jwt.sign({ sub: user.id, tv: user.token_version, typ: 'session' }, env.jwtKey, { expiresIn: SESSION_TTL });

// Short-lived tokens for requests that go straight to the API host instead of through the website
// (Socket.IO, uploads, signed file links), where the session cookie is not available.
const signScoped = (userId, typ, ttlSeconds, extra = {}) =>
  jwt.sign({ sub: userId, typ, ...extra }, env.jwtKey, { expiresIn: ttlSeconds });

function verifyToken(token, typ) {
  const payload = jwt.verify(token, env.jwtKey);
  if (payload.typ !== typ) throw new Error('Wrong token type');
  return payload;
}

module.exports = { signSession, signScoped, verifyToken };
