const { generateSecret, verifySync } = require('otplib');

// pyotp defaults: 30-second step, 6 digits, SHA-1; verify(valid_window=1) accepts one step either side.
const STEP_SECONDS = 30;

// 20 random bytes, base32-encoded to 32 characters like pyotp.random_base32().
const newTotpSecret = () => generateSecret({ length: 20 });

function verifyTotp(secret, code) {
  try {
    return verifySync({ secret, token: String(code), epochTolerance: STEP_SECONDS }).valid === true;
  } catch {
    return false;
  }
}

module.exports = { newTotpSecret, verifyTotp };
