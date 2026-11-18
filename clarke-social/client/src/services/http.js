// HTTP helpers. Normal API calls go to /api on the website (proxied to the API host, so the HTTP-only
// session cookie works). Uploads, media and signed file links go straight to the API host.
const BACKEND_ORIGIN = (import.meta.env.VITE_BACKEND_ORIGIN || '').replace(/\/$/, '');
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const readCookie = (name) =>
  document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1) || '';

let csrfRequest = null;
async function csrfToken() {
  const existing = readCookie('clarke_csrf');
  if (existing) return existing;
  csrfRequest ||= fetch('/api/auth/csrf').then((r) => r.json());
  const { csrfToken: token } = await csrfRequest;
  csrfRequest = null;
  return token;
}

async function parse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new ApiError(data.error || 'Something went wrong. Please try again.', response.status, data.code);
  return data;
}

export async function api(url, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (UNSAFE.has(method)) headers['X-CSRF-Token'] = await csrfToken();
  let response;
  try {
    response = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('You appear to be offline. Check your connection and try again.', 0);
  }
  return parse(response);
}

export const post = (url, body) => api(url, { method: 'POST', body });

// Sends a multipart upload straight to the API host with a short-lived upload token.
export async function upload(kind, fields, files) {
  const { token } = await api('/api/uploads/token');
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  Object.entries(files).forEach(([k, file]) => file && form.append(k, file));
  let response;
  try {
    response = await fetch(`${BACKEND_ORIGIN}/api/uploads/${kind}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ApiError('The upload could not be sent. Check your connection and try again.', 0);
  }
  return parse(response);
}

// Absolute URL for uploaded media and signed file links, which are served by the API host.
export const mediaUrl = (path) =>
  path && (path.startsWith('/uploads/') || path.startsWith('/api/files/')) ? `${BACKEND_ORIGIN}${path}` : path;

export const socketOrigin = () => BACKEND_ORIGIN || undefined;
