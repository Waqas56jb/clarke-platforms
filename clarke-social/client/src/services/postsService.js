import { api, postJson } from './http';

export const listPosts = (viewerId) => api(`/api/posts?viewer=${viewerId || 0}`);
export const createPost = (form) => api('/api/posts', { method: 'POST', body: form });
export const toggleLike = (id) => postJson(`/api/posts/${id}/like`);
export const listComments = (id) => api(`/api/posts/${id}/comments`);
export const addComment = (id, body) => postJson(`/api/posts/${id}/comments`, { body });
export const reportPost = (id, reason) => postJson(`/api/posts/${id}/report`, { reason });

export async function downloadMedia(id) {
  const response = await fetch(`/api/posts/${id}/download`);
  if (!response.ok) {
    const d = await response.json();
    throw Error(d.error);
  }
  return response.blob();
}
