import { api, post } from './http';

export const listConversations = () => api('/api/messages');
export const listContacts = () => api('/api/messages/contacts');
export const getThread = (userId) => api(`/api/messages/${userId}`);
export const sendMessage = (userId, body) => post(`/api/messages/${userId}`, { body });
export const markRead = (userId) => post(`/api/messages/${userId}/read`);
