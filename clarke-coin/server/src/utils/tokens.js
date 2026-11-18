const jwt = require('jsonwebtoken');
const env = require('../config/env');

const ALGORITHM = 'HS256';
const ISSUER = 'clarke-coin-api';

const createAccessToken = (subject) =>
  jwt.sign({ sub: subject }, env.jwtSecret, {
    algorithm: ALGORITHM,
    expiresIn: env.accessTokenMinutes * 60,
    issuer: ISSUER,
  });

function decodeAccessToken(token) {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: [ALGORITHM], issuer: ISSUER });
  if (typeof payload.sub !== 'string') throw new Error('Token has no subject');
  return payload.sub;
}

module.exports = { createAccessToken, decodeAccessToken };
