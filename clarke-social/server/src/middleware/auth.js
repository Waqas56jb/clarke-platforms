const { verifyToken } = require('../utils/tokens');
const { COOKIE_NAME } = require('../utils/sessionCookie');

// Accepts the HTTP-only session cookie, or a Bearer token as issued by the legacy starter endpoints.
function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME] || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Please sign in.' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = requireAuth;
