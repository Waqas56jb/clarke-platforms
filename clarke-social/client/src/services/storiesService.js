import { api, upload } from './http';

export const listStories = () => api('/api/stories');
// options: { onProgress(percent), signal } — see http.upload.
export const createStory = (caption, media, options) => upload('story', { caption }, { media }, options);
export const deleteStory = (id) => api(`/api/stories/${id}`, { method: 'DELETE' });
