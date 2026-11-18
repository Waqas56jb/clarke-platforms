// Payments through WiPay hosted checkout. Card details are entered on WiPay's page, never on Clarke.
const crypto = require('crypto');
const env = require('../config/env');
const { one, many, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso } = require('../utils/serializers');
const { isWipayConfigured, requestCheckout, isGenuineReturn } = require('./wipayClient');
const { activePlans, grantPlan } = require('./membershipService');

const PLANS = {
  supporter_monthly: { name: 'Clarke Supporter', cents: 499, monthly: true },
  creator_monthly: { name: 'Clarke Creator Plus', cents: 999, monthly: true },
  one_time_support: { name: 'Support Clarke', cents: 500, monthly: false },
  dating_plus_monthly: { name: 'Clarke Dating Plus', cents: 999, monthly: true },
  dating_vip_monthly: { name: 'Clarke Dating VIP', cents: 1999, monthly: true },
};
const RENTAL_HOURS = 48;

const NOT_CONFIGURED = 'Payments are not configured yet. Add the WiPay account details to the server environment.';

function getConfig() {
  return {
    enabled: isWipayConfigured(),
    environment: env.wipay.environment,
    currency: env.wipay.currency,
    plans: Object.entries(PLANS).map(([key, p]) => ({
      key,
      name: p.name,
      amount: p.cents,
      currency: env.wipay.currency,
      interval: p.monthly ? 'month' : null,
    })),
  };
}

// Short alphanumeric reference (WiPay recommends order_id of 16 characters or fewer).
const newOrderId = () =>
  `CS${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

async function resolveProduct(planKey, movieId) {
  if (planKey === 'movie_rental') {
    const movie = await one(`SELECT * FROM movies WHERE id=$1 AND access='rent'`, [movieId]);
    if (!movie || movie.price_cents < 1) throw new HttpError(404, 'This film is not available to rent.');
    return { key: planKey, name: `Rent: ${movie.title}`, cents: movie.price_cents, movieId: movie.id };
  }
  const plan = PLANS[String(planKey || '')];
  if (!plan) throw new HttpError(400, 'Choose a valid Clarke payment option.');
  return { key: planKey, name: plan.name, cents: plan.cents, movieId: null };
}

async function startCheckout(user, { plan, movieId }) {
  if (!isWipayConfigured()) throw new HttpError(503, NOT_CONFIGURED, 'PAYMENTS_NOT_CONFIGURED');
  const product = await resolveProduct(plan, Number(movieId));
  const orderId = newOrderId();
  const payment = await one(
    `INSERT INTO payments(user_id,product_key,movie_id,amount,currency,order_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`,
    [user.id, product.key, product.movieId, product.cents, env.wipay.currency, orderId]
  );
  const { url } = await requestCheckout({
    orderId,
    cents: product.cents,
    email: user.email,
    name: user.display_name,
    data: JSON.stringify({ paymentId: payment.id, product: product.key }),
    responseUrl: `${env.appOrigin}/api/payments/wipay/return`,
  });
  return url;
}

async function grant(client, payment) {
  if (PLANS[payment.product_key]?.monthly) await grantPlan(client, payment.user_id, payment.product_key);
  if (payment.product_key === 'movie_rental')
    await client.query(
      `INSERT INTO movie_rentals(user_id,movie_id,expires_at) VALUES($1,$2, now() + make_interval(hours => $3))
       ON CONFLICT(user_id,movie_id) DO UPDATE SET expires_at = now() + make_interval(hours => $3)`,
      [payment.user_id, payment.movie_id, RENTAL_HOURS]
    );
}

// Handles WiPay's browser redirect to response_url. Access is granted only for a successful status whose
// hash verifies against our own record of the amount; anything else never grants access.
// Returns the outcome used for the redirect back to the website.
async function handleReturn(params) {
  return withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM payments WHERE order_id=$1 FOR UPDATE', [
      String(params.order_id || ''),
    ]);
    const payment = rows[0];
    if (!payment) return 'failed';
    if (payment.status === 'paid') return 'success';
    if (payment.status !== 'pending') return payment.status === 'cancelled' ? 'cancelled' : 'failed';
    if (params.status === 'success') {
      const genuine =
        isGenuineReturn({ transactionId: params.transaction_id, hash: params.hash, cents: payment.amount }) &&
        String(params.currency || payment.currency).toUpperCase() === payment.currency;
      if (!genuine) {
        console.error('WiPay return failed verification', { orderId: payment.order_id });
        return 'failed';
      }
      await client.query(`UPDATE payments SET status='paid', provider_payment_id=$1, paid_at=now() WHERE id=$2`, [
        params.transaction_id,
        payment.id,
      ]);
      await grant(client, payment);
      return 'success';
    }
    await client.query(`UPDATE payments SET status='failed' WHERE id=$1`, [payment.id]);
    return 'failed';
  });
}

async function history(userId) {
  const rows = await many(
    `SELECT p.order_id, p.product_key, p.amount, p.currency, p.status, p.created_at, p.paid_at, m.title movie_title
     FROM payments p LEFT JOIN movies m ON m.id=p.movie_id WHERE p.user_id=$1 ORDER BY p.id DESC LIMIT 30`,
    [userId]
  );
  return rows.map((r) => ({
    reference: r.order_id,
    productKey: r.product_key,
    name: r.product_key === 'movie_rental' ? `Rent: ${r.movie_title || 'film'}` : PLANS[r.product_key]?.name,
    amount: r.amount,
    currency: r.currency,
    status: r.status,
    createdAt: iso(r.created_at),
    paidAt: iso(r.paid_at),
  }));
}

const memberships = (userId) => activePlans(userId);

module.exports = { getConfig, startCheckout, handleReturn, history, memberships };
