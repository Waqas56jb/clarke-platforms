import { api, post } from './http';

export const paymentConfig = () => api('/api/payments/config');
export const startCheckout = (payload) => post('/api/payments/checkout', payload);
export const paymentHistory = () => api('/api/payments/history');
