# Clarke Social — client

React 18 + Vite conversion of the Clarke Social website. The look and the Posts & updates, Music and Movies
sections come from `Clarke_Social_Movies_Enhanced_Preview(2).html`; the working screens (sign up, sign in, feed,
uploads, comments, profile, discover, dating, calls, payments, settings) come from the Clarke Dating build's
`public/` folder and talk to the server API.

## Run

Start the server first (see `../server/README.md`), then:

```bash
cp .env.example .env      # optional: VITE_API_TARGET if the server is not on http://localhost:3000
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api`, `/uploads` and `/socket.io` to the server so cookies and Socket.IO
behave as same-origin, exactly like the original single-server build.

| Script                              | Purpose                     |
| ----------------------------------- | --------------------------- |
| `npm run dev`                       | Dev server on port 5173     |
| `npm run build` / `npm run preview` | Production build in `dist/` |
| `npm run lint` / `npm run format`   | ESLint / Prettier           |

## Structure

```
src/
  components/   layout (Sidebar, Topbar, MobileNav, RightColumn), feed (Composer, Feed, PostCard),
                modals, CallStage, dating/, music/, movies/, posts/
  pages/        one file per screen: FeedPage (home/videos/saved + preview sections), Discover, Dating,
                DatingPremium, Messages, Calls, Profile, Settings, Premium, PostsUpdates, Music, Movies
  hooks/        useSavedPosts (localStorage), useCheckout, usePaymentResult
  services/     http helper + one file per API resource
  context/      Auth, Navigation, Feed, Calls (Socket.IO + WebRTC), Toast
  styles/       clarke.css (Dating build stylesheet, unchanged) + preview-sections.css (the preview's extra CSS, unchanged)
  utils/
```

The two stylesheets concatenated are byte-for-byte the preview's `<style>` block.

## Behaviour notes

- Posts & updates, Clarke Music and Clarke Movies are browser-only demos exactly as in the preview (no backend
  exists for them): alerts, prompts, local audio audition, in-memory posts/watchlist.
- Saved posts are kept in `localStorage` under `clarke_saved`, as before.
- Payments redirect to Stripe Checkout and show a configuration error until the server has Stripe keys.
