const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (user) => jwt.sign({ sub: user.id, username: user.username }, env.jwtKey, { expiresIn: '7d' });
const verifyToken = (token) => jwt.verify(token, env.jwtKey);

module.exports = { signToken, verifyToken };
