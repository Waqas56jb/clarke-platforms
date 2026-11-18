import { api, postJson } from './http';

export const getDatingProfile = () => api('/api/dating/me');
export const saveDatingProfile = (payload) => api('/api/dating/me', { method: 'PUT', body: JSON.stringify(payload) });
export const discoverProfiles = () => api('/api/dating/discover');
export const likeMember = (id) => postJson(`/api/dating/like/${id}`);
export const blockMember = (id) => postJson(`/api/dating/block/${id}`);
export const reportMember = (id, reason) => postJson(`/api/dating/report/${id}`, { reason });
export const listMatches = () => api('/api/dating/matches');
