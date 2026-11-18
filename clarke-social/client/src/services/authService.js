import { api, postJson } from './http';

export const fetchMe = () => api('/api/me');
export const signIn = (mode, payload) => postJson(`/api/auth/${mode}`, payload);
export const signOut = () => api('/api/auth/logout', { method: 'POST' });
export const updateMe = (payload) => api('/api/me', { method: 'PATCH', body: JSON.stringify(payload) });
