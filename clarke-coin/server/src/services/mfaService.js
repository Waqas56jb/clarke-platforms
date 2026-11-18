const { pool } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { newTotpSecret, verifyTotp } = require('../utils/totp');

// The secret is shown only to the authenticated account owner; deploy only behind HTTPS.
async function setup(user) {
  if (user.mfa_enabled) throw new HttpError(409, 'MFA is already enabled');
  const secret = newTotpSecret();
  await pool.query('UPDATE users SET totp_secret=$1 WHERE id=$2', [secret, user.id]);
  return {
    secret,
    provisioning_uri: `otpauth://totp/ClarkeCoin:${user.email}?secret=${secret}&issuer=ClarkeCoin`,
  };
}

async function enable(user, code) {
  if (!user.totp_secret || !verifyTotp(user.totp_secret, code)) throw new HttpError(400, 'Invalid verification code');
  await pool.query('UPDATE users SET mfa_enabled=true WHERE id=$1', [user.id]);
  return { mfa_enabled: true };
}

module.exports = { setup, enable };
