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

  const [primaryRole, setPrimaryRole] = useState(() => {
    const savedPrimary = localStorage.getItem('dealflow360_primary_role');
    if (savedPrimary) return savedPrimary;
    const saved = localStorage.getItem('dealflow360_user');
    if (saved) {
      try { return JSON.parse(saved).role; } catch (e) {}
    }
    return 'SALES_REP';
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
            if (!localStorage.getItem('dealflow360_primary_role')) {
              setPrimaryRole(res.data.user.role);
              localStorage.setItem('dealflow360_primary_role', res.data.user.role);
            }
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
        localStorage.setItem('dealflow360_primary_role', res.data.user.role);
        setToken(res.data.token);
        setUser(res.data.user);
        setPrimaryRole(res.data.user.role);
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
        setPrimaryRole(fallback.role);
        localStorage.setItem('dealflow360_user', JSON.stringify(fallback));
        localStorage.setItem('dealflow360_primary_role', fallback.role);
        return fallback;
      }
      throw err;
    }
  };

  const switchRole = (newRole) => {
    // Only administrators are permitted to switch between roles
    if (primaryRole !== 'ADMIN' && user?.role !== 'ADMIN') {
      console.warn('[AUTH] Access Denied: Only Admin can switch roles.');
      return false;
    }

    const demoMap = {
      ADMIN: { id: 1, name: 'System Admin', email: 'admin@dealflow360.com', role: 'ADMIN' },
      SALES_REP: { id: 2, name: 'Sales Rep', email: 'sales_rep@dealflow360.com', role: 'SALES_REP' },
      SALES_MANAGER: { id: 3, name: 'Sales Manager', email: 'sales_manager@dealflow360.com', role: 'SALES_MANAGER' },
      FINANCE: { id: 4, name: 'Finance Lead', email: 'finance@dealflow360.com', role: 'FINANCE' }
    };

    const target = demoMap[newRole];
    if (target) {
      setUser(target);
      localStorage.setItem('dealflow360_user', JSON.stringify(target));
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('dealflow360_token');
    localStorage.removeItem('dealflow360_user');
    localStorage.removeItem('dealflow360_primary_role');
    setToken(null);
    setUser(null);
    setPrimaryRole('SALES_REP');
  };

  const isSuperAdmin = primaryRole === 'ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setUser,
        primaryRole,
        isSuperAdmin,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
