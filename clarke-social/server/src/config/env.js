const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const parseTrustProxy = require('../utils/trustProxy');

const serverRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(serverRoot, '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function secretOrTemporary(name) {
  const value = process.env[name];
  if (value && value.length >= 32) return value;
  if (isProduction) throw new Error(`${name} must be set to a random value of at least 32 characters.`);
  console.warn(`WARNING: ${name} is not set; using a temporary development value.`);
  return crypto.randomBytes(48).toString('hex');
}

const resolveFromRoot = (value) => path.resolve(serverRoot, value);
const mb = (name, fallback, max) => Math.max(1, Math.min(max, Number(process.env[name] || fallback)));

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set. See .env.example.');

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtKey: secretOrTemporary('JWT_SECRET'),
  // Public origin of the website (the Vercel domain). Used for CORS, email links and payment returns.
  appOrigin: (process.env.APP_ORIGIN || 'http://localhost:5173').replace(/\/$/, ''),
  // Shared secret the Vercel proxy adds to every /api request; see middleware/trustedProxy.js.
  proxySecret: isProduction ? secretOrTemporary('PROXY_SECRET') : process.env.PROXY_SECRET || '',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  uploadDir: resolveFromRoot(process.env.UPLOAD_DIR || 'uploads'),
  privateDir: resolveFromRoot(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads'),
  maxUploadMb: mb('MAX_UPLOAD_MB', 100, 250),
  maxMovieUploadMb: mb('MAX_MOVIE_UPLOAD_MB', 500, 2000),
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
  },
  wipay: {
    accountNumber: process.env.WIPAY_ACCOUNT_NUMBER || '',
    apiKey: process.env.WIPAY_API_KEY || '',
    environment: process.env.WIPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox',
    countryCode: (process.env.WIPAY_COUNTRY_CODE || 'GD').toUpperCase(),
    currency: (process.env.WIPAY_CURRENCY || 'USD').toUpperCase(),
    feeStructure: process.env.WIPAY_FEE_STRUCTURE || 'merchant_absorb',
  },
  turn: {
    urls: (process.env.TURN_URLS || '')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean),
    username: process.env.TURN_USERNAME || '',
    credential: process.env.TURN_CREDENTIAL || '',
    sharedSecret: process.env.TURN_SHARED_SECRET || '',
    ttlSeconds: Number(process.env.TURN_TTL_SECONDS || 3600),
  },
};
