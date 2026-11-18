# World Stock Exchange — demo API

Small Express + SQLite (better-sqlite3) API that stores what the original single-page demo kept in
`localStorage`: issuer applications and their review status, company-share demo orders, and the Gold & Diamond
demo fund ledger.

**Demonstration only.** It does not execute trades, hold funds, take payments, transfer shares or upload documents
(only file names are stored). Nothing here should be connected to real money.

## Run

Requires Node.js 20+.

```bash
cp .env.example .env
npm install
npm run dev        # or: npm start
```

Listens on http://localhost:3001 and creates `wse.sqlite`. Set `CLIENT_DIST_DIR=../client/dist` to serve a built
client from the same origin.

| Variable          | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `PORT`            | Default 3001                                                              |
| `APP_ORIGIN`      | Client origin allowed by CORS (default dev client: http://localhost:5174) |
| `DB_FILE`         | SQLite file, relative to this folder                                      |
| `CLIENT_DIST_DIR` | Optional built client to serve                                            |

No secrets are needed.

## API

| Method | Path                      | Body                                                      | Result                                                                                     |
| ------ | ------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/issuers`            |                                                           | `{ applications }`, newest first                                                           |
| POST   | `/api/issuers`            | form fields, `files` (names only), `declaration: true`    | `201 { application }` with status `Pending review`                                         |
| PATCH  | `/api/issuers/:id/status` | `{ status }` = `Pending review` / `Approved` / `Rejected` | `{ application }`                                                                          |
| GET    | `/api/orders`             |                                                           | `{ orders }`, newest first                                                                 |
| POST   | `/api/orders`             | `{ applicationId, quantity }`                             | `201 { order, application }`; 400 if not approved / under 1 share, 409 if more than remain |
| GET    | `/api/fund`               |                                                           | `{ total }` in EUR                                                                         |
| POST   | `/api/fund/fees`          | `{ saleValue }`                                           | `201 { saleValue, fee, total }`; fee = 2% rounded to cents                                 |
| GET    | `/api/health`             |                                                           | status                                                                                     |

Application and order references keep the original formats (`WSE-…`, `DEMO-…`). Order placement and the
remaining-share decrement run in one transaction.

The review endpoint is the same prototype control as the original page's buttons: **it has no authentication** and
is not a secure administrator approval process. Add real admin accounts before any non-demo use.

## Safeguards

Helmet headers, CORS limited to `APP_ORIGIN`, 100 kB JSON limit, rate limits (300 requests and 60 writes per
15 minutes per IP), server-side validation of every field (lengths, allowed sectors/currencies, URL and email
format, whole-share quantities, positive prices), JSON error responses, and database CHECK constraints.

## Structure

```
src/config  db  middleware  routes  controllers  services  utils  app.js  server.js
```
