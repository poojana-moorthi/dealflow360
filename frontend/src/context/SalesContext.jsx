import React, { createContext, useContext, useState, useEffect } from 'react';
import salesMockService from '../services/salesMockService';

const SalesContext = createContext(null);

export function SalesProvider({ children }) {
  const [persona, setPersona] = useState(salesMockService.getPersona());
  const [quotations, setQuotations] = useState([...salesMockService.quotations]);
  const [approvals, setApprovals] = useState([...salesMockService.approvals]);
  const [auditEvents, setAuditEvents] = useState([...salesMockService.auditEvents]);
  const [dashboardSummary, setDashboardSummary] = useState(salesMockService.getDashboardSummary());
  const [customers] = useState(salesMockService.customers);
  const [products] = useState(salesMockService.products);
  const [discountRules] = useState(salesMockService.discountRules);

  const refreshState = () => {
    setQuotations([...salesMockService.quotations]);
    setApprovals([...salesMockService.approvals]);
    setAuditEvents([...salesMockService.auditEvents]);
    setDashboardSummary(salesMockService.getDashboardSummary());
    setPersona(salesMockService.getPersona());
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

  const calculatePricing = (items, customerTier) => {
    return salesMockService.calculatePricing(items, customerTier);
  };

  const getQuotationById = (id) => {
    return salesMockService.quotations.find(q => q.id === parseInt(id, 10)) || null;
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
        createQuotation: handleCreateQuotation,
        updateQuotation: handleUpdateQuotation,
        resolveApproval: handleResolveApproval,
        calculatePricing,
        getQuotationById,
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
