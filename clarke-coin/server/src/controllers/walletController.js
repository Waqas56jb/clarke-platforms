const walletService = require('../services/walletService');
const transferService = require('../services/transferService');
const { validateInt } = require('../utils/requestValidation');
const { decimalText } = require('../utils/decimal');
const { numberSourcesOf } = require('../utils/jsonNumberSources');

async function balance(req, res) {
  res.json(await walletService.getBalance(req.user.id));
}

async function transactions(req, res) {
  const limit = validateInt(req.query.limit, ['query', 'limit'], 50);
  const offset = validateInt(req.query.offset, ['query', 'offset'], 0);
  const errors = [limit.error, offset.error].filter(Boolean);
  if (errors.length) return res.status(422).json({ detail: errors });
  res.json(await walletService.listTransactions(req.user.id, limit.value, offset.value));
}

async function transfer(req, res) {
  const amount = decimalText(req.body.amount, numberSourcesOf(req.body).amount);
  const result = await transferService.transfer(
    req.user,
    { recipientEmail: req.body.recipient_email, amount },
    req.get('idempotency-key')
  );
  res.status(202).json(result);
}

module.exports = { balance, transactions, transfer };
