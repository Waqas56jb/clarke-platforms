import { api, post } from './http';

export const fetchMe = () => api('/api/me');
export const fetchAuthStatus = () => api('/api/auth/csrf');
export const signIn = (payload) => post('/api/auth/login', payload);
export const register = (payload) => post('/api/auth/register', payload);
export const signOut = () => post('/api/auth/logout');
export const verifyEmail = (token) => post('/api/auth/verify-email', { token });
export const resendVerification = (email) => post('/api/auth/resend-verification', { email });
export const forgotPassword = (email) => post('/api/auth/forgot-password', { email });
export const resetPassword = (token, password) => post('/api/auth/reset-password', { token, password });
export const updateMe = (payload) => api('/api/me', { method: 'PATCH', body: payload });
export const deleteAccount = (password) => api('/api/me', { method: 'DELETE', body: { password } });
