// Per-client limits keyed on req.clientIp, which middleware/trustedProxy.js derives from sources a
// caller cannot forge. In-memory store: fine for the single Railway instance; use a shared store
// (e.g. Redis) before scaling to more instances.
const rateLimit = require('express-rate-limit');

const limiter = (windowMs, limit, message) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => req.clientIp,
    message: { error: message },
  });

const MINUTE = 60 * 1000;

module.exports = {
  apiLimiter: limiter(15 * MINUTE, 1500, 'Too many requests. Please wait a few minutes and try again.'),
  authLimiter: limiter(15 * MINUTE, 30, 'Too many sign-in attempts. Please wait 15 minutes and try again.'),
  emailLimiter: limiter(60 * MINUTE, 10, 'Too many email requests. Please try again later.'),
  uploadLimiter: limiter(15 * MINUTE, 60, 'Too many uploads. Please wait a few minutes and try again.'),
  orderLimiter: limiter(MINUTE, 30, 'You are placing orders too quickly. Please slow down.'),
  writeLimiter: limiter(15 * MINUTE, 120, 'Too many changes in a short time. Please try again later.'),
};
