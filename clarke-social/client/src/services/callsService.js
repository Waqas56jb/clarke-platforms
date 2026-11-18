import { api } from './http';

export const iceConfig = () => api('/api/calls/ice-config');
export const callHistory = () => api('/api/calls/history');
