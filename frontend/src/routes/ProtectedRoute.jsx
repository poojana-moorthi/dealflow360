import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Card';
import AccessRestricted from '../pages/admin/AccessRestricted';

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader text="Verifying credentials..." />;
  }

  // Resolve user from AuthContext OR localStorage to avoid race conditions upon login
  const resolvedUser = user || (() => {
    try {
      const portalUser = localStorage.getItem('dealflow360_portal_user');
      if (portalUser) return JSON.parse(portalUser);
      const savedUser = localStorage.getItem('dealflow360_user');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {}
    return null;
  })();

  const resolvedToken = token || localStorage.getItem('dealflow360_token');

  // Customer Portal route handling
  if (location.pathname.startsWith('/portal')) {
    const portalUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('dealflow360_portal_user') || 'null');
      } catch (e) {
        return null;
      }
    })();

    const isCustomer = resolvedUser?.role === 'CUSTOMER' || portalUser?.role === 'CUSTOMER';
    if (!resolvedToken || !isCustomer) {
      return <Navigate to="/portal/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (!resolvedToken || !resolvedUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is CUSTOMER trying to access internal routes, redirect to portal
  if (resolvedUser.role === 'CUSTOMER' && !location.pathname.startsWith('/portal')) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  // If internal user trying to access restricted admin/finance routes
  if (allowedRoles.length > 0 && !allowedRoles.includes(resolvedUser.role)) {
    const requiredRole = allowedRoles.includes('ADMIN') ? 'Administrator' : allowedRoles.join(' or ');
    return <AccessRestricted requiredRole={requiredRole} />;
  }

  return children;
}

export default ProtectedRoute;
