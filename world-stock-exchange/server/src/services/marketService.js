// Instruments, the data-source label, and each member's watchlist.
const env = require('../config/env');
const { one, many, query } = require('../db/pool');
const HttpError = require('../utils/httpError');
const { iso } = require('../utils/serializers');

const toInstrument = (r) => ({
  id: r.id,
  symbol: r.symbol,
  name: r.name,
  category: r.category,
  sector: r.sector,
  price: Number(r.price),
  changePct: Number(r.change_pct),
  quoteBased: r.quote_based,
  source: r.source,
  updatedAt: iso(r.updated_at),
  watched: Boolean(r.watched),
});

// "market" only when a provider is configured and has actually refreshed this instrument.
function dataSource() {
  return env.marketData.finnhubKey
    ? { label: 'Market data from Finnhub (may be delayed)', provider: 'finnhub', configured: true }
    : { label: 'Illustrative data', provider: null, configured: false };
}

async function list(viewerId) {
  const rows = await many(
    `SELECT i.*, EXISTS(SELECT 1 FROM watchlist w WHERE w.user_id=$1 AND w.instrument_id=i.id) watched
     FROM instruments i ORDER BY i.sort_order, i.id`,
    [viewerId || 0]
  );
  return { instruments: rows.map(toInstrument), dataSource: dataSource() };
}

async function requireInstrument(id) {
  const row = await one('SELECT * FROM instruments WHERE id=$1', [Number(id) || 0]);
  if (!row) throw new HttpError(404, 'Instrument not found.');
  return row;
}

async function toggleWatch(userId, instrumentId) {
  const instrument = await requireInstrument(instrumentId);
  const removed = await query('DELETE FROM watchlist WHERE user_id=$1 AND instrument_id=$2', [userId, instrument.id]);
  if (!removed.rowCount)
    await query('INSERT INTO watchlist(user_id,instrument_id) VALUES($1,$2)', [userId, instrument.id]);
  return { watched: !removed.rowCount };
}

async function watchlist(userId) {
  const rows = await many(
    `SELECT i.*, true watched FROM watchlist w JOIN instruments i ON i.id=w.instrument_id
     WHERE w.user_id=$1 ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows.map(toInstrument);
}

module.exports = { list, toggleWatch, watchlist, requireInstrument, toInstrument, dataSource };
