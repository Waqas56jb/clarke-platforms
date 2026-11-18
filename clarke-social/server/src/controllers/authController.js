const authService = require('../services/authService');
const { isEmailConfigured } = require('../services/emailService');
const { signSession, signScoped } = require('../utils/tokens');
const { setSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');
const { toAccount } = require('../utils/serializers');
const { issueCsrfToken } = require('../middleware/csrf');

function csrf(req, res) {
  res.json({ csrfToken: issueCsrfToken(req, res), emailConfigured: isEmailConfigured() });
}

async function register(req, res) {
  const { user, verificationRequired } = await authService.register(req.body || {});
  if (verificationRequired)
    return res.status(201).json({
      verificationRequired: true,
      message: `We sent a verification link to ${user.email}. Open it to finish creating your account.`,
    });
  setSessionCookie(res, signSession(user));
  res.status(201).json({ user: toAccount(user), verificationRequired: false });
}

async function login(req, res) {
  const user = await authService.login(req.body || {});
  setSessionCookie(res, signSession(user));
  res.json({ user: toAccount(user) });
}

function logout(_req, res) {
  clearSessionCookie(res);
  res.json({ ok: true });
}

async function verifyEmail(req, res) {
  const user = await authService.verifyEmail(req.body?.token);
  setSessionCookie(res, signSession(user));
  res.json({ user: toAccount(user), message: 'Your email is verified. Welcome to Clarke!' });
}

const GENERIC_EMAIL_REPLY = 'If that address belongs to a Clarke account, we have sent an email to it.';

async function resendVerification(req, res) {
  await authService.resendVerification(req.body?.email);
  res.json({ message: GENERIC_EMAIL_REPLY });
}

async function forgotPassword(req, res) {
  await authService.forgotPassword(req.body?.email);
  res.json({ message: GENERIC_EMAIL_REPLY });
}

async function resetPassword(req, res) {
  const user = await authService.resetPassword(req.body?.token, req.body?.password);
  setSessionCookie(res, signSession(user));
  res.json({ user: toAccount(user), message: 'Your password has been changed.' });
}

// Short-lived token for the direct Socket.IO connection to the API host.
function socketToken(req, res) {
  res.json({ token: signScoped(req.user.id, 'socket', 120) });
}

module.exports = {
  csrf,
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  socketToken,
};
