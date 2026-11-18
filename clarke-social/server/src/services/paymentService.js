// Payments use Stripe Checkout. No card details touch Clarke servers.
const db = require('../db/connection');
const stripe = require('./stripeClient');
const HttpError = require('../utils/httpError');

const paymentPlans = {
  supporter_monthly: {
    name: 'Clarke Supporter',
    amount: 499,
    interval: 'month',
    description: 'Monthly support for Clarke',
  },
  creator_monthly: { name: 'Clarke Creator Plus', amount: 999, interval: 'month', description: 'Creator subscription' },
  one_time_support: { name: 'Support Clarke', amount: 500, interval: null, description: 'One-time support payment' },
  dating_plus_monthly: {
    name: 'Clarke Dating Plus',
    amount: 999,
    interval: 'month',
    description: 'Dating Plus membership',
  },
  dating_vip_monthly: {
    name: 'Clarke Dating VIP',
    amount: 1999,
    interval: 'month',
    description: 'Dating VIP membership',
  },
};

const DATING_PLANS = ['dating_plus_monthly', 'dating_vip_monthly'];

function getConfig() {
  return {
    enabled: !!stripe,
    currency: 'GBP',
    plans: Object.entries(paymentPlans).map(([key, p]) => ({
      key,
      name: p.name,
      amount: p.amount,
      currency: 'GBP',
      interval: p.interval,
    })),
  };
}

async function createCheckout(userId, planKey, origin) {
  if (!stripe) throw new HttpError(503, 'Payments are not configured yet. Add Stripe keys to the server environment.');
  const plan = paymentPlans[String(planKey || '')];
  if (!plan) throw new HttpError(400, 'Choose a valid Clarke payment option.');
  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan.interval ? 'subscription' : 'payment',
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: plan.amount,
            product_data: { name: plan.name, description: plan.description },
            ...(plan.interval ? { recurring: { interval: plan.interval } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      client_reference_id: String(userId),
      metadata: { userId: String(userId), planKey: String(planKey) },
      customer_email: db.prepare('SELECT email FROM users WHERE id=?').get(userId)?.email,
    });
    db.prepare(
      `INSERT INTO payments(user_id,product_key,amount,currency,status,checkout_session_id) VALUES(?,?,?,'gbp','pending',?)`
    ).run(userId, planKey, plan.amount, session.id);
    return session.url;
  } catch (err) {
    console.error('Stripe checkout:', err.message);
    throw new HttpError(502, 'Could not start checkout. Please try again.');
  }
}

function listHistory(userId) {
  return db
    .prepare(
      'SELECT product_key,amount,currency,status,created_at FROM payments WHERE user_id=? ORDER BY id DESC LIMIT 30'
    )
    .all(userId);
}

function applyWebhookEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    db.prepare(`UPDATE payments SET status='paid', provider_payment_id=? WHERE checkout_session_id=?`).run(
      session.payment_intent || session.subscription || '',
      session.id
    );
    const planKey = session.metadata?.planKey;
    if (
      DATING_PLANS.includes(planKey) &&
      session.subscription &&
      ['paid', 'no_payment_required'].includes(session.payment_status)
    ) {
      db.prepare(
        `INSERT INTO dating_subscriptions(user_id,plan_key,stripe_subscription_id,status) VALUES(?,?,?,'active') ON CONFLICT(user_id) DO UPDATE SET plan_key=excluded.plan_key,stripe_subscription_id=excluded.stripe_subscription_id,status='active',updated_at=CURRENT_TIMESTAMP`
      ).run(Number(session.metadata.userId), planKey, session.subscription);
    }
  }
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    db.prepare(
      `UPDATE dating_subscriptions SET status=?,current_period_end=?,updated_at=CURRENT_TIMESTAMP WHERE stripe_subscription_id=?`
    ).run(
      event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status,
      sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      sub.id
    );
  }
  if (event.type === 'checkout.session.expired')
    db.prepare(`UPDATE payments SET status='expired' WHERE checkout_session_id=?`).run(event.data.object.id);
  if (event.type === 'invoice.payment_failed' || event.type === 'invoice.paid') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription || invoice.parent?.subscription_details?.subscription;
    if (subscriptionId)
      db.prepare(
        `UPDATE dating_subscriptions SET status=?,updated_at=CURRENT_TIMESTAMP WHERE stripe_subscription_id=?`
      ).run(event.type === 'invoice.paid' ? 'active' : 'past_due', subscriptionId);
  }
}

module.exports = { getConfig, createCheckout, listHistory, applyWebhookEvent };
