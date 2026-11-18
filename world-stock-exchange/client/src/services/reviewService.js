import { api, post } from './http';

export const fetchReviewApplications = () => api('/api/review/applications');
export const decideApplication = (id, status, note) =>
  post(`/api/review/applications/${encodeURIComponent(id)}/decision`, { status, note });
