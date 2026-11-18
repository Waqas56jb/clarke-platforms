import { api, backendUrl, post } from './http';

export const submitApplication = (payload) => post('/api/applications', payload);
export const fetchMyApplications = () => api('/api/applications/mine');
export const fetchIssuerOrders = () => api('/api/issuer/orders');
export const removeDocument = (applicationId, docId) =>
  api(`/api/applications/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(docId)}`, {
    method: 'DELETE',
  });

// Downloads a document through a short-lived signed link. The API sends it as an attachment and checks
// permission again, so the page stays where it is.
export async function openDocument(applicationId, docId) {
  const { url } = await api(
    `/api/applications/${encodeURIComponent(applicationId)}/documents/${encodeURIComponent(docId)}/link`
  );
  window.location.assign(backendUrl(url));
}
