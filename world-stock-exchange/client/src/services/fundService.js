import { api } from './http';

export const getFund = () => api('/api/fund');
export const recordFee = (saleValue) => api('/api/fund/fees', { method: 'POST', body: { saleValue } });
