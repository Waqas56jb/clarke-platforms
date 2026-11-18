// Who may message (and call) whom: a mutual dating match or members who follow each other, unless
// either has blocked the other.
const { one } = require('../db/pool');
const { isBlockedBetween } = require('./blockService');

async function isMutualMatch(a, b) {
  return Boolean(
    await one(
      `SELECT 1 FROM dating_likes x JOIN dating_likes y ON y.from_user=x.to_user AND y.to_user=x.from_user
       WHERE x.from_user=$1 AND x.to_user=$2`,
      [a, b]
    )
  );
}

async function isMutualFollow(a, b) {
  return Boolean(
    await one(
      `SELECT 1 FROM follows x JOIN follows y ON y.follower_id=x.following_id AND y.following_id=x.follower_id
       WHERE x.follower_id=$1 AND x.following_id=$2`,
      [a, b]
    )
  );
}

async function canMessage(a, b) {
  if (Number(a) === Number(b) || (await isBlockedBetween(a, b))) return false;
  return (await isMutualMatch(a, b)) || isMutualFollow(a, b);
}

module.exports = { canMessage, isMutualMatch };
