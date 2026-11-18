import { api, postJson } from './http';

export const startCheckout = (plan) => postJson('/api/payments/checkout', { plan });
export const paymentHistory = () => api('/api/payments/history');
