import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 2,
  name: 'Sales Rep',
  email: 'sales_rep@dealflow360.com',
  role: 'SALES_REP',
  customerId: null
};

const DEFAULT_DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJzYWxlc19yZXBAZGVhbGZsb3czNjAuY29tIiwicm9sZSI6IlNBTEVTX1JFUCIsImlhdCI6MTc4ODYwNDM0NCwiZXhwIjoxNzg4NjkwNzQ0fQ.yBgF-wlzzjSjK5-3BPupJRV7lXboy3mKxqUeSUQt9ow';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const existing = localStorage.getItem('dealflow360_token');
    if (!existing || existing === 'mock-sales-rep-token') {
      localStorage.setItem('dealflow360_token', DEFAULT_DEMO_TOKEN);
      return DEFAULT_DEMO_TOKEN;
    }
    return existing;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('dealflow360_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_DEMO_USER;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (token && token !== 'mock-sales-rep-token') {
        try {
          const res = await authService.getCurrentUser();
          if (res && res.success && res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('dealflow360_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('[AUTH] Live session check note:', err?.message);
        }
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res && res.success && res.data) {
        localStorage.setItem('dealflow360_token', res.data.token);
        localStorage.setItem('dealflow360_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      // Fallback demo users if offline
      const demoUsers = {
        'sales_rep@dealflow360.com': { id: 2, name: 'Sales Rep', email: 'sales_rep@dealflow360.com', role: 'SALES_REP' },
        'sales_manager@dealflow360.com': { id: 3, name: 'Sales Manager', email: 'sales_manager@dealflow360.com', role: 'SALES_MANAGER' },
        'finance@dealflow360.com': { id: 4, name: 'Finance Lead', email: 'finance@dealflow360.com', role: 'FINANCE' },
        'admin@dealflow360.com': { id: 1, name: 'System Admin', email: 'admin@dealflow360.com', role: 'ADMIN' }
      };
      if (demoUsers[email]) {
        const fallback = demoUsers[email];
        setUser(fallback);
        localStorage.setItem('dealflow360_user', JSON.stringify(fallback));
        return fallback;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('dealflow360_token');
    localStorage.removeItem('dealflow360_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
