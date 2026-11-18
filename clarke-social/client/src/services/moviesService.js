import { api, post, upload } from './http';

export const listMovies = () => api('/api/movies');
export const uploadMovie = (fields, files) => upload('movie', fields, files);
export const deleteMovie = (id) => api(`/api/movies/${id}`, { method: 'DELETE' });
export const toggleWatchlist = (id) => post(`/api/movies/${id}/watchlist`);
export const rateMovie = (id, score) => post(`/api/movies/${id}/rate`, { score });
export const reportMovie = (id, reason) => post(`/api/movies/${id}/report`, { reason });
export const playLink = (id) => api(`/api/movies/${id}/play`);
