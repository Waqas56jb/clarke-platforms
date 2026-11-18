const env = require('../config/env');

// The exact header set the FastAPI middleware applied to every response.
function securityHeaders(_req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  });
  if (env.isProduction) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

module.exports = securityHeaders;
