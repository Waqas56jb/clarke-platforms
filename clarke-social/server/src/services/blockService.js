// Blocks apply across dating, messaging and calls, in both directions.
const { one, query } = require('../db/pool');
const HttpError = require('../utils/httpError');

async function isBlockedBetween(a, b) {
  return Boolean(
    await one(
      'SELECT 1 FROM dating_blocks WHERE (blocker_id=$1 AND blocked_id=$2) OR (blocker_id=$2 AND blocked_id=$1)',
      [a, b]
    )
  );
}

async function block(userId, target) {
  if (!Number.isSafeInteger(target) || target === userId) throw new HttpError(400, 'Invalid member.');
  if (!(await one('SELECT id FROM users WHERE id=$1', [target]))) throw new HttpError(404, 'Member not found.');
  await query('INSERT INTO dating_blocks(blocker_id,blocked_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [
    userId,
    target,
  ]);
  await query('DELETE FROM dating_likes WHERE (from_user=$1 AND to_user=$2) OR (from_user=$2 AND to_user=$1)', [
    userId,
    target,
  ]);
}

module.exports = { isBlockedBetween, block };
