import api from './api';

export const subscriptionService = {
  getAll: () => api.get('/subscriptions'),
  getById: (id) => api.get(`/subscriptions/${id}`),
  updateStatus: (id, status) => api.put(`/subscriptions/${id}`, { status })
};

export const billingService = {
  getByQuotation: (quotationId) => api.get(`/billing/${quotationId}`),
  generate: (quotationId) => api.post(`/billing/${quotationId}/generate`),
  calculateProration: (params) => api.post('/billing/proration/calculate', params)
};

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  recordPayment: (invoiceId, paymentData) => api.post(`/invoices/${invoiceId}/payments`, paymentData)
};

export const portalService = {
  login: (email, password) => api.post('/portal/login', { email, password }),
  getQuotations: () => api.get('/portal/quotations'),
  getQuotationDetail: (id) => api.get(`/portal/quotations/${id}`),
  submitNegotiation: (id, data) => api.post(`/portal/quotations/${id}/negotiate`, data),
  confirmQuotation: (id) => api.post(`/portal/quotations/${id}/confirm`)
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getHealth: () => api.get('/dashboard/health'),
  getAnomalies: () => api.get('/dashboard/anomalies'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getMarginReport: () => api.get('/reports/margins'),
  getApprovalReport: () => api.get('/reports/approvals'),
  getFulfillmentReport: () => api.get('/reports/fulfillment'),
  getSubscriptionReport: () => api.get('/reports/subscriptions')
};

export default dashboardService;
