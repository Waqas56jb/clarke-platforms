const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { one, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { assertStrongPassword } = require('../utils/passwordPolicy');
const { isEmailConfigured, sendEmail, NOT_CONFIGURED } = require('./emailService');
const { createEmailToken, consumeEmailToken, findUserByEmail } = require('./emailTokenService');

const UNIQUE_VIOLATION = '23505';

function assertEmailConfigured() {
  if (!isEmailConfigured()) throw new HttpError(503, NOT_CONFIGURED, 'EMAIL_NOT_CONFIGURED');
}

async function sendVerification(user) {
  const token = await createEmailToken(user.id, 'verify');
  await sendEmail({
    to: user.email,
    subject: 'Verify your Clarke account',
    text: `Hi ${user.display_name},\n\nConfirm your email address to start using Clarke:\n${env.appOrigin}/?verify=${token}\n\nThis link expires in 24 hours. If you did not create a Clarke account, you can ignore this email.`,
  });
}

async function register({ username, email, password, displayName }) {
  if (!username || !email || !password || !displayName) throw new HttpError(400, 'Complete all registration fields.');
  const cleanUser = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(cleanUser))
    throw new HttpError(400, 'Username must be 3–24 letters, numbers or underscores.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254)
    throw new HttpError(400, 'Enter a valid email address.');
  assertStrongPassword(password, { username: cleanUser, email: cleanEmail });
  const hash = await bcrypt.hash(String(password), 12);
  let user;
  try {
    user = await one('INSERT INTO users(username,email,password_hash,display_name) VALUES($1,$2,$3,$4) RETURNING *', [
      cleanUser,
      cleanEmail,
      hash,
      String(displayName).trim().slice(0, 60),
    ]);
  } catch (e) {
    if (e.code === UNIQUE_VIOLATION) throw new HttpError(409, 'That username or email is already registered.');
    throw e;
  }
  if (!isEmailConfigured()) return { user, verificationRequired: false };
  await sendVerification(user);
  return { user, verificationRequired: true };
}

async function login({ identity, password }) {
  const clean = String(identity || '')
    .trim()
    .toLowerCase();
  const user = await one('SELECT * FROM users WHERE username=$1 OR email=$1', [clean]);
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash)))
    throw new HttpError(401, 'Email/username or password is incorrect.');
  if (isEmailConfigured() && !user.email_verified)
    throw new HttpError(403, 'Please verify your email address first. We can send a new link.', 'EMAIL_NOT_VERIFIED');
  return user;
}

async function verifyEmail(token) {
  const userId = await consumeEmailToken(token, 'verify');
  if (!userId) throw new HttpError(400, 'This verification link is invalid or has expired. Request a new one.');
  return one('UPDATE users SET email_verified=true WHERE id=$1 RETURNING *', [userId]);
}

// Always answers the same way, so the response does not reveal which emails have accounts.
async function resendVerification(email) {
  assertEmailConfigured();
  const user = await findUserByEmail(email);
  if (user && !user.email_verified) await sendVerification(user);
}

async function forgotPassword(email) {
  assertEmailConfigured();
  const user = await findUserByEmail(email);
  if (!user) return;
  const token = await createEmailToken(user.id, 'reset');
  await sendEmail({
    to: user.email,
    subject: 'Reset your Clarke password',
    text: `Hi ${user.display_name},\n\nUse this link to choose a new password:\n${env.appOrigin}/?reset=${token}\n\nThe link expires in 1 hour. If you did not ask for this, you can ignore this email; your password will not change.`,
  });
}

// A reset also verifies the email (the link proved ownership) and signs out every other session.
async function resetPassword(token, password) {
  return withTransaction(async (client) => {
    const userId = await consumeEmailToken(token, 'reset', client);
    if (!userId) throw new HttpError(400, 'This reset link is invalid or has expired. Request a new one.');
    const { rows } = await client.query('SELECT * FROM users WHERE id=$1', [userId]);
    assertStrongPassword(password, { username: rows[0].username, email: rows[0].email });
    const hash = await bcrypt.hash(String(password), 12);
    const updated = await client.query(
      `UPDATE users SET password_hash=$1, token_version=token_version+1, email_verified=true WHERE id=$2 RETURNING *`,
      [hash, userId]
    );
    return updated.rows[0];
  });
}

async function confirmPassword(user, password) {
  if (!(await bcrypt.compare(String(password || ''), user.password_hash)))
    throw new HttpError(401, 'That password is incorrect.');
}

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  confirmPassword,
};
