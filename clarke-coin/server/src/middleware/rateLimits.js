// Per-IP, in-process limits matching the slowapi configuration. Like slowapi, a single-instance
// limiter: use a shared store (e.g. Redis) before running more than one instance.
const rateLimit = require('express-rate-limit');

const limiter = (limit, windowMs, label) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: false,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: `Rate limit exceeded: ${limit} per 1 ${label}` }),
  });

module.exports = {
  defaultLimiter: limiter(120, 60 * 1000, 'minute'),
  registerLimiter: limiter(5, 60 * 60 * 1000, 'hour'),
  loginLimiter: limiter(5, 60 * 1000, 'minute'),
  transferLimiter: limiter(10, 60 * 1000, 'minute'),
};
