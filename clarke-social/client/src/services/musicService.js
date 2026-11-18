import { api, post, upload } from './http';

export const listTracks = () => api('/api/music/tracks');
export const uploadTrack = (fields, audio, proof) => upload('track', fields, { audio, proof });
export const deleteTrack = (id) => api(`/api/music/tracks/${id}`, { method: 'DELETE' });
export const toggleTrackLike = (id) => post(`/api/music/tracks/${id}/like`);
export const reportTrack = (id, reason) => post(`/api/music/tracks/${id}/report`, { reason });
export const listPlaylists = () => api('/api/music/playlists');
export const createPlaylist = (name) => post('/api/music/playlists', { name });
export const addToPlaylist = (playlistId, trackId) => post(`/api/music/playlists/${playlistId}/tracks`, { trackId });
