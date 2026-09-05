import api from './api';

export const authService = {
  login: (identifier, password) => api.post('/auth/login', { email: identifier, identifier, password }),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (payload) => 
    typeof payload === 'string' 
      ? api.post('/auth/forgot-password', { email: payload, identifier: payload }) 
      : api.post('/auth/forgot-password', payload)
};

export default authService;
