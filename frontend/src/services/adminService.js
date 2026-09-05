import salesMockService from './salesMockService';

export const adminService = {
  getOverview() {
    return salesMockService.getAdminOverview();
  },

  getProducts(filters = {}) {
    let prods = [...salesMockService.products];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      prods = prods.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    if (filters.category && filters.category !== 'ALL') {
      prods = prods.filter(p => p.category === filters.category);
    }
    if (filters.status && filters.status !== 'ALL') {
      prods = prods.filter(p => p.status === filters.status);
    }
    if (filters.type && filters.type !== 'ALL') {
      prods = prods.filter(p => p.billing_type === filters.type);
    }
    return prods;
  },

  getProductById(id) {
    return salesMockService.products.find(p => p.id === parseInt(id, 10)) || null;
  },

  saveProduct(data) {
    return salesMockService.saveProduct(data);
  },

  deactivateProduct(id, reason) {
    return salesMockService.deactivateProduct(id, reason);
  },

  getDiscountRules() {
    return salesMockService.discountRules;
  },

  updateTierCeiling(tier, ceiling, reason) {
    return salesMockService.updateTierCeiling(tier, ceiling, reason);
  },

  updateCategoryCeiling(category, ceiling, reason) {
    return salesMockService.updateCategoryCeiling(category, ceiling, reason);
  },

  updateMarginFloor(target, minimum, reason) {
    return salesMockService.updateMarginFloor(target, minimum, reason);
  },

  evaluateSimulation(params) {
    return salesMockService.evaluateGovernanceSimulation(params);
  },

  adminOverride(quotationId, appliedDiscount, reason) {
    return salesMockService.adminOverrideQuotation(quotationId, appliedDiscount, reason);
  },

  getAuditEvents(filters = {}) {
    let logs = [...salesMockService.auditEvents];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(l =>
        (l.action && l.action.toLowerCase().includes(q)) ||
        (l.user && l.user.toLowerCase().includes(q)) ||
        (l.detail && l.detail.toLowerCase().includes(q))
      );
    }
    if (filters.user && filters.user !== 'ALL') {
      logs = logs.filter(l => l.user === filters.user);
    }
    return logs;
  }
};

export default adminService;
