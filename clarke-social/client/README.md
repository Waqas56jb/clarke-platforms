# Clarke Social — client

React 18 + Vite website for Clarke Social and Clarke Dating. Every screen is backed by the API in `../server`.

## Run locally

Start the API first (see `../server/README.md`), then:

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173 (proxies /api, /uploads and /socket.io to the API)
```

Scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`, `npm run format`.

## Production (Vercel)

| Vercel variable | Where it is used |
| --- | --- |
| `BACKEND_ORIGIN` | `middleware.js` (server-side): the API host that `/api` requests are forwarded to |
| `PROXY_SECRET` | `middleware.js` (server-side): must equal the API's `PROXY_SECRET` |
| `VITE_BACKEND_ORIGIN` | Build time: uploads, media, signed file links and Socket.IO connect straight to this host |

`middleware.js` is Vercel Routing Middleware. It forwards `/api/*` to the API, adding the proxy secret and the
visitor IP Vercel detected (`X-Clarke-Client-Ip`), so the session cookie stays on the website's domain and rate
limits use an IP visitors cannot forge.

## Structure

```
src/
  components/  ui/ (Dialog/bottom sheet, Menu, Confirm/Report dialogs, Skeleton, UploadProgress), nav/ (account
               menu, theme switch), feed/, calls/ (global call overlay), dating/, messages/, music/, movies/,
               payments/, account/, posts/, StateView (skeleton/empty/error)
  pages/       Feed, Post, Member, Posts & updates, Music, Movies, Discover, Dating, Dating premium, Messages,
               Calls, Profile, Settings, Premium
  hooks/       useAsync, usePostList, usePostActions, useCheckout, useUrlActions
  services/    http (CSRF, uploads, media URLs) + one file per API resource
  context/     Auth, Navigation, Socket, Notifications, Calls, Comments, Toast
  styles/      tokens.css (design tokens, light + dark), base.css, components.css, layout.css (bottom tabs <768,
               icon rail 768–1023, sidebar + right panel >=1024), feed.css, social.css, media.css, account.css
```

Design: Inter, Lucide icons, tokens only (no hard-coded colours in screen styles), Light/Dark/System theme saved per
device and applied before first paint, WCAG AA contrast checked for every token pairing, reduced-motion respected.

Email links (`?verify=`, `?reset=`), WiPay returns (`?payment=`) and shared posts (`?post=`) are handled by
`useUrlActions`.
