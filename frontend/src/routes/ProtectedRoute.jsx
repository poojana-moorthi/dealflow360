import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Card';

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
    return (
      <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          Your role ({user.role}) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
