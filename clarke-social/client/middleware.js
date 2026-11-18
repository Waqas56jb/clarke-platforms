// Vercel Routing Middleware: forwards /api requests to the Clarke Social API with two extra headers:
// the shared proxy secret, and X-Clarke-Client-Ip — the visitor IP as Vercel's edge saw it (x-real-ip,
// which Vercel sets itself). Visitor-supplied forwarding headers such as X-Vercel-Forwarded-For are
// passed through unchanged by the rewrite, so the API must not trust those.
// BACKEND_ORIGIN and PROXY_SECRET are server-side Vercel environment variables, never sent to browsers.
import { ipAddress, rewrite } from '@vercel/functions';

export const config = { matcher: '/api/:path*' };

export default function middleware(request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set('x-clarke-proxy-secret', process.env.PROXY_SECRET || '');
  headers.set('x-clarke-client-ip', ipAddress(request) || '');
  return rewrite(new URL(`${url.pathname}${url.search}`, process.env.BACKEND_ORIGIN), { request: { headers } });
}
