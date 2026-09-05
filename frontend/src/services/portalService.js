import api from './api';

export const portalService = {
  login: (email, password) => api.post('/portal/login', { email, password }),
  getQuotations: () => api.get('/portal/quotations'),
  getQuotationDetail: (id) => api.get('/portal/quotations/' + id),
  submitNegotiation: (id, data) => api.post('/portal/quotations/' + id + '/negotiate', data),
  confirmQuotation: (id) => api.post('/portal/quotations/' + id + '/confirm')
};

export default portalService;
