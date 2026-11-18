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
const number = (name, fallback, min, max) => Math.max(min, Math.min(max, Number(process.env[name] ?? fallback)));

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set. See .env.example.');

const feeBasis = process.env.FUND_FEE_BASIS === 'profit' ? 'profit' : 'gross';

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL,
  jwtKey: secretOrTemporary('JWT_SECRET'),
  // Public origin of the website (the Vercel domain). Used for CORS and email links.
  appOrigin: (process.env.APP_ORIGIN || 'http://localhost:5174').replace(/\/$/, ''),
  // Shared secret the Vercel proxy adds to every /api request; see middleware/trustedProxy.js.
  proxySecret: isProduction ? secretOrTemporary('PROXY_SECRET') : process.env.PROXY_SECRET || '',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  privateDir: resolveFromRoot(process.env.PRIVATE_UPLOAD_DIR || 'private-uploads'),
  maxDocumentMb: number('MAX_DOCUMENT_MB', 20, 1, 50),
  // Practice-trading balance for every new account, in US dollars.
  startingBalanceCents: Math.round(number('PRACTICE_BALANCE_USD', 10000, 0, 1e9) * 100),
  // Seller fee for the Gold & Diamond fund: rate, and whether it applies to gross sale value or to profit.
  fund: { rate: number('FUND_FEE_RATE', 0.02, 0, 1), basis: feeBasis },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
  },
  // Optional market data. Without a key the stored illustrative prices are shown and labelled as such.
  marketData: {
    finnhubKey: process.env.FINNHUB_API_KEY || '',
    refreshMinutes: number('MARKET_REFRESH_MINUTES', 15, 1, 1440),
  },
  // One-time import of the previous SQLite database (see src/legacy/importSqlite.js).
  legacySqlitePath: process.env.LEGACY_SQLITE_PATH || '',
};
