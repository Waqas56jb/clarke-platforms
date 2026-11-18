// Approved company listings and practice buy orders against them. An order locks the listing and the
// investor's account, checks remaining shares and practice balance, then saves the order, reduces the
// shares, debits the virtual balance and records the seller fee in the fund ledger — all in one
// transaction, so two orders can never oversell a listing.
const crypto = require('crypto');
const env = require('../config/env');
const { one, many, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso, dollars } = require('../utils/serializers');

const MAX_QUANTITY = 1e9;

const toListing = (a) => ({
  id: a.id,
  reference: a.reference,
  name: a.name,
  country: a.country,
  symbol: a.symbol,
  sector: a.sector,
  website: a.website,
  shareClass: a.share_class,
  shares: Number(a.shares),
  remainingShares: Number(a.remaining_shares),
  price: Number(a.price),
  currency: a.currency,
  description: a.description,
  approvedAt: iso(a.reviewed_at),
});

async function list() {
  const rows = await many("SELECT * FROM applications WHERE status='approved' ORDER BY reviewed_at DESC, id DESC");
  return rows.map(toListing);
}

async function get(id) {
  const row = await one("SELECT * FROM applications WHERE id=$1 AND status='approved'", [Number(id) || 0]);
  if (!row) throw new HttpError(404, 'This listing is not available.');
  return toListing(row);
}

const toOrder = (o) => ({
  id: o.id,
  reference: o.reference,
  listingId: o.application_id,
  company: o.name,
  symbol: o.symbol,
  quantity: Number(o.quantity),
  price: Number(o.price),
  currency: o.currency,
  total: dollars(o.total_cents),
  investor: o.investor_name || undefined,
  fundFeeEur: o.fee_eur_cents === null || o.fee_eur_cents === undefined ? undefined : dollars(o.fee_eur_cents),
  createdAt: iso(o.created_at),
});

// The fee basis is one server setting (FUND_FEE_BASIS). A primary sale has no recorded cost for the
// seller, so under the "profit" basis its realised profit is unknown and no fee is recorded.
function feeFor(saleEurCents) {
  const basisCents = env.fund.basis === 'gross' ? saleEurCents : 0;
  return { basisCents, feeCents: Math.round(basisCents * env.fund.rate) };
}

async function buy(investor, listingId, body) {
  const quantity = Number(body?.quantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY)
    throw new HttpError(400, 'Enter a whole number of shares, at least 1.');
  return withTransaction(async (client) => {
    const listing = (
      await client.query("SELECT * FROM applications WHERE id=$1 AND status='approved' FOR UPDATE", [
        Number(listingId) || 0,
      ])
    ).rows[0];
    if (!listing) throw new HttpError(404, 'This listing is not available.');
    if (listing.issuer_id === investor.id) throw new HttpError(403, 'You cannot buy shares in your own listing.');
    if (quantity > Number(listing.remaining_shares))
      throw new HttpError(
        409,
        `Only ${Number(listing.remaining_shares).toLocaleString('en-US')} shares remain in this listing.`,
        'SOLD_OUT'
      );

    const [fx, eur] = (
      await client.query("SELECT currency, usd_per_unit FROM fx_rates WHERE currency IN ($1,'EUR')", [listing.currency])
    ).rows.reduce((acc, r) => {
      if (r.currency === listing.currency) acc[0] = Number(r.usd_per_unit);
      if (r.currency === 'EUR') acc[1] = Number(r.usd_per_unit);
      return acc;
    }, []);
    if (!fx || !eur) throw new HttpError(500, 'Exchange rates are not configured.');

    const totalInCurrency = Number(listing.price) * quantity; // in the listing currency
    const totalCents = Math.round(totalInCurrency * 100);
    const costUsdCents = Math.round(totalInCurrency * fx * 100);
    const user = (await client.query('SELECT balance_cents FROM users WHERE id=$1 FOR UPDATE', [investor.id])).rows[0];
    if (costUsdCents > Number(user.balance_cents))
      throw new HttpError(400, 'Not enough practice balance for this order.', 'INSUFFICIENT_BALANCE');

    await client.query('UPDATE applications SET remaining_shares = remaining_shares - $2 WHERE id=$1', [
      listing.id,
      quantity,
    ]);
    await client.query('UPDATE users SET balance_cents = balance_cents - $2 WHERE id=$1', [investor.id, costUsdCents]);
    const order = (
      await client.query(
        `INSERT INTO company_orders(reference,application_id,investor_id,quantity,price,currency,total_cents)
         VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [
          `ORD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          listing.id,
          investor.id,
          quantity,
          listing.price,
          listing.currency,
          totalCents,
        ]
      )
    ).rows[0];
    const saleEurCents = Math.round((totalInCurrency * fx * 100) / eur);
    const { basisCents, feeCents } = feeFor(saleEurCents);
    await client.query(
      `INSERT INTO fund_ledger(order_id,sale_value_eur_cents,basis_eur_cents,fee_eur_cents,basis,rate)
       VALUES($1,$2,$3,$4,$5,$6)`,
      [order.id, saleEurCents, basisCents, feeCents, env.fund.basis, env.fund.rate]
    );
    return {
      order: toOrder({ ...order, name: listing.name, symbol: listing.symbol, fee_eur_cents: feeCents }),
      listing: toListing({ ...listing, remaining_shares: Number(listing.remaining_shares) - quantity }),
      practiceCost: costUsdCents / 100,
    };
  });
}

const ORDER_SELECT = `SELECT o.*, a.name, a.symbol, u.display_name investor_name, f.fee_eur_cents
  FROM company_orders o JOIN applications a ON a.id=o.application_id
  LEFT JOIN users u ON u.id=o.investor_id LEFT JOIN fund_ledger f ON f.order_id=o.id`;

async function investorOrders(investorId) {
  const rows = await many(`${ORDER_SELECT} WHERE o.investor_id=$1 ORDER BY o.created_at DESC LIMIT 200`, [investorId]);
  return rows.map((r) => toOrder({ ...r, investor_name: undefined }));
}

async function issuerOrders(issuerId) {
  const rows = await many(`${ORDER_SELECT} WHERE a.issuer_id=$1 ORDER BY o.created_at DESC LIMIT 500`, [issuerId]);
  return rows.map(toOrder);
}

module.exports = { list, get, buy, investorOrders, issuerOrders };
