// Signed double-submit CSRF protection. GET /api/auth/csrf sets a readable "wse_csrf" cookie whose
// value is random + "." + HMAC(random). State-changing requests must echo it in X-CSRF-Token; a
// cross-site page can neither read the cookie nor forge a valid signature.
const crypto = require('crypto');
const env = require('../config/env');
const { randomToken, safeEqual } = require('../utils/secureRandom');

const CSRF_COOKIE = 'wse_csrf';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const sign = (value) => crypto.createHmac('sha256', env.jwtKey).update(`csrf:${value}`).digest('base64url');

function isValid(token) {
  const [value, signature] = String(token || '').split('.');
  return Boolean(value && signature) && safeEqual(signature, sign(value));
}

function issueCsrfToken(req, res) {
  let token = req.cookies[CSRF_COOKIE];
  if (!isValid(token)) {
    const value = randomToken(24);
    token = `${value}.${sign(value)}`;
  }
  res.cookie(CSRF_COOKIE, token, { httpOnly: false, secure: env.isProduction, sameSite: 'lax', path: '/' });
  return token;
}

// Upload routes authenticate with a bearer token rather than cookies, so CSRF does not apply to them.
function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method) || req.originalUrl.startsWith('/api/uploads/')) return next();
  const header = req.get('x-csrf-token');
  if (!isValid(header) || !safeEqual(header, req.cookies[CSRF_COOKIE] || ''))
    return res
      .status(403)
      .json({ error: 'Your session security check failed. Please refresh the page and try again.' });
  next();
}

module.exports = { csrfProtection, issueCsrfToken };
