import { api, postJson } from './http';

export const searchUsers = (q) => api(`/api/users/search?q=${encodeURIComponent(q)}`);
export const toggleFollow = (id) => postJson(`/api/users/${id}/follow`);
