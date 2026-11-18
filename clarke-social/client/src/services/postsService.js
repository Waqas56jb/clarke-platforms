import { api, post, upload } from './http';

export const listPosts = ({ view = 'all', sort = 'latest', userId } = {}) =>
  api(`/api/posts?${new URLSearchParams({ view, sort, ...(userId ? { userId } : {}) })}`);
export const getPost = (id) => api(`/api/posts/${id}`);
export const createTextPost = (payload) => post('/api/posts', payload);
// options: { onProgress(percent), signal } — see http.upload.
export const createMediaPost = (fields, media, options) => upload('post', fields, { media }, options);
export const deletePost = (id) => api(`/api/posts/${id}`, { method: 'DELETE' });
export const toggleLike = (id) => post(`/api/posts/${id}/like`);
export const toggleSave = (id) => post(`/api/posts/${id}/save`);
export const recordShare = (id) => post(`/api/posts/${id}/share`);
export const toggleRepost = (id) => post(`/api/posts/${id}/repost`);
export const listComments = (id) => api(`/api/posts/${id}/comments`);
export const addComment = (id, body) => post(`/api/posts/${id}/comments`, { body });
export const reportPost = (id, reason) => post(`/api/posts/${id}/report`, { reason });
export const downloadLink = (id) => api(`/api/posts/${id}/download-link`);
