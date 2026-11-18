const HttpError = require('./httpError');

const COMMON = new Set([
  'password123',
  'password1234',
  '1234567890',
  '12345678910',
  'qwertyuiop',
  'iloveyou123',
  'letmein1234',
  'welcome123',
  'abc1234567',
  'clarke12345',
  'admin12345',
  'football123',
]);

// Length-based rules (NIST SP 800-63B style): 10–128 characters, not common, not the username/email.
function assertStrongPassword(password, { username = '', email = '' } = {}) {
  const value = String(password || '');
  if (value.length < 10) throw new HttpError(400, 'Use a password with at least 10 characters.');
  if (value.length > 128) throw new HttpError(400, 'Use a password with no more than 128 characters.');
  const lower = value.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(value))
    throw new HttpError(400, 'That password is too easy to guess. Choose a different one.');
  if (lower === username.toLowerCase() || lower === email.toLowerCase())
    throw new HttpError(400, 'Your password must be different from your username and email.');
}

module.exports = { assertStrongPassword };
