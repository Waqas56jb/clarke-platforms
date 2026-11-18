import { api } from './http';

export const listOrders = () => api('/api/orders');
export const placeOrder = (applicationId, quantity) =>
  api('/api/orders', { method: 'POST', body: { applicationId, quantity } });
