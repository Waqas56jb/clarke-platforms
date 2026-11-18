# Clarke Social — API server

Express + PostgreSQL + Socket.IO API for Clarke Social and its Clarke Dating module: accounts, posts, stories,
messaging, notifications, dating, one-to-one calls, music, movies and WiPay payments.

## Run locally

Requires Node.js 20+ and Docker (for PostgreSQL).

```bash
cp .env.example .env          # set POSTGRES_PASSWORD and the same password in DATABASE_URL
docker compose -p clarke-social up -d db   # PostgreSQL 17 on 127.0.0.1:5433
npm install
npm run dev                   # http://localhost:3000; migrations run automatically on start
```

The client (port 5173) proxies `/api`, `/uploads` and `/socket.io` here in development. Scripts: `npm start`,
`npm run dev`, `npm run migrate`, `npm run lint`, `npm run format`.

## Production architecture

```
Browser ──> Vercel (website + middleware.js) ──/api + X-Clarke-Proxy-Secret──> Railway API ──> Railway PostgreSQL
   │                                                                              │
   └── direct to Railway: uploads (upload token), media, signed file links, Socket.IO (socket token)
                                                                                  └── Railway volume /data
```

- Normal API calls go through the website so the HTTP-only session cookie stays first-party.
- Read-only member lists: `GET /api/users/:id/followers` and `/following`. Dating pass: `POST /api/dating/pass/:id`.
- Uploads, media, signed downloads/streams and the Socket.IO WebSocket go straight to the API host: Vercel's proxy
  limits request bodies to 4.5 MB and cannot carry WebSockets. These requests use short-lived bearer tokens
  (`GET /api/uploads/token`, `GET /api/auth/socket-token`), never cookies.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string (Railway: `${{Postgres-51D4.DATABASE_URL}}`) |
| `JWT_SECRET` | production | 32+ random characters; signs sessions and short-lived tokens |
| `PROXY_SECRET` | production | Same value as Vercel's `PROXY_SECRET`; see "Rate limits and client IPs" |
| `APP_ORIGIN` | yes | Website origin, e.g. `https://clarke-social-site.vercel.app` (CORS, email links, payment return) |
| `TRUST_PROXY` | production | `2` on Railway (client address, then Railway's edge proxy) |
| `UPLOAD_DIR`, `PRIVATE_UPLOAD_DIR` | production | `/data/media` and `/data/private` on the Railway volume |
| `MAX_UPLOAD_MB`, `MAX_MOVIE_UPLOAD_MB` | no | Defaults 100 and 500 |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email | Verification and password-reset emails via [Resend](https://resend.com/api-keys). `EMAIL_FROM` must use a domain verified in Resend |
| `WIPAY_ACCOUNT_NUMBER`, `WIPAY_API_KEY` | for payments | WiPay dashboard → Developer → Payment API |
| `WIPAY_ENVIRONMENT` | for payments | `sandbox` or `live` |
| `WIPAY_COUNTRY_CODE` | for payments | Processing platform: `GD` for a Grenada account (sandbox testing uses `TT`, see below) |
| `WIPAY_CURRENCY`, `WIPAY_FEE_STRUCTURE` | no | `USD`; `merchant_absorb` / `customer_pay` / `split` |
| `TURN_URLS` | for calls across networks | Comma-separated `turn:`/`turns:` URLs |
| `TURN_USERNAME`, `TURN_CREDENTIAL` | with static TURN | Long-term TURN credentials |
| `TURN_SHARED_SECRET`, `TURN_TTL_SECONDS` | with coturn-style TURN | Short-lived credentials generated per member |

When an optional service is not configured the feature says so clearly ("Email sending is not configured yet",
"Payments are not configured yet") and never pretends to succeed.

## Security

- **Sessions:** HTTP-only, SameSite=Lax, Secure (production) cookie holding a 7-day JWT with a token version, so a
  password reset signs out every other session. Every private route checks the session against the database.
- **CSRF:** signed double-submit token (`GET /api/auth/csrf` sets `clarke_csrf`; state-changing requests must send it
  in `X-CSRF-Token`). Upload routes use bearer tokens instead of cookies, so CSRF does not apply to them.
- **Passwords:** bcrypt (cost 12), 10–128 characters, common passwords and username/email rejected.
- **Email:** verification required before sign-in once email sending is configured; reset links expire in 1 hour,
  verification links in 24 hours; only SHA-256 hashes of link tokens are stored; responses do not reveal whether
  an email has an account.
- **Uploads:** size limits per kind; file type checked from the file's first bytes (not the name or browser type);
  renamed with the detected extension; rights evidence and full films stored privately and served only through
  signed links that re-check permission on every request (including creator-controlled post downloads).
- **Rate limits and client IPs:** Vercel's middleware adds `X-Clarke-Proxy-Secret` and `X-Clarke-Client-Ip`, the
  visitor IP from Vercel's own `x-real-ip`. The API uses `X-Clarke-Client-Ip` only when the secret matches; other
  forwarding headers a visitor sends (including `X-Vercel-Forwarded-For`) pass through Vercel's rewrite unchanged, so
  they are never trusted. Requests to the Railway address without the secret are refused for every `/api` route
  except uploads, signed files and health; for those, the IP is the client address Railway's edge writes into
  `X-Forwarded-For` (`TRUST_PROXY=2`), which Railway rewrites so callers cannot forge it. Verified on production by
  forging every header on each request: limits still trigger at exactly the configured counts. Limits: auth 30/15 min,
  email 10/hour, uploads 60/15 min, messages 40/min, checkout 10/hour, API 1,500/15 min, calls 20/min. The counters are
  in memory, which is correct for the single Railway instance; use a shared store before running several.
- **Errors:** one central handler; unexpected errors are logged server-side and clients get a generic message.
- Helmet headers, CORS limited to `APP_ORIGIN`, Socket.IO limited to `APP_ORIGIN` with token auth.

## Messaging, calls and blocks

One-to-one messages are stored in PostgreSQL and delivered live over Socket.IO, with unread counts and read
receipts. **They are not end-to-end encrypted.** Members can message and call each other when they are a mutual
dating match or follow each other, unless either has blocked the other (blocks apply to dating, messaging and
calls).

## Payments (WiPay)

Hosted checkout (`POST {host}/plugins/payments/request`, `method=credit_card_co`). WiPay redirects the browser to
`/api/payments/wipay/return`; access is granted only when `status=success` and
`md5(transaction_id + original_total + api_key)` matches, using the amount stored on our side. Each transaction id
can be used once. Prices are in USD (Grenada's WiPay platform accepts USD only). WiPay has no recurring billing,
so each monthly plan purchase adds 30 days; film rentals give 48 hours.

WiPay's **Grenada sandbox** does not enable card checkout for the shared test account (it answers "The method
credit_card_co is not supported on the GD platform for USD"), so the sandbox is tested on the Trinidad platform
(`WIPAY_COUNTRY_CODE=TT`) with WiPay's public sandbox account (1234567890 / 123). For live payments use the
client's own WiPay account and ask WiPay to enable card payments for it.

## Data

`src/db/migrations/001_initial_schema.sql` holds every table from the original SQLite schema (users, posts, likes,
comments, follows, reports, payments, dating profiles/likes/blocks/reports, call history) plus email tokens, saved
posts, shares, stories, notifications, messages, memberships, music (tracks, likes, playlists) and movies
(watchlist, ratings, rentals). `002_dating_passes.sql` adds dating passes: a profile you pass on is left out of
your dating discovery. Reports are stored for a future admin panel; `users.role` is kept for it.
