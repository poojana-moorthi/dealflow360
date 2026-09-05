import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function AccessRestricted({ requiredRole = 'Administrator' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleLabels = {
    SALES_REP: 'Sales Rep',
    SALES_MANAGER: 'Sales Manager',
    FINANCE: 'Finance Lead',
    CUSTOMER: 'Customer / Buyer',
    ADMIN: 'Administrator'
  };

  const currentRoleLabel = roleLabels[user?.role] || user?.role || 'Guest';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This module is restricted and requires {requiredRole} role permissions.
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Your current role:</span>
            <span className="font-bold text-slate-800 bg-slate-200/70 px-2 py-0.5 rounded text-[11px]">
              {currentRoleLabel}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Required role:</span>
            <span className="font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded text-[11px]">
              {requiredRole}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Contact your DealFlow360 administrator to request elevated permissions.
        </p>
      </div>
    </div>
  );
}

export default AccessRestricted;
