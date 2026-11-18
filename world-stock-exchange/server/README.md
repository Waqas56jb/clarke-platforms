# World Stock Exchange — API server

Express + PostgreSQL API for the World Stock Exchange **practice** platform: accounts with investor, issuer and
reviewer roles, practice trading with a virtual balance, issuer listing applications with private documents,
reviewer decisions, approved company listings, practice buy orders and the Gold & Diamond fund ledger.

**This is not a licensed exchange.** No real money is taken, held or paid out; there is no payment gateway.
Prices are illustrative unless a market data source is configured.

## Run locally

```bash
cp .env.example .env                 # set POSTGRES_PASSWORD and the same password in DATABASE_URL
docker compose -p wse up -d db       # PostgreSQL 17 on 127.0.0.1:5434
npm install
npm run dev                          # http://localhost:3001; migrations run on start
npm run make-reviewer -- <username>  # the only way to grant the reviewer role (--remove to withdraw)
npm run seed-demo / npm run remove-demo
```

## Architecture (production)

Same as Clarke Social: the website (Vercel) forwards `/api` through `client/middleware.js`, adding
`X-WSE-Proxy-Secret` and `X-WSE-Client-Ip` (the visitor IP from Vercel's own `x-real-ip`). The API refuses `/api`
requests without the secret, except document uploads, signed document links and health, which go straight to
Railway with short-lived bearer tokens (uploads avoid the 4.5 MB proxy body limit). Rate limits key on the
verified client IP and cannot be bypassed with forged forwarding headers; direct requests use the client address
Railway's edge writes (`TRUST_PROXY=2`).

Security: HTTP-only session cookie (`wse_session`, 7 days, token version), signed double-submit CSRF (`wse_csrf`),
bcrypt passwords with a strength policy, Helmet, CORS limited to `APP_ORIGIN`, one central error handler (no
stack traces). Roles are checked on the server for every action.

## Features and rules

- **Practice trading:** every account starts with `PRACTICE_BALANCE_USD` (10,000). Orders are whole units,
  validated and applied in one transaction with the account and position rows locked. Sells record realised
  profit against the average cost.
- **Listings:** issuers submit applications (`POST /api/applications`) and upload documents (prospectus,
  financial statements, certificate of incorporation, regulatory evidence) while pending. Documents are checked by
  content (PDF, Word, JPEG, PNG), limited to `MAX_DOCUMENT_MB`, stored privately and only downloadable by the
  issuer and reviewers through signed links that re-check permission.
- **Review:** reviewers approve, reject or return to pending with a note; every decision is kept with reviewer and
  time. Only approved listings are public.
- **Buying:** a practice buy order locks the listing, checks remaining shares and the practice balance (converted
  to USD with the stored rates), reduces the shares, debits the balance and writes the fund fee — one transaction,
  so listings can never be oversold.
- **Fund fee:** `FUND_FEE_RATE` (0.02) on `FUND_FEE_BASIS`: `gross` (default, sale value) or `profit`. A primary
  listing sale has no recorded cost for the issuer, so under `profit` no fee is recorded for it. The ledger is in
  EUR, converted with the stored illustrative rates.
- **Market data (optional):** with `FINNHUB_API_KEY`, the 8 listed stock tickers are refreshed every
  `MARKET_REFRESH_MINUTES` from Finnhub's quote endpoint and labelled as market data; everything else stays
  "Illustrative data".

## Environment variables

See `.env.example`. Production needs `DATABASE_URL`, `JWT_SECRET`, `PROXY_SECRET` (same value as Vercel's),
`APP_ORIGIN`, `TRUST_PROXY=2` and `PRIVATE_UPLOAD_DIR` on the Railway volume. Optional: `RESEND_API_KEY` +
`EMAIL_FROM` (verification and password reset; without them the site says email is not configured),
`FINNHUB_API_KEY`. `LEGACY_SQLITE_PATH` imports the previous SQLite data once (skipping the old test data), then
can be removed.
