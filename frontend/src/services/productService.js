import api from './api';

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getDiscountRules: () => api.get('/products/discount-rules'),
  updateDiscountRule: (id, data) => api.put(`/products/discount-rules/${id}`, data),
  getTierPricing: (tier) => api.get(`/products/tier-pricing/${tier}`)
};

export default productService;
