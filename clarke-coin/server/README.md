# Clarke Coin API — server

Node.js/Express port of the FastAPI "Clarke Coin secure backend" development scaffold, route for route and rule
for rule, on the same PostgreSQL schema.

This is a **development foundation**, not a production-ready financial service. It does not connect to any bank,
credit union, payment provider, card network or payment rail, and it does not issue or sell coins.

## Run locally

Requires Node.js 20+ and Docker (for PostgreSQL).

```bash
cp .env.example .env
```

Generate independent secrets and put them in `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use one value for `JWT_SECRET` (32+ bytes) and a different one for `POSTGRES_PASSWORD`; put the same database
password in `DATABASE_URL`. Then:

```bash
docker compose up -d db     # PostgreSQL 17 on 127.0.0.1:5432 (POSTGRES_PORT to change)
npm install
npm run dev                 # or: npm start
```

Check http://localhost:3002/health. In development the schema is created automatically on start-up from
`src/db/migrations`. With `APP_ENV=production` that is disabled; apply reviewed migrations with `npm run migrate`.

Optional containerised API: `docker compose --profile api up --build`. Backups: `scripts/backup_postgres.sh`.
Never expose the API or database directly to the internet; put it behind a maintained HTTPS reverse proxy/WAF.

## Routes (unchanged from the FastAPI version)

| Method | Path                                  | Notes                                                                                                  |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | `/health`                             |                                                                                                        |
| POST   | `/auth/register`                      | `{ email, password }` (12–128 chars) → 201 `{ id, email, role, mfa_enabled }`; 5/hour per IP           |
| POST   | `/auth/login`                         | `{ email, password, mfa_code? }` → `{ access_token, token_type, expires_in_minutes }`; 5/minute per IP |
| GET    | `/auth/me`                            | current account                                                                                        |
| POST   | `/auth/mfa/setup`                     | `{ secret, provisioning_uri }`; 409 if already enabled                                                 |
| POST   | `/auth/mfa/enable?code=123456`        | `{ mfa_enabled: true }`                                                                                |
| GET    | `/wallet`                             | `{ currency, balance, status }`, balance derived from ledger entries                                   |
| GET    | `/wallet/transactions?limit=&offset=` | newest first, limit clamped to 1–100                                                                   |
| POST   | `/wallet/transfers`                   | requires `Idempotency-Key` (16–100 chars); 403 unless both wallets are active; 10/minute               |

Bearer tokens in `Authorization: Bearer <token>`. Errors use FastAPI's shape: `{"detail": "..."}`, and
`{"detail": [{type, loc, msg, input, ctx}]}` with status 422 for invalid input. Rate-limited requests get 429
`{"error": "Rate limit exceeded: 5 per 1 minute"}`. There is deliberately **no** endpoint to activate wallets, mint
coins, credit accounts, deposit, withdraw, take payments or administer users.

## What was kept

- Argon2id password hashing with the same parameters (time 3, memory 64 MiB, parallelism 2), so existing hashes verify.
- HS256 access tokens with `sub`, `iat`, `exp`, issuer `clarke-coin-api`, default 15 minutes.
- Optional TOTP MFA (otplib, 30 s, 6 digits, ±1 step like `pyotp.verify(valid_window=1)`), required at login once enabled.
- Wallets created `restricted`; transfers rejected unless sender and recipient wallets are `active`.
- Append-only, double-entry ledger: each transfer writes one header and two signed postings (−amount / +amount) in a
  single database transaction with `SELECT … FOR UPDATE` on both wallets; balances are `SUM(amount)`.
- Idempotency-Key uniqueness (409 on reuse, including concurrent reuse).
- Same response security headers (nosniff, DENY framing, no-referrer, permissions policy, no-store, strict CSP; HSTS
  in production), CORS limited to `CORS_ORIGINS` with GET/POST and the three allowed headers, rate limits.
- Same tables, columns, keys and indexes (`users`, `wallets`, `ledger_transactions`, `ledger_entries`).

## Verification done

The original FastAPI app and this port were run side by side against PostgreSQL 17 and given the same ~70 requests
(validation errors, duplicates, auth failures, MFA set-up/enable/login, restricted transfers, operator-activated
transfers, idempotency, insufficient balance, pagination, rate limits, CORS, headers). Responses matched after
masking random IDs, tokens and timestamps, and `pg_dump --schema-only` of both databases was identical.

## Differences

- FastAPI served interactive docs at `/docs` in development; they are not reproduced.
- 422 messages for unusual email addresses may word the reason slightly differently from `email-validator`.
- The FastAPI code declared a 120/minute default limit but never activated it (no slowapi middleware); here it is
  applied to all routes.
- `TRUST_PROXY_HEADERS=true` makes the limiter use `X-Forwarded-For` (uvicorn ran with `--proxy-headers`).

## Still required before handling real money

Everything in the original README remains outstanding: regulatory classification and licensing, AML/KYC and
sanctions screening, email verification, account recovery, MFA enforcement, session revocation, reviewed migrations
and least-privilege roles, secrets management, encrypted backups, audit logging and monitoring, independent code
review and penetration testing, reconciliation and dual-control ledger operations, provider-approved hosted payments,
a shared rate-limit store, and a tested admin approval workflow with separation of duties.
