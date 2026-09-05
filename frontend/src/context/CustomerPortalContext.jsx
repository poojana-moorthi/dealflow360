import React, { createContext, useContext, useState } from 'react';
import portalService from '../services/portalService';

const CustomerPortalContext = createContext(null);

export function CustomerPortalProvider({ children }) {
  const [portalUser, setPortalUser] = useState(null);
  const [portalQuotes, setPortalQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const portalLogin = async (email, password) => {
    const res = await portalService.login(email, password);
    if (res.success && res.data) {
      localStorage.setItem('dealflow360_token', res.data.token);
      setPortalUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Customer login failed');
  };

  const loadPortalQuotes = async () => {
    setLoading(true);
    try {
      const res = await portalService.getQuotations();
      if (res.success) setPortalQuotes(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerPortalContext.Provider value={{
      portalUser, setPortalUser, portalQuotes, loadPortalQuotes,
      selectedQuote, setSelectedQuote, loading, portalLogin
    }}>
      {children}
    </CustomerPortalContext.Provider>
  );
}

export function useCustomerPortal() {
  return useContext(CustomerPortalContext);
}
