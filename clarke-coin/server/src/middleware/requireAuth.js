const { decodeAccessToken } = require('../utils/tokens');
const userService = require('../services/userService');
const HttpError = require('../utils/httpError');
const asyncHandler = require('../utils/asyncHandler');

const UUID = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

// Bearer token only, as before; no cookies, so no CSRF surface.
module.exports = asyncHandler(async (req, _res, next) => {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
  if (!match) throw new HttpError(401, 'Authentication required');
  let userId;
  try {
    userId = decodeAccessToken(match[1]);
    if (!UUID.test(userId)) throw new Error('Subject is not a UUID');
  } catch {
    throw new HttpError(401, 'Invalid or expired access token');
  }
  const user = await userService.findById(userId);
  if (!user || !user.is_active) throw new HttpError(401, 'Account unavailable');
  req.user = user;
  next();
});
