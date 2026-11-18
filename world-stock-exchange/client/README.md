# World Stock Exchange — client

React 18 + Vite web app for the World Stock Exchange practice platform. It is **not** a licensed exchange: every
trade is practice trading with a virtual balance, and no payments are taken anywhere. All data comes from the API in
`../server`; nothing is stored in the browser except the theme choice.

## Run

Start the API first (`../server`, port 3001), then:

```bash
cp .env.example .env.local   # optional: VITE_API_TARGET if the API is not on http://localhost:3001
npm install
npm run dev
```

Open http://localhost:5174. Vite proxies `/api` to the API so the HTTP-only session cookie stays same-site.

| Script                              | Purpose                     |
| ----------------------------------- | --------------------------- |
| `npm run dev`                       | Dev server on port 5174     |
| `npm run build` / `npm run preview` | Production build in `dist/` |
| `npm run lint` / `npm run format`   | ESLint / Prettier           |

To try the review screen locally, make an account a reviewer from `../server`: `npm run make-reviewer -- <username>`.

## Deploying (Vercel)

`middleware.js` (Vercel Routing Middleware) forwards `/api/*` to the API and adds `X-WSE-Proxy-Secret` and
`X-WSE-Client-Ip`. Set these in the Vercel project:

| Variable              | Where   | Purpose                                                                 |
| --------------------- | ------- | ----------------------------------------------------------------------- |
| `BACKEND_ORIGIN`      | server  | API host, e.g. `https://your-api.up.railway.app`                        |
| `PROXY_SECRET`        | server  | Same value as the API's `PROXY_SECRET`                                  |
| `VITE_BACKEND_ORIGIN` | browser | Same API host; document uploads and signed document links go straight to it |

## Screens

The current screen is kept in the address (`?view=…&id=…&tab=…`), so refresh, shared links and Back/Forward work.

| View        | What it does                                                                                          |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| `home`      | Hero, important notice, balance and portfolio value (or a sign-up prompt), market overview, sections |
| `markets`   | Category filters, instruments with data-source labels, watchlist stars                               |
| `trade`     | Practice trade ticket (whole units, buy/sell) and the member's watchlist                              |
| `portfolio` | Cash, holdings, company shares, practice trade history and company-share orders                       |
| `listings`  | Approved company listings with remaining shares; `listing&id=` opens the buying ticket                |
| `issuer`    | Issuer role switch, application form, document uploads, my applications, orders received              |
| `review`    | Reviewers only: applications by status, documents, history, approve / reject / return to pending      |
| `fund`      | Gold & Diamond fund policy, an illustrative fee calculator using the server settings, and the ledger  |
| `info`      | Payments planned, security and business model                                                         |
| `account`   | Display name, roles, practice balance, issuer role, email status, sign out, delete account            |
| `settings`  | Light / dark / system theme                                                                           |

Prices are labelled "Illustrative data" unless the API marks an instrument's `source` as `market`.

## Structure

```
middleware.js     Vercel Routing Middleware for /api
src/
  components/     app shell (sidebar, rail, tab bar, header), auth dialog, ui/ primitives, and one folder per area
  context/        auth, navigation (URL-synced views), theme, toasts
  hooks/          useAsync, useMarkets, useMediaQuery, useUrlActions (?verify= and ?reset= links)
  pages/          one file per view
  services/       API calls; http.js adds the CSRF header and sends document uploads with progress
  styles/         tokens (navy and gold, light and dark), base, components, layout, account, wse
  utils/          formatting, navigation, views, market and document constants
```
