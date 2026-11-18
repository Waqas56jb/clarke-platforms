const path = require('path');
const dotenv = require('dotenv');
const parseTrustProxy = require('../utils/trustProxy');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set. See .env.example.`);
  return value;
}

const jwtSecret = required('JWT_SECRET');
if (Buffer.byteLength(jwtSecret) < 32)
  throw new Error('JWT_SECRET must contain at least 32 bytes. Generate a unique secret.');

const accessTokenMinutes = Number(process.env.ACCESS_TOKEN_MINUTES || 15);
if (!Number.isInteger(accessTokenMinutes) || accessTokenMinutes < 1)
  throw new Error('ACCESS_TOKEN_MINUTES must be a positive whole number.');

const appEnv = process.env.APP_ENV || 'development';

module.exports = {
  appEnv,
  isProduction: appEnv === 'production',
  // Explicit operator opt-in to apply reviewed migrations at start-up in production.
  runMigrationsOnStart: String(process.env.RUN_MIGRATIONS_ON_START || 'false').toLowerCase() === 'true',
  appName: process.env.APP_NAME || 'Clarke Coin API',
  port: Number(process.env.PORT || 3002),
  // The FastAPI version used SQLAlchemy URLs ("postgresql+psycopg://"); accept those unchanged.
  databaseUrl: required('DATABASE_URL').replace(/^postgresql\+\w+:/, 'postgresql:'),
  jwtSecret,
  accessTokenMinutes,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5175')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean),
  trustProxy: parseTrustProxy(String(process.env.TRUST_PROXY_HEADERS || 'false').toLowerCase()),
};
