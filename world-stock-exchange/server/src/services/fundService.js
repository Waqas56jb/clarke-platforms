// Demo allocation ledger for the proposed 2% fee. Not a payment system: nothing is charged or transferred.
const db = require('../db/connection');
const HttpError = require('../utils/httpError');

const FEE_RATE = 0.02;

const totalEur = () => db.prepare('SELECT COALESCE(SUM(fee_cents),0) AS cents FROM fund_ledger').get().cents / 100;

function recordFee(saleValueInput) {
  const saleValue = Math.max(0, Number(saleValueInput) || 0);
  if (!saleValue || saleValue > 1e12)
    throw new HttpError(400, 'Enter a positive gross stock sale value to calculate the example fee.');
  const fee = Math.round(saleValue * FEE_RATE * 100) / 100;
  db.prepare('INSERT INTO fund_ledger(sale_value_cents,fee_cents,created_at) VALUES(?,?,?)').run(
    Math.round(saleValue * 100),
    Math.round(fee * 100),
    new Date().toISOString()
  );
  return { saleValue, fee, total: totalEur() };
}

module.exports = { totalEur, recordFee };
