import api from './api';

export const fulfillmentService = {
  getOverview: () => api.get('/fulfillment'),
  getPlan: (quotationId) => api.get(`/fulfillment/${quotationId || '1'}`),
  allocate: (quotationId) => api.post(`/fulfillment/${quotationId || '1'}/allocate`),
  override: (quotationId, overrides, reason) => api.post(`/fulfillment/${quotationId || '1'}/override`, { overrides, reason })
};

export default fulfillmentService;
