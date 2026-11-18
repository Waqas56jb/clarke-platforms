import { api, upload } from './http';

export const listStories = () => api('/api/stories');
export const createStory = (caption, media) => upload('story', { caption }, { media });
export const deleteStory = (id) => api(`/api/stories/${id}`, { method: 'DELETE' });
