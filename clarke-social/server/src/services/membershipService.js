// Plan access. WiPay has no recurring billing, so each paid plan purchase adds 30 days of access,
// extending any time already remaining.
const { many } = require('../db/pool');
const { iso } = require('../utils/serializers');

const PLAN_DAYS = 30;

async function activePlans(userId) {
  const rows = await many(
    'SELECT plan_key, expires_at FROM memberships WHERE user_id=$1 AND expires_at > now() ORDER BY expires_at DESC',
    [userId]
  );
  return rows.map((r) => ({ planKey: r.plan_key, expiresAt: iso(r.expires_at) }));
}

const grantPlan = (client, userId, planKey) =>
  client.query(
    `INSERT INTO memberships(user_id,plan_key,expires_at) VALUES($1,$2, now() + make_interval(days => $3))
     ON CONFLICT(user_id,plan_key) DO UPDATE
       SET expires_at = GREATEST(memberships.expires_at, now()) + make_interval(days => $3), updated_at=now()`,
    [userId, planKey, PLAN_DAYS]
  );

module.exports = { activePlans, grantPlan };
