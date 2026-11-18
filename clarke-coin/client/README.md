# Clarke Coin — client

React 18 + Vite conversion of `Clarke_Coin_Exchange_Messaging_Centre.html` (Clarke Coin International Exchange
preview). It looks and behaves exactly like the original page.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5175.

| Script                              | Purpose                     |
| ----------------------------------- | --------------------------- |
| `npm run dev`                       | Dev server on port 5175     |
| `npm run build` / `npm run preview` | Production build in `dist/` |
| `npm run lint` / `npm run format`   | ESLint / Prettier           |

## Behaviour

Everything on this page is a browser-only preview, as before:

- Buy/sell estimates at the illustrative £300 price; the buttons show the "website preview" notice.
- Static order book and illustrative price chart.
- Demo wallet `CCW-100001` with wallet-to-wallet transfers to `CCW-100002`, stored in `localStorage`
  (`clarkeCoinWalletDemo_v1`) with the same checks, confirmation and history.
- Clarke Connect messaging rooms stored in `localStorage` (`clarkeCoinChats_demo_v1`), with search.

The page does **not** call the Clarke Coin API in `../server`. The API works with email accounts, bearer tokens and
wallets that start `restricted` (transfers return 403), while this page has no sign-in and its notices state that
it is a local preview. Connecting the two would require new sign-in screens and would change the demo's behaviour,
so it is left as a decision for the product owner (see the root README).

## Structure

```
src/
  components/  header, hero, trade box, price chart, order book, wallet panel, chat feed, notice, footer
  pages/       trade grid, transfer, transfer history, messaging, overview (market/history/admin), about
  hooks/       useWalletDemo, useChatDemo
  services/    walletDemoStorage, chatDemoStorage (localStorage persistence)
  context/     DemoMessageContext
  styles/      clarke-coin.css (the original stylesheet, unchanged)
  utils/       demo data, formatting, chart drawing
```
