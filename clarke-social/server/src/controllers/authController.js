const authService = require('../services/authService');
const { signToken } = require('../utils/tokens');
const { setSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');
const { safeUser } = require('../utils/serializers');

async function register(req, res) {
  const user = await authService.register(req.body || {});
  setSessionCookie(res, signToken(user));
  res.status(201).json({ user: safeUser(user) });
}

async function login(req, res) {
  const user = await authService.login(req.body || {});
  setSessionCookie(res, signToken(user));
  res.json({ user: safeUser(user) });
}

function logout(_req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

async function registerLegacy(req, res) {
  const user = await authService.registerLegacy(req.body || {});
  res.status(201).json({ token: signToken(user), user });
}

async function loginLegacy(req, res) {
  const user = await authService.loginLegacy(req.body || {});
  res.json({ token: signToken(user), user });
}

module.exports = { register, login, logout, registerLegacy, loginLegacy };
