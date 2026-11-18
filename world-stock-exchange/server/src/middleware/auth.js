const { one } = require('../db/pool');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/tokens');
const { COOKIE_NAME } = require('../utils/sessionCookie');

// Resolves the signed-in member from the HTTP-only session cookie, or null.
async function sessionUser(req) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;
  let payload;
  try {
    payload = verifyToken(token, 'session');
  } catch {
    return null;
  }
  const user = await one('SELECT * FROM users WHERE id=$1', [payload.sub]);
  return user && user.token_version === payload.tv ? user : null;
}

const requireAuth = asyncHandler(async (req, _res, next) => {
  if (!req.cookies[COOKIE_NAME]) throw new HttpError(401, 'Please sign in.');
  const user = await sessionUser(req);
  if (!user) throw new HttpError(401, 'Your session has expired. Please sign in again.');
  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.user = await sessionUser(req);
  next();
});

// Bearer token minted by GET /api/uploads/token, for uploads sent straight to the API host.
const requireUploadToken = asyncHandler(async (req, _res, next) => {
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  let payload;
  try {
    payload = verifyToken(token, 'upload');
  } catch {
    throw new HttpError(401, 'Your upload link has expired. Please try again.');
  }
  const user = await one('SELECT * FROM users WHERE id=$1', [payload.sub]);
  if (!user) throw new HttpError(401, 'Please sign in.');
  req.user = user;
  next();
});

const ROLE_MESSAGES = {
  issuer: 'This is only available to issuer accounts. Turn on the issuer role in your account first.',
  reviewer: 'Only listing reviewers can do this.',
};

// Checks a role on the signed-in account (use after requireAuth or requireUploadToken).
const requireRole = (role) => (req, _res, next) =>
  req.user?.[`is_${role}`]
    ? next()
    : next(new HttpError(403, ROLE_MESSAGES[role] || 'You do not have access to this.'));

module.exports = { requireAuth, optionalAuth, requireUploadToken, requireRole, sessionUser };
