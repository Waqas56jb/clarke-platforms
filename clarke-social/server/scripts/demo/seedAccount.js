// clarke_demo's payment history (sandbox records only — no request is ever sent to WiPay) and
// believable timestamps/read state for the notifications the services created during the seed.
const { query } = require('../../src/db/pool');
const { log } = require('./context');

// [order suffix, product, amount cents, status, days ago, grants]
const PAYMENTS = [
  ['0001', 'supporter_monthly', 499, 'paid', 20, { plan: 'supporter_monthly' }],
  ['0002', 'creator_monthly', 999, 'failed', 12],
  ['0003', 'dating_plus_monthly', 999, 'paid', 6, { plan: 'dating_plus_monthly' }],
  ['0004', 'one_time_support', 500, 'cancelled', 3],
  ['0005', 'movie_rental', 299, 'paid', 1, { rental: true }],
];

async function seedPayments(clarke, rentalMovieId) {
  for (const [suffix, product, amount, status, days, grants] of PAYMENTS) {
    if (product === 'movie_rental' && !rentalMovieId) continue;
    const orderId = `SANDBOX-DEMO-${suffix}`;
    const inserted = await query(
      `INSERT INTO payments(user_id,product_key,movie_id,amount,currency,status,order_id,provider_payment_id,created_at,paid_at,is_demo)
       VALUES($1,$2,$3,$4,'USD',$5,$6,$7, now() - make_interval(days => $8), $9, true)
       ON CONFLICT(order_id) DO NOTHING`,
      [
        clarke.id,
        product,
        product === 'movie_rental' ? rentalMovieId : null,
        amount,
        status,
        orderId,
        status === 'paid' ? `SANDBOX-DEMO-TXN-${suffix}` : null,
        days,
        status === 'paid' ? new Date(Date.now() - days * 86400000 + 60000) : null,
      ]
    );
    if (!inserted.rowCount || !grants) continue;
    // Same effect as a confirmed WiPay return: 30 days of plan access, or a 48-hour rental.
    if (grants.plan)
      await query(
        `INSERT INTO memberships(user_id,plan_key,expires_at,is_demo) VALUES($1,$2, now() - make_interval(days => $3) + interval '30 days', true)
         ON CONFLICT(user_id,plan_key) DO NOTHING`,
        [clarke.id, grants.plan, days]
      );
    if (grants.rental)
      await query(
        `INSERT INTO movie_rentals(user_id,movie_id,expires_at,is_demo) VALUES($1,$2, now() - make_interval(days => $3) + interval '48 hours', true)
         ON CONFLICT(user_id,movie_id) DO NOTHING`,
        [clarke.id, rentalMovieId, days]
      );
  }
  log('sandbox payment history ready');
}

// Keeps clarke_demo's newest demo notifications unread, so the bell shows activity on every visit.
async function freshenNotifications(clarke) {
  await query(
    `UPDATE notifications SET read_at=NULL WHERE id IN (SELECT id FROM notifications WHERE user_id=$1 AND is_demo
       ORDER BY created_at DESC LIMIT 8)`,
    [clarke.id]
  );
}

// Notifications are created "now" by the services; spread them out to match what they refer to.
async function settleNotifications(runStart) {
  const since = [runStart];
  await query(
    `UPDATE notifications n SET created_at = p.created_at + (now() - p.created_at) * (0.05 + random() * 0.5)
     FROM posts p WHERE n.entity_id=p.id AND n.type IN ('like','comment') AND n.created_at >= $1`,
    since
  );
  await query(
    `UPDATE notifications n SET created_at = m.created_at FROM messages m
     WHERE n.entity_id=m.id AND n.type='message' AND n.created_at >= $1`,
    since
  );
  await query(
    `UPDATE notifications SET created_at = now() - random() * interval '30 days' WHERE type='follow' AND created_at >= $1`,
    since
  );
  await query(
    `UPDATE notifications SET created_at = now() - random() * interval '6 days' WHERE type='match' AND created_at >= $1`,
    since
  );
  // Anything older than a day has been seen; the latest few stay unread.
  await query(
    `UPDATE notifications SET read_at = created_at + interval '1 hour'
     WHERE read_at IS NULL AND created_at < now() - interval '1 day' AND actor_id IN (SELECT id FROM users WHERE is_demo)`
  );
  log('notifications settled');
}

module.exports = { seedPayments, settleNotifications, freshenNotifications };
