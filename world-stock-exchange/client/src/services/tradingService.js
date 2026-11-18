import { api, post } from './http';

export const fetchPortfolio = () => api('/api/portfolio');
export const placeTrade = (instrumentId, side, units) => post('/api/trades', { instrumentId, side, units });
export const fetchCompanyOrders = () => api('/api/orders');
