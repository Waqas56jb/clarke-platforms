# Clarke Social — server

Express + SQLite (better-sqlite3) + Socket.IO + Stripe API for Clarke Social and its Clarke Dating module.
This is the Clarke Dating full-stack `server.js` split into modules, plus everything that existed only in the
older Clarke Social starter.

## Run

Requires Node.js 20+.

```bash
cp .env.example .env      # then set JWT_SECRET to a random value of 32+ characters
npm install
npm run dev               # or: npm start
```

The API listens on http://localhost:3000. The SQLite database is created as `clarke.sqlite` and uploads are stored
in `uploads/` (both configurable in `.env`). In development the client (port 5173) proxies `/api`, `/uploads` and
`/socket.io` here, so the browser still sees one origin and the HTTP-only session cookie works unchanged.

For a single-origin production deployment, build the client and set `CLIENT_DIST_DIR=../client/dist`; the server
then serves the built client and falls back to `index.html`, as the original did with `public/`.

| Script                      | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `npm start` / `npm run dev` | Start the server (dev restarts on changes) |
| `npm run lint`              | ESLint                                     |
| `npm run format`            | Prettier                                   |

## Environment

| Variable                                       | Purpose                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `NODE_ENV`                                     | `production` makes `JWT_SECRET` mandatory and the session cookie `Secure`                 |
| `PORT`                                         | Default 3000                                                                              |
| `JWT_SECRET`                                   | Session signing secret (32+ chars). A temporary random secret is used in development only |
| `APP_ORIGIN`                                   | Client origin; used for CORS and Stripe success/cancel URLs                               |
| `MAX_UPLOAD_MB`                                | Upload limit, clamped to 1–250 MB (default 100)                                           |
| `UPLOAD_DIR`, `DB_FILE`                        | Storage locations, relative to this folder                                                |
| `CLIENT_DIST_DIR`                              | Optional built client to serve                                                            |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`   | Optional Stripe Checkout (test keys first)                                                |
| `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL` | Optional TURN relay for calls                                                             |

## Structure

```
src/
  config/env.js            env loading and validation
  db/schema.js, connection.js
  middleware/              auth (cookie or Bearer), rate limits, multer upload checks, error handler
  routes/                  one router per resource (+ legacyRoutes for starter-only endpoints)
  controllers/             request/response handling
  services/                business logic and SQL
  sockets/                 Socket.IO auth and call signalling
  utils/
  app.js, server.js
```

## API (unchanged paths, bodies, responses and status codes)

| Method      | Path                                                                      | Notes                                                    |
| ----------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| POST        | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`               | HTTP-only `clarke_session` cookie                        |
| GET / PATCH | `/api/me`                                                                 |                                                          |
| GET / POST  | `/api/posts`                                                              | multipart `media` upload; `allowDownload` only for video |
| POST        | `/api/posts/:id/like`                                                     | toggle                                                   |
| GET / POST  | `/api/posts/:id/comments`                                                 |                                                          |
| POST        | `/api/posts/:id/report`                                                   |                                                          |
| GET         | `/api/posts/:id/download`                                                 | creator permission enforced                              |
| POST        | `/api/users/:id/follow`                                                   | toggle                                                   |
| GET         | `/api/users/search?q=`                                                    |                                                          |
| GET / PUT   | `/api/dating/me`                                                          | 18+ check                                                |
| GET         | `/api/dating/discover`, `/api/dating/matches`                             |                                                          |
| POST        | `/api/dating/like/:id`, `/api/dating/block/:id`, `/api/dating/report/:id` |                                                          |
| GET         | `/api/payments/config`, `/api/payments/history`                           |                                                          |
| POST        | `/api/payments/checkout`                                                  | 10/hour limit; 503 until Stripe keys are set             |
| POST        | `/api/payments/webhook`                                                   | raw body, Stripe signature verified                      |
| GET         | `/api/calls/ice-config`, `/api/calls/history`                             |                                                          |
| GET         | `/uploads/*`                                                              | static, 7-day immutable cache                            |

Socket.IO events: `call:invite`, `call:answer`, `call:ice`, `call:decline`, `call:end` (with `call:incoming`,
`call:ringing`, `call:answered`, `call:declined`, `call:ended`, `call:error`), and disconnect clean-up.

### Ported from the Clarke Social starter

A line-by-line comparison with the starter's `server.js` found these items missing from the Dating build. They are
all included here so nothing is lost:

| Starter feature                                                            | Where it lives now                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------- |
| `POST /api/messages` (ciphertext envelope) and `GET /api/messages/:userId` | `routes/messageRoutes.js`, `services/messageService.js` |
| `messages` table                                                           | `db/schema.js`                                          |
| `message:new` Socket.IO event to the recipient                             | `controllers/messageController.js`                      |
| `POST /api/register`, `POST /api/login` returning a Bearer token           | `routes/legacyRoutes.js`                                |
| `POST /api/follow/:userId` (follow only, idempotent)                       | `routes/legacyRoutes.js`                                |
| `GET /api/health`                                                          | `routes/legacyRoutes.js`                                |
| General `/api/` rate limit (300 requests / 15 min per IP)                  | `middleware/rateLimits.js`                              |
| CORS restricted to `APP_ORIGIN`                                            | `app.js`                                                |
| Socket.IO auth via `handshake.auth.token`                                  | `sockets/socketAuth.js`                                 |
| `call:signal` generic relay                                                | `sockets/callHandlers.js`                               |

**Private messaging remains disabled in the product.** The Dating build notes state that private messaging is
deliberately disabled until a maintained Signal Protocol implementation and full device/key lifecycle are
integrated, and that E2EE must not be claimed yet. The envelope endpoints only store and relay ciphertext supplied
by a client; no client encrypts messages and the Messages screen keeps its "Private chat is being secured" notice.

Merge decisions: the starter's `users` table had no display name, so `/api/register` stores the username as the
display name; its tokens use the same signing key and format as the cookie session so they work on every
authenticated route. The legacy register/login routes also get the 30-per-15-minutes auth limit.

## Security measures kept

bcrypt (cost 12) password hashing; HTTP-only, SameSite=Lax session cookie (Secure in production); Helmet with
`x-powered-by` disabled; auth (30/15 min), checkout (10/hour) and general API rate limits; per-user call attempt
limit (20/min); upload size limit and JPG/PNG/WEBP/GIF/MP4/WEBM/MOV type check; Stripe webhook signature
verification; CORS limited to `APP_ORIGIN`; Socket.IO same-origin only; input validation as in the original.

## Known behaviour carried over unchanged

- A request for a missing file under `/uploads/` returns 500 "Something went wrong" (the original error handler
  converts the static handler's 404). Kept to preserve status codes.
- The general limiter counts every API call (including feed reloads after a like), so heavy use from one IP can
  receive 429 within 15 minutes. This is the starter's setting.

The production checklist in the original build notes (CSRF protection, email verification, password reset,
moderation, managed database, media scanning, TURN, legal review, security testing) still applies.
