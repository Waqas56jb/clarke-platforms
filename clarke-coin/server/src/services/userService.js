const crypto = require('crypto');
const { pool, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { hashPassword, verifyPassword } = require('../utils/passwords');
const { verifyTotp } = require('../utils/totp');

const UNIQUE_VIOLATION = '23505';
const DUPLICATE = 'Unable to create account with those details';

const toUserOut = (u) => ({ id: u.id, email: u.email, role: u.role, mfa_enabled: u.mfa_enabled });

const findById = async (id) => (await pool.query('SELECT * FROM users WHERE id=$1', [id])).rows[0] || null;
const findByEmail = async (email) => (await pool.query('SELECT * FROM users WHERE email=$1', [email])).rows[0] || null;

// Every new account gets one wallet, and it always starts restricted.
async function register({ email: rawEmail, password }) {
  const email = rawEmail.toLowerCase().trim();
  if (await findByEmail(email)) throw new HttpError(409, DUPLICATE);
  const passwordHash = await hashPassword(password);
  try {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users(id,email,password_hash,role,is_active,mfa_enabled,created_at)
         VALUES($1,$2,$3,'customer',true,false,now()) RETURNING *`,
        [crypto.randomUUID(), email, passwordHash]
      );
      await client.query(`INSERT INTO wallets(id,user_id,currency,status) VALUES($1,$2,'CLARKE_COIN','restricted')`, [
        crypto.randomUUID(),
        rows[0].id,
      ]);
      return toUserOut(rows[0]);
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) throw new HttpError(409, DUPLICATE);
    throw err;
  }
}

async function authenticate({ email, password, mfa_code: mfaCode }) {
  const user = await findByEmail(email.toLowerCase().trim());
  if (!user || !user.is_active || !(await verifyPassword(password, user.password_hash)))
    throw new HttpError(401, 'Invalid email or password');
  if (user.mfa_enabled && (!mfaCode || !user.totp_secret || !verifyTotp(user.totp_secret, mfaCode)))
    throw new HttpError(401, 'Invalid email, password or verification code');
  return user;
}

module.exports = { toUserOut, findById, register, authenticate };
