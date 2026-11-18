import { api, post } from './http';

export const listNotifications = () => api('/api/notifications');
export const markNotificationsRead = () => post('/api/notifications/read');
