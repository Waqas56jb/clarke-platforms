# World Stock Exchange — client

React 18 + Vite conversion of `World_Stock_Exchange_Updated.html`, with the one item that existed only in the
earlier `world_stock_exchange_backend_demo.html` (the "N company application(s) received…" notice in the company
listings when no application is approved yet).

## Run

Start the API first (`../server`), then:

```bash
cp .env.example .env      # optional: VITE_API_TARGET if the API is not on http://localhost:3001
npm install
npm run dev
```

Open http://localhost:5174. Vite proxies `/api` to the server.

| Script                              | Purpose                     |
| ----------------------------------- | --------------------------- |
| `npm run dev`                       | Dev server on port 5174     |
| `npm run build` / `npm run preview` | Production build in `dist/` |
| `npm run lint` / `npm run format`   | ESLint / Prettier           |

## What uses the API

Issuer applications and review status, company-share demo orders (with remaining shares) and the Gold & Diamond
demo fund ledger. Everything else behaves exactly as before in the browser: market tabs, watchlist, the practice
trade ticket and its demo cash/portfolio (reset on reload, as in the original), the fee calculator preview and the
"Open account" notice.

All "demo only" and regulatory notices are kept word for word, including messages that say data is stored "in this
browser" (now stored by the demo API — see the root README).

## Structure

```
src/
  components/  header, hero, notices, stats, cards, footer
  pages/       one file per page section (markets, trade, listings, buying, issuer portal, dashboard, payments, business model, gold & diamond fund)
  hooks/       useDemoTrading, useBuyingTicket
  services/    http helper, issuers, orders, fund
  context/     ExchangeContext (applications + orders shared across sections)
  styles/      wse.css (the original stylesheet, unchanged)
  utils/       sample market data, formatting
```
