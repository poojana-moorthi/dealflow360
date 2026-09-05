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

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is CUSTOMER trying to access internal routes, redirect to portal
  if (user.role === 'CUSTOMER' && !location.pathname.startsWith('/portal')) {
    return <Navigate to="/portal/dashboard" replace />;
  }

  // If internal user trying to access restricted admin/finance routes
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const requiredRole = allowedRoles.includes('ADMIN') ? 'Administrator' : allowedRoles.join(' or ');
    return <AccessRestricted requiredRole={requiredRole} />;
  }

  return children;
}

export default ProtectedRoute;
