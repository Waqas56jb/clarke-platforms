const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');
const parseTrustProxy = require('../utils/trustProxy');

const serverRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(serverRoot, '.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  if (isProduction) throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  console.warn('WARNING: using a temporary development JWT secret. Set JWT_SECRET before deployment.');
}

const resolveFromRoot = (value) => path.resolve(serverRoot, value);

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT || 3000),
  jwtKey: secret || crypto.randomBytes(48).toString('hex'),
  appOrigin: process.env.APP_ORIGIN || '',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  maxUploadMb: Math.max(1, Math.min(250, Number(process.env.MAX_UPLOAD_MB || 100))),
  uploadDir: resolveFromRoot(process.env.UPLOAD_DIR || 'uploads'),
  dbFile: resolveFromRoot(process.env.DB_FILE || 'clarke.sqlite'),
  clientDistDir: process.env.CLIENT_DIST_DIR ? resolveFromRoot(process.env.CLIENT_DIST_DIR) : '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  turn: {
    url: process.env.TURN_URL || '',
    username: process.env.TURN_USERNAME || '',
    credential: process.env.TURN_CREDENTIAL || '',
  },
};
