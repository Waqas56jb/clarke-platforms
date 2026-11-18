// Works out the real client IP and blocks direct calls to the API host.
//
// The website (Vercel) forwards /api requests here through Routing Middleware that adds a secret
// header, X-WSE-Proxy-Secret, and X-WSE-Client-Ip: the visitor IP taken from Vercel's own
// x-real-ip. That header is trusted only when the secret matches (visitor-sent forwarding headers
// reach us unchanged through the rewrite, so they are never trusted). Anyone calling the Railway
// address directly cannot supply the secret and can only reach the few routes that must be called
// directly; their IP is the client address Railway's edge records in X-Forwarded-For, which Railway
// rewrites itself (TRUST_PROXY=2: client, then Railway's edge proxy).
const env = require('../config/env');
const { safeEqual } = require('../utils/secureRandom');

const DIRECT_ROUTES = [
  (req) => req.path.startsWith('/api/uploads/'),
  (req) => req.method === 'GET' && req.path.startsWith('/api/files/'),
  (req) => req.method === 'GET' && req.path === '/api/health',
];

const firstIp = (value) => (value || '').split(',')[0].trim();

function trustedProxy(req, res, next) {
  const viaProxy = Boolean(env.proxySecret) && safeEqual(req.get('x-wse-proxy-secret') || '', env.proxySecret);
  req.clientIp = (viaProxy && firstIp(req.get('x-wse-client-ip'))) || req.ip;
  if (env.proxySecret && !viaProxy && req.method !== 'OPTIONS' && !DIRECT_ROUTES.some((allowed) => allowed(req)))
    return res.status(403).json({ error: 'This API is only available through the World Stock Exchange website.' });
  next();
}

module.exports = trustedProxy;
