const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const HttpError = require('../utils/httpError');

const findUserById = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id);

async function register({ username, email, password, displayName }) {
  if (!username || !email || !password || !displayName) throw new HttpError(400, 'Complete all registration fields.');
  const cleanUser = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  if (!/^[a-z0-9_]{3,24}$/.test(cleanUser))
    throw new HttpError(400, 'Username must be 3–24 letters, numbers or underscores.');
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new HttpError(400, 'Enter a valid email address.');
  if (String(password).length < 10) throw new HttpError(400, 'Use a password with at least 10 characters.');
  try {
    const hash = await bcrypt.hash(password, 12);
    const result = db
      .prepare('INSERT INTO users(username,email,password_hash,display_name) VALUES(?,?,?,?)')
      .run(cleanUser, cleanEmail, hash, String(displayName).trim().slice(0, 60));
    return findUserById(result.lastInsertRowid);
  } catch (e) {
    throw new HttpError(
      409,
      e.code === 'SQLITE_CONSTRAINT_UNIQUE'
        ? 'That username or email is already registered.'
        : 'Could not create your account.'
    );
  }
}

async function login({ identity, password }) {
  const clean = String(identity || '')
    .trim()
    .toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE username=? OR email=?').get(clean, clean);
  if (!user || !(await bcrypt.compare(String(password || ''), user.password_hash)))
    throw new HttpError(401, 'Email/username or password is incorrect.');
  return user;
}

// Starter-compatible registration: username/email/password only, display name defaults to the username.
async function registerLegacy({ username, email, password }) {
  if (
    !/^[a-zA-Z0-9_]{3,24}$/.test(username || '') ||
    !/^\S+@\S+\.\S+$/.test(email || '') ||
    typeof password !== 'string' ||
    password.length < 10
  )
    throw new HttpError(400, 'Use a 3–24 character username, valid email and password of at least 10 characters.');
  try {
    const hash = await bcrypt.hash(password, 12);
    const info = db
      .prepare('INSERT INTO users(username,email,password_hash,display_name) VALUES(?,?,?,?)')
      .run(username, email.toLowerCase(), hash, username);
    return { id: info.lastInsertRowid, username };
  } catch {
    throw new HttpError(409, 'Username or email may already be registered.');
  }
}

async function loginLegacy({ email, password }) {
  const user = db.prepare('SELECT * FROM users WHERE email=?').get(String(email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.password_hash)))
    throw new HttpError(401, 'Incorrect email or password.');
  return { id: user.id, username: user.username };
}

module.exports = { findUserById, register, login, registerLegacy, loginLegacy };
