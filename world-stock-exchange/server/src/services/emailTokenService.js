// One-time links for email verification and password reset. Only a SHA-256 hash is stored.
const { one, query } = require('../db/pool');
const { randomToken, sha256 } = require('../utils/secureRandom');

const LIFETIME_MINUTES = { verify: 24 * 60, reset: 60 };

async function createEmailToken(userId, purpose) {
  const token = randomToken(32);
  await query(`UPDATE email_tokens SET used_at=now() WHERE user_id=$1 AND purpose=$2 AND used_at IS NULL`, [
    userId,
    purpose,
  ]);
  await query(
    `INSERT INTO email_tokens(user_id,purpose,token_hash,expires_at) VALUES($1,$2,$3, now() + make_interval(mins => $4))`,
    [userId, purpose, sha256(token), LIFETIME_MINUTES[purpose]]
  );
  return token;
}

// Marks the token used and returns its user id, or null when it is unknown, used or expired.
async function consumeEmailToken(token, purpose, client = { query }) {
  const { rows } = await client.query(
    `UPDATE email_tokens SET used_at=now()
     WHERE token_hash=$1 AND purpose=$2 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [sha256(String(token || '')), purpose]
  );
  return rows[0]?.user_id || null;
}

const findUserByEmail = (email) =>
  one('SELECT * FROM users WHERE email=$1', [
    String(email || '')
      .trim()
      .toLowerCase(),
  ]);

module.exports = { createEmailToken, consumeEmailToken, findUserByEmail };
