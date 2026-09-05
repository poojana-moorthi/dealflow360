import React, { createContext, useContext, useState, useEffect } from 'react';
import salesMockService from '../services/salesMockService';
import financeService from '../services/financeService';
import { useAuth } from './AuthContext';

const SalesContext = createContext(null);

export function SalesProvider({ children }) {
  const auth = useAuth();
  const userRole = auth?.user?.role || localStorage.getItem('dealflow360_primary_role') || 'SALES_REP';

  const [persona, setPersona] = useState(() => {
    salesMockService.setPersona(userRole);
    return salesMockService.getPersona();
  });
  const [quotations, setQuotations] = useState([...salesMockService.quotations]);
  const [approvals, setApprovals] = useState([...salesMockService.approvals]);
  const [auditEvents, setAuditEvents] = useState([...salesMockService.auditEvents]);
  const [dashboardSummary, setDashboardSummary] = useState(salesMockService.getDashboardSummary());
  const [customers] = useState(salesMockService.customers);
  const [products, setProducts] = useState([...salesMockService.products]);
  const [discountRules, setDiscountRules] = useState({ ...salesMockService.discountRules });
  const [adminOverview, setAdminOverview] = useState(salesMockService.getAdminOverview());
  const [financeOverview, setFinanceOverview] = useState(financeService.getOverview());
  const [invoices, setInvoices] = useState([...financeService.invoices]);
  const [subscriptions, setSubscriptions] = useState([...financeService.subscriptions]);

  // Synchronize persona whenever the authenticated user or their role switches
  useEffect(() => {
    if (auth?.user?.role) {
      salesMockService.setPersona(auth.user.role);
      setPersona(salesMockService.getPersona());
    }
  }, [auth?.user?.role]);

  const refreshState = () => {
    setQuotations([...salesMockService.quotations]);
    setApprovals([...salesMockService.approvals]);
    setAuditEvents([...salesMockService.auditEvents]);
    setDashboardSummary(salesMockService.getDashboardSummary());
    setPersona(salesMockService.getPersona());
    setProducts([...salesMockService.products]);
    setDiscountRules({ ...salesMockService.discountRules });
    setAdminOverview(salesMockService.getAdminOverview());
    setFinanceOverview(financeService.getOverview());
    setInvoices([...financeService.invoices]);
    setSubscriptions([...financeService.subscriptions]);
  };

  const handleSetPersona = (role) => {
    salesMockService.setPersona(role);
    refreshState();
  };

  const handleCreateQuotation = (data) => {
    const created = salesMockService.createQuotation(data);
    refreshState();
    return created;
  };

  const handleUpdateQuotation = (id, updates) => {
    const updated = salesMockService.updateQuotation(id, updates);
    refreshState();
    return updated;
  };

  const handleResolveApproval = (approvalId, decision, reason) => {
    const resolved = salesMockService.resolveApproval(approvalId, decision, reason);
    refreshState();
    return resolved;
  };

  const handleUpdateTierCeiling = (tier, ceiling, reason) => {
    const res = salesMockService.updateTierCeiling(tier, ceiling, reason);
    refreshState();
    return res;
  };

  const handleUpdateCategoryCeiling = (category, ceiling, reason) => {
    const res = salesMockService.updateCategoryCeiling(category, ceiling, reason);
    refreshState();
    return res;
  };

  const handleUpdateMarginFloor = (target, minimum, reason) => {
    const res = salesMockService.updateMarginFloor(target, minimum, reason);
    refreshState();
    return res;
  };

  const handleSaveProduct = (productData) => {
    const saved = salesMockService.saveProduct(productData);
    refreshState();
    return saved;
  };

  const handleDeactivateProduct = (productId, reason) => {
    const deactivated = salesMockService.deactivateProduct(productId, reason);
    refreshState();
    return deactivated;
  };

  const handleAdminOverrideQuotation = (quotationId, appliedDiscount, reason) => {
    const overridden = salesMockService.adminOverrideQuotation(quotationId, appliedDiscount, reason);
    refreshState();
    return overridden;
  };

  const evaluateGovernanceSimulation = (params) => {
    return salesMockService.evaluateGovernanceSimulation(params);
  };

  const calculatePricing = (items, customerTier) => {
    return salesMockService.calculatePricing(items, customerTier);
  };

  const getQuotationById = (id) => {
    return salesMockService.quotations.find(q => q.id === parseInt(id, 10)) || null;
  };

  const handleRecordPayment = (paymentData) => {
    const inv = financeService.recordPayment(paymentData);
    refreshState();
    return inv;
  };

  const handleUpdateSubscriptionStatus = (id, status, reason) => {
    const sub = financeService.updateSubscriptionStatus(id, status, reason);
    refreshState();
    return sub;
  };

  const calculateProration = (params) => {
    return financeService.calculateProration(params);
  };

  return (
    <SalesContext.Provider
      value={{
        persona,
        setPersona: handleSetPersona,
        quotations,
        approvals,
        auditEvents,
        dashboardSummary,
        customers,
        products,
        discountRules,
        adminOverview,
        financeOverview,
        invoices,
        subscriptions,
        createQuotation: handleCreateQuotation,
        updateQuotation: handleUpdateQuotation,
        resolveApproval: handleResolveApproval,
        updateTierCeiling: handleUpdateTierCeiling,
        updateCategoryCeiling: handleUpdateCategoryCeiling,
        updateMarginFloor: handleUpdateMarginFloor,
        saveProduct: handleSaveProduct,
        deactivateProduct: handleDeactivateProduct,
        adminOverrideQuotation: handleAdminOverrideQuotation,
        evaluateGovernanceSimulation,
        calculatePricing,
        getQuotationById,
        recordPayment: handleRecordPayment,
        updateSubscriptionStatus: handleUpdateSubscriptionStatus,
        calculateProration,
        refreshState
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
}

export default SalesContext;
