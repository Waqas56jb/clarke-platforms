const env = require('../config/env');
const paymentService = require('../services/paymentService');

function config(_req, res) {
  res.json(paymentService.getConfig());
}

async function checkout(req, res) {
  res.json({ url: await paymentService.startCheckout(req.user, req.body || {}) });
}

async function history(req, res) {
  res.json({ payments: await paymentService.history(req.user.id) });
}

async function memberships(req, res) {
  res.json({ plans: await paymentService.memberships(req.user.id) });
}

// WiPay redirects the customer's browser here (GET) after checkout.
async function wipayReturn(req, res) {
  const outcome = await paymentService.handleReturn(req.query);
  res.redirect(303, `${env.appOrigin}/?payment=${outcome}`);
}

module.exports = { config, checkout, history, memberships, wipayReturn };
