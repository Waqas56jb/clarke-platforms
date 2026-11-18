// Grants (or with --remove, withdraws) the reviewer role. This is the only way to set it; the website
// can never make an account a reviewer. Usage: npm run make-reviewer -- <username> [--remove]
const { one, pool } = require('../src/db/pool');

async function main() {
  const username = String(process.argv[2] || '').trim().toLowerCase();
  const remove = process.argv.includes('--remove');
  if (!username || username.startsWith('--')) throw new Error('Usage: npm run make-reviewer -- <username> [--remove]');
  const user = await one('UPDATE users SET is_reviewer=$2 WHERE username=$1 RETURNING username, is_reviewer', [
    username,
    !remove,
  ]);
  if (!user) throw new Error(`No account with the username "${username}".`);
  console.info(`${user.username} is ${user.is_reviewer ? 'now a reviewer' : 'no longer a reviewer'}.`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
