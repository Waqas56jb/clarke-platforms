// Optional market data: with FINNHUB_API_KEY set, stock instruments that have a provider symbol are
// refreshed from Finnhub's quote endpoint (GET /api/v1/quote?symbol=...: c = current price,
// dp = percent change). Without a key nothing runs and the stored illustrative values are shown.
const env = require('../config/env');
const { many, query } = require('../db/pool');

const QUOTE_URL = 'https://finnhub.io/api/v1/quote';

async function refreshOnce() {
  const rows = await many("SELECT id, provider_symbol FROM instruments WHERE provider_symbol <> ''");
  for (const row of rows) {
    try {
      const url = `${QUOTE_URL}?symbol=${encodeURIComponent(row.provider_symbol)}&token=${env.marketData.finnhubKey}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) continue;
      const quote = await response.json();
      if (!(Number(quote.c) > 0)) continue;
      await query("UPDATE instruments SET price=$2, change_pct=$3, source='market', updated_at=now() WHERE id=$1", [
        row.id,
        quote.c,
        Number(quote.dp) || 0,
      ]);
    } catch (err) {
      console.warn(`Market data refresh failed for ${row.provider_symbol}: ${err.message}`);
    }
  }
}

function startMarketData() {
  if (!env.marketData.finnhubKey) return;
  refreshOnce();
  setInterval(refreshOnce, env.marketData.refreshMinutes * 60 * 1000).unref();
}

module.exports = { startMarketData, refreshOnce };
