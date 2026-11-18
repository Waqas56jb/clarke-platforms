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

`middleware.js` is Vercel Routing Middleware. It forwards `/api/*` to the API and adds the proxy secret, so the
session cookie stays on the website's domain.

## Structure

```
src/
  components/  layout, feed (Composer, Feed, PostCard, Stories, StoryViewer), modals, dating/, messages/,
               music/, movies/, posts/, StateView (loading/empty/error)
  pages/       Feed, Post, Member, Posts & updates, Music, Movies, Discover, Dating, Dating premium, Messages,
               Calls, Profile, Settings, Premium
  hooks/       useAsync, usePostList, usePostActions, useCheckout, useUrlActions
  services/    http (CSRF, uploads, media URLs) + one file per API resource
  context/     Auth, Navigation, Socket, Notifications, Calls, Comments, Toast
  styles/      clarke.css + preview-sections.css (original design) + live-features.css (new screens, same tokens)
```

Email links (`?verify=`, `?reset=`), WiPay returns (`?payment=`) and shared posts (`?post=`) are handled by
`useUrlActions`.
