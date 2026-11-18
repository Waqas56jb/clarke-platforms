// Practice trading with the virtual balance. Every order is validated, saved and applied in one
// transaction with the account and position rows locked, so concurrent orders cannot overspend.
const { many, withTransaction } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso, dollars } = require('../utils/serializers');
const { toInstrument } = require('./marketService');

const MAX_UNITS = 1_000_000;

function parseOrder(body) {
  const side = body.side === 'sell' ? 'sell' : body.side === 'buy' ? 'buy' : null;
  const units = Number(body.units);
  if (!side) throw new HttpError(400, 'Choose buy or sell.');
  if (!Number.isInteger(units) || units < 1 || units > MAX_UNITS)
    throw new HttpError(400, `Enter a whole number of units between 1 and ${MAX_UNITS.toLocaleString('en-US')}.`);
  return { side, units, instrumentId: Number(body.instrumentId) || 0 };
}

async function placeTrade(userId, body) {
  const { side, units, instrumentId } = parseOrder(body || {});
  return withTransaction(async (client) => {
    const instrument = (await client.query('SELECT * FROM instruments WHERE id=$1', [instrumentId])).rows[0];
    if (!instrument) throw new HttpError(404, 'Instrument not found.');
    const user = (await client.query('SELECT * FROM users WHERE id=$1 FOR UPDATE', [userId])).rows[0];
    const holding = (
      await client.query('SELECT * FROM holdings WHERE user_id=$1 AND instrument_id=$2 FOR UPDATE', [
        userId,
        instrumentId,
      ])
    ).rows[0];
    const totalCents = Math.round(Number(instrument.price) * units * 100);
    let realised = null;

    if (side === 'buy') {
      if (totalCents > Number(user.balance_cents))
        throw new HttpError(400, 'Not enough practice balance for this order.', 'INSUFFICIENT_BALANCE');
      await client.query('UPDATE users SET balance_cents = balance_cents - $2 WHERE id=$1', [userId, totalCents]);
      await client.query(
        `INSERT INTO holdings(user_id,instrument_id,units,cost_cents) VALUES($1,$2,$3,$4)
         ON CONFLICT(user_id,instrument_id) DO UPDATE SET units=holdings.units+$3, cost_cents=holdings.cost_cents+$4`,
        [userId, instrumentId, units, totalCents]
      );
    } else {
      if (!holding || holding.units < units)
        throw new HttpError(400, 'You do not hold enough units to sell.', 'INSUFFICIENT_UNITS');
      // Average-cost basis: the units sold carry their share of the position's total cost.
      const costOfSold = Math.round((Number(holding.cost_cents) * units) / holding.units);
      realised = totalCents - costOfSold;
      await client.query('UPDATE users SET balance_cents = balance_cents + $2 WHERE id=$1', [userId, totalCents]);
      if (holding.units === units)
        await client.query('DELETE FROM holdings WHERE user_id=$1 AND instrument_id=$2', [userId, instrumentId]);
      else
        await client.query(
          'UPDATE holdings SET units=units-$3, cost_cents=cost_cents-$4 WHERE user_id=$1 AND instrument_id=$2',
          [userId, instrumentId, units, costOfSold]
        );
    }

    const trade = (
      await client.query(
        `INSERT INTO trades(user_id,instrument_id,side,units,price,total_cents,realised_cents)
         VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [userId, instrumentId, side, units, instrument.price, totalCents, realised]
      )
    ).rows[0];
    return { trade: toTrade({ ...trade, symbol: instrument.symbol, name: instrument.name }) };
  });
}

const toTrade = (t) => ({
  id: t.id,
  side: t.side,
  units: t.units,
  price: Number(t.price),
  total: dollars(t.total_cents),
  realised: t.realised_cents === null ? null : dollars(t.realised_cents),
  symbol: t.symbol,
  name: t.name,
  createdAt: iso(t.created_at),
});

// Holdings at current stored prices, company-share orders, cash, and the full trade history.
async function portfolio(user) {
  const holdings = (
    await many(
      `SELECT h.units, h.cost_cents, i.* FROM holdings h JOIN instruments i ON i.id=h.instrument_id
       WHERE h.user_id=$1 ORDER BY i.sort_order`,
      [user.id]
    )
  ).map((h) => {
    const value = Math.round(Number(h.price) * h.units * 100);
    return {
      instrument: toInstrument(h),
      units: h.units,
      averageCost: Number(h.cost_cents) / h.units / 100,
      cost: dollars(h.cost_cents),
      value: dollars(value),
      profit: dollars(value - Number(h.cost_cents)),
    };
  });
  const companyShares = await many(
    `SELECT a.id, a.reference, a.name, a.symbol, a.currency, a.price, SUM(o.quantity)::bigint quantity,
            SUM(o.total_cents)::bigint paid_cents, f.usd_per_unit
     FROM company_orders o JOIN applications a ON a.id=o.application_id JOIN fx_rates f ON f.currency=a.currency
     WHERE o.investor_id=$1 GROUP BY a.id, f.usd_per_unit ORDER BY a.name`,
    [user.id]
  );
  const trades = await many(
    `SELECT t.*, i.symbol, i.name FROM trades t JOIN instruments i ON i.id=t.instrument_id
     WHERE t.user_id=$1 ORDER BY t.created_at DESC, t.id DESC LIMIT 200`,
    [user.id]
  );
  const shares = companyShares.map((c) => ({
    listingId: c.id,
    reference: c.reference,
    name: c.name,
    symbol: c.symbol,
    currency: c.currency,
    quantity: Number(c.quantity),
    paid: dollars(c.paid_cents),
    // Valued at the listing's offer price, converted to US dollars with the stored rate.
    valueUsd: Math.round(Number(c.price) * Number(c.quantity) * Number(c.usd_per_unit) * 100) / 100,
  }));
  const invested = holdings.reduce((s, h) => s + h.value, 0) + shares.reduce((s, c) => s + c.valueUsd, 0);
  const cash = dollars(user.balance_cents);
  return {
    cash,
    holdingsValue: Math.round(invested * 100) / 100,
    totalValue: Math.round((cash + invested) * 100) / 100,
    unrealisedProfit: Math.round(holdings.reduce((s, h) => s + h.profit, 0) * 100) / 100,
    holdings,
    companyShares: shares,
    trades: trades.map(toTrade),
  };
}

module.exports = { placeTrade, portfolio };
