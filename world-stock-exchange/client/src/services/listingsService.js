import { api, post } from './http';

export const fetchListings = () => api('/api/listings');
export const fetchListing = (id) => api(`/api/listings/${encodeURIComponent(id)}`);
export const buyShares = (id, quantity) => post(`/api/listings/${encodeURIComponent(id)}/orders`, { quantity });
