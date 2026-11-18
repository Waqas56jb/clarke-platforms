# clarke-platforms

Monorepo for the Clarke web platforms. Each website has a React 18 + Vite client and a Node.js 20+ Express server.

| Website | What it is | Client | Server | Database |
| --- | --- | --- | --- | --- |
| `clarke-social/` | Clarke Social with the Clarke Dating module: accounts, feed, uploads, comments, follows, dating, WebRTC calls, Stripe Checkout, plus the Posts, Music and Movies preview sections | http://localhost:5173 | http://localhost:3000 | SQLite |
| `world-stock-exchange/` | World Stock Exchange concept site with a small demo API for issuer applications, demo company-share orders and the Gold & Diamond demo ledger | http://localhost:5174 | http://localhost:3001 | SQLite |
| `clarke-coin/` | Clarke Coin International Exchange preview, and the Clarke Coin API (accounts, TOTP MFA, restricted wallets, append-only double-entry ledger) | http://localhost:5175 | http://localhost:3002 | PostgreSQL (Docker) |

None of these handles real money: payments stay disabled until Stripe keys are configured (Clarke Social), the
exchange and Clarke Coin pages are demonstrations, and Clarke Coin wallets are restricted with no funding endpoints.

## Quick start

Requires Node.js 20+ (tested on Node 24) and Docker for Clarke Coin's PostgreSQL. In every `client/` and `server/`
folder, copy `.env.example` to `.env` and fill in the secrets it asks for, then `npm install`.

```bash
# Clarke Social
cd clarke-social/server && npm run dev        # API on :3000
cd clarke-social/client && npm run dev        # site on :5173

# World Stock Exchange
cd world-stock-exchange/server && npm run dev # API on :3001
cd world-stock-exchange/client && npm run dev # site on :5174

# Clarke Coin
cd clarke-coin/server && docker compose up -d db && npm run dev   # API on :3002
cd clarke-coin/client && npm run dev                              # site on :5175
```

Each folder's README has the details: environment variables, routes, structure and security notes. Every package
has `npm run lint` (ESLint) and `npm run format` (Prettier).

## Production deployment

| Website | Public site (Vercel) | API (Railway, proxied through the Vercel domain) |
| --- | --- | --- |
| Clarke Social | https://clarke-social-site.vercel.app | `/api` → `clarke-social-api` via `client/middleware.js`; uploads, media and Socket.IO go direct (Railway Postgres + volume `/data`) |
| World Stock Exchange | https://world-stock-exchange-site.vercel.app | `/api` → `wse-api` via `client/middleware.js`; document uploads and signed links go direct (Railway Postgres + volume `/data`) |
| Clarke Coin | https://clarke-coin-exchange.vercel.app | `/api/*` → `clarke-coin-api` + Railway Postgres |

Clarke Coin keeps its rewrites in `client/vercel.json`; Clarke Social and World Stock Exchange use Vercel Routing
Middleware with a proxy secret, described in each `server/README.md`. In every case browsers make their API calls to the Vercel domain, so cookies stay
first-party. Railway variables: `NODE_ENV=production`, `TRUST_PROXY=2` (`TRUST_PROXY_HEADERS=2`
for Clarke Coin), `APP_ORIGIN`/`CORS_ORIGINS` set to the Vercel domain, private uploads under `/data`, and
`RUN_MIGRATIONS_ON_START=true` for Clarke Coin. Redeploy a backend with
`railway up <site>/server --path-as-root --service <service>` and a frontend with `vercel deploy --prod` in its
`client/` folder.

## Layout

```
clarke-coin/            client/  server/
clarke-social/          client/  server/
world-stock-exchange/   client/  server/
```

Clients: `src/{components,pages,hooks,services,context,styles,utils}`. Servers:
`src/{config,db,middleware,routes,controllers,services,sockets,utils}` with `app.js` and `server.js`.

## History

This repository was restructured from the original attachments (Clarke Dating full-stack build, Clarke Social
starter, Clarke Coin FastAPI backend and three standalone HTML previews). The untouched originals are preserved in
git history in commit `8c82b13` ("Add untouched original client files for recovery").

## Product decisions still open

- **Clarke Coin site ↔ API.** The Clarke Coin page is a self-contained browser demo with no sign-in; the API needs
  email/password login and keeps wallets restricted. Connecting them needs new sign-in screens.
- **Private messaging (Clarke Social).** The Dating build deliberately keeps private messaging disabled until a
  maintained Signal Protocol implementation and device/key management are integrated. The starter's
  encrypted-envelope endpoints were ported to the server so nothing is lost, but the UI still shows the "Private chat
  is being secured" notice and no client encrypts messages.
- **"Stored in this browser" wording (World Stock Exchange).** Notices were kept word for word, but issuer
  applications, demo orders and the fund ledger are now kept by the demo API and are shared by everyone using it.
- **WSE review buttons** (Approve / Reject / Return to pending) are the same unauthenticated prototype control as
  before; add administrator accounts before any non-demo use.
