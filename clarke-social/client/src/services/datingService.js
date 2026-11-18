import { api, post } from './http';

export const getDatingProfile = () => api('/api/dating/me');
export const saveDatingProfile = (payload) => api('/api/dating/me', { method: 'PUT', body: payload });
export const discoverProfiles = () => api('/api/dating/discover');
export const likeMember = (id) => post(`/api/dating/like/${id}`);
export const blockMember = (id) => post(`/api/dating/block/${id}`);
export const reportMember = (id, reason) => post(`/api/dating/report/${id}`, { reason });
export const listMatches = () => api('/api/dating/matches');
export const passMember = (id) => post(`/api/dating/pass/${id}`);
