import api from './api';

export const approvalService = {
  getAll: (params) => api.get('/approvals', { params }),
  getById: (id) => api.get(`/approvals/${id}`),
  approve: (id, notes) => api.post(`/approvals/${id}/approve`, { notes }),
  reject: (id, notes) => api.post(`/approvals/${id}/reject`, { notes }),
  revision: (id, notes) => api.post(`/approvals/${id}/revision`, { notes }),
  getAudits: (quotationId) => api.get(`/approvals/quotation/${quotationId}/audits`)
};

export default approvalService;
