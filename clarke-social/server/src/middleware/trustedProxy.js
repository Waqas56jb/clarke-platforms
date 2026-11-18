// Works out the real client IP and blocks direct calls to the API host.
//
// The website (Vercel) forwards /api requests here through Routing Middleware that adds a secret
// header, X-Clarke-Proxy-Secret. Vercel overwrites X-Vercel-Forwarded-For with the visitor's real IP, so
// that header is trusted only when the secret matches. Anyone calling the Railway address directly
// cannot supply the secret: their IP comes from Railway's own edge proxy (TRUST_PROXY=1), which they
// cannot forge, and they can only reach the few routes that must be called directly.
const env = require('../config/env');
const { safeEqual } = require('../utils/secureRandom');

const DIRECT_ROUTES = [
  (req) => req.path.startsWith('/api/uploads/'),
  (req) => req.method === 'GET' && req.path.startsWith('/api/files/'),
  (req) => req.method === 'GET' && req.path === '/api/health',
  (req) => req.path.startsWith('/uploads/'),
];

const firstIp = (value) => (value || '').split(',')[0].trim();

function trustedProxy(req, res, next) {
  const viaProxy = Boolean(env.proxySecret) && safeEqual(req.get('x-clarke-proxy-secret') || '', env.proxySecret);
  req.clientIp = (viaProxy && firstIp(req.get('x-vercel-forwarded-for'))) || req.ip;
  if (env.proxySecret && !viaProxy && req.method !== 'OPTIONS' && !DIRECT_ROUTES.some((allowed) => allowed(req)))
    return res.status(403).json({ error: 'This API is only available through the Clarke website.' });
  next();
}

module.exports = trustedProxy;
