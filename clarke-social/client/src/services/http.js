export async function api(url, options = {}) {
  const isForm = options.body instanceof FormData;
  const opts = {
    ...options,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) },
  };
  const response = await fetch(url, opts);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const postJson = (url, body) =>
  api(url, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
