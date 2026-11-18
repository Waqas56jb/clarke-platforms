const path = require('path');
const dotenv = require('dotenv');
const parseTrustProxy = require('../utils/trustProxy');

const serverRoot = path.resolve(__dirname, '..', '..');
dotenv.config({ path: path.join(serverRoot, '.env') });

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port.');

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  appOrigin: process.env.APP_ORIGIN || '',
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  dbFile: path.resolve(serverRoot, process.env.DB_FILE || 'wse.sqlite'),
  clientDistDir: process.env.CLIENT_DIST_DIR ? path.resolve(serverRoot, process.env.CLIENT_DIST_DIR) : '',
};
