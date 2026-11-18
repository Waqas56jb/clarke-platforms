// Vercel Routing Middleware: forwards /api requests to the Clarke Social API and adds the shared proxy
// secret, which the API requires before it trusts the visitor IP in X-Vercel-Forwarded-For.
// BACKEND_ORIGIN and PROXY_SECRET are server-side Vercel environment variables, never sent to browsers.
import { rewrite } from '@vercel/functions';

export const config = { matcher: '/api/:path*' };

export default function middleware(request) {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set('x-clarke-proxy-secret', process.env.PROXY_SECRET || '');
  return rewrite(new URL(`${url.pathname}${url.search}`, process.env.BACKEND_ORIGIN), { request: { headers } });
}
