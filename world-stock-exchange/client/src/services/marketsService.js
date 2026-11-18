import { api, post } from './http';

export const fetchMarkets = () => api('/api/markets');
export const fetchWatchlist = () => api('/api/watchlist');
export const toggleWatch = (instrumentId) => post(`/api/watchlist/${encodeURIComponent(instrumentId)}`);
