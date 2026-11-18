const argon2 = require('argon2');

// Same Argon2id parameters as argon2-cffi's PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2),
// so hashes created by the previous Python service still verify.
const OPTIONS = { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 2, hashLength: 32 };

const hashPassword = (password) => argon2.hash(password, OPTIONS);

async function verifyPassword(password, passwordHash) {
  try {
    return await argon2.verify(passwordHash, password);
  } catch {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
