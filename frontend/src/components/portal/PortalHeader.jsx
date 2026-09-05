import React from 'react';

export function PortalHeader({ customerName, companyName }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Welcome, {customerName}</h2>
        <p className="text-xs text-slate-500 mt-0.5">Procurement Workspace for {companyName || 'Acme Corporation'}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Account Status: Active Enterprise Partner
        </span>
      </div>
    </div>
  );
}

export default PortalHeader;
