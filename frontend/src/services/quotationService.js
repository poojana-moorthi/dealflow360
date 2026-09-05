import api from './api';

export const quotationService = {
  getAll: (status) => api.get('/quotations', { params: { status } }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  recalculatePreview: (customerId, items) => api.post(`/quotations/0/recalculate`, { customer_id: customerId, items }),
  confirm: (id) => api.post(`/quotations/${id}/confirm`),
  getUpsell: (id) => api.post(`/quotations/${id}/upsell`)
};

export default quotationService;
