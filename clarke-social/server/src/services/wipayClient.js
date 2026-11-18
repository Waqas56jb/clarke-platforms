// WiPay hosted checkout (Payments API v1, https://docs.wipayfinancial.com/payments-api).
// The account number identifies the merchant; the API key is never sent, it only verifies return hashes.
const crypto = require('crypto');
const env = require('../config/env');
const HttpError = require('../utils/httpError');
const { safeEqual } = require('../utils/secureRandom');

const isWipayConfigured = () => Boolean(env.wipay.accountNumber && env.wipay.apiKey);

// Live hosts are {cc}.wipayfinancial.com; sandbox hosts are {cc}sb.wipayfinancial.com.
const baseUrl = () => {
  const cc = env.wipay.countryCode.toLowerCase();
  return `https://${cc}${env.wipay.environment === 'live' ? '' : 'sb'}.wipayfinancial.com`;
};

const formatTotal = (cents) => (cents / 100).toFixed(2);

async function requestCheckout({ orderId, cents, email, name, data, responseUrl }) {
  const form = new URLSearchParams({
    account_number: env.wipay.accountNumber,
    country_code: env.wipay.countryCode,
    currency: env.wipay.currency,
    environment: env.wipay.environment,
    fee_structure: env.wipay.feeStructure,
    method: 'credit_card_co',
    order_id: orderId,
    origin: 'clarke-social',
    response_url: responseUrl,
    total: formatTotal(cents),
    email: email.slice(0, 50),
    name: name.slice(0, 60),
    data,
  });
  let response;
  try {
    response = await fetch(`${baseUrl()}/plugins/payments/request`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
  } catch (err) {
    console.error('WiPay request failed', err.message);
    throw new HttpError(502, 'Could not reach the payment provider. Please try again.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.url) {
    console.error('WiPay checkout rejected', response.status, body.message);
    throw new HttpError(502, 'The payment provider could not start checkout. Please try again later.');
  }
  return { url: body.url, transactionId: body.transaction_id };
}

// Return hash: md5(transaction_id + original_total + api_key), where original_total is the 2-decimal
// total we sent (not the possibly fee-adjusted total in the redirect).
function isGenuineReturn({ transactionId, hash, cents }) {
  if (!transactionId || !hash) return false;
  const expected = crypto
    .createHash('md5')
    .update(`${transactionId}${formatTotal(cents)}${env.wipay.apiKey}`)
    .digest('hex');
  return safeEqual(String(hash).toLowerCase(), expected);
}

module.exports = { isWipayConfigured, requestCheckout, isGenuineReturn, formatTotal };
