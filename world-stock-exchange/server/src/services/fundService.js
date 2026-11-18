// Gold & Diamond fund: an allocation ledger in EUR. Entries are written only by the server when a
// company-share sale completes (listingService.buy). Nothing is charged or paid out.
const env = require('../config/env');
const { one, many } = require('../db/pool');
const { iso, dollars } = require('../utils/serializers');

async function summary() {
  const { total, entries } = await one(
    'SELECT COALESCE(SUM(fee_eur_cents),0)::bigint total, COUNT(*)::int entries FROM fund_ledger'
  );
  const rows = await many(
    `SELECT f.*, o.reference order_reference, a.name company, a.symbol
     FROM fund_ledger f LEFT JOIN company_orders o ON o.id=f.order_id LEFT JOIN applications a ON a.id=o.application_id
     ORDER BY f.created_at DESC, f.id DESC LIMIT 50`
  );
  return {
    totalEur: dollars(total),
    entries,
    settings: { rate: env.fund.rate, basis: env.fund.basis },
    ledger: rows.map((r) => ({
      id: r.id,
      orderReference: r.order_reference,
      company: r.company,
      symbol: r.symbol,
      saleValueEur: dollars(r.sale_value_eur_cents),
      basisEur: dollars(r.basis_eur_cents),
      feeEur: dollars(r.fee_eur_cents),
      basis: r.basis,
      rate: Number(r.rate),
      createdAt: iso(r.created_at),
    })),
  };
}

module.exports = { summary };
