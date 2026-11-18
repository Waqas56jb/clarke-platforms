import { api, post, upload } from './http';

export const searchUsers = (q) => api(`/api/users/search?q=${encodeURIComponent(q)}`);
export const suggestions = () => api('/api/users/suggestions');
export const getMember = (id) => api(`/api/users/${id}`);
export const toggleFollow = (id) => post(`/api/users/${id}/follow`);
export const blockMember = (id) => post(`/api/users/${id}/block`);
export const uploadAvatar = (file) => upload('avatar', {}, { avatar: file });
export const searchAll = (q) => api(`/api/search?q=${encodeURIComponent(q)}`);
export const trending = () => api('/api/trending');
