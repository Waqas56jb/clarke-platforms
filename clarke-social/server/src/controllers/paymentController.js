const env = require('../config/env');
const stripe = require('../services/stripeClient');
const paymentService = require('../services/paymentService');

function config(_req, res) {
  res.json(paymentService.getConfig());
}

async function checkout(req, res) {
  const origin = env.appOrigin || `${req.protocol}://${req.get('host')}`;
  res.json({ url: await paymentService.createCheckout(req.user.sub, req.body.plan, origin) });
}

function history(req, res) {
  res.json({ payments: paymentService.listHistory(req.user.sub) });
}

// Stripe signs the untouched request bytes, so this route receives a raw Buffer body.
function webhook(req, res) {
  if (!stripe || !env.stripeWebhookSecret) return res.sendStatus(503);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook signature error: ${err.message}`);
  }
  paymentService.applyWebhookEvent(event);
  res.json({ received: true });
}

module.exports = { config, checkout, history, webhook };
