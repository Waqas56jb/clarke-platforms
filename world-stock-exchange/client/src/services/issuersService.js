import { api } from './http';

export const listApplications = () => api('/api/issuers');
export const submitApplication = (payload) => api('/api/issuers', { method: 'POST', body: payload });
export const setApplicationStatus = (id, status) =>
  api(`/api/issuers/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
