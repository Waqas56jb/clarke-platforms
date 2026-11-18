const Stripe = require('stripe');
const env = require('../config/env');

module.exports = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;
