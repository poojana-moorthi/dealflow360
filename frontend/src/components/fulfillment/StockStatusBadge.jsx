import React from 'react';

export function StockStatusBadge({ status }) {
  if (status === 'FULFILLABLE') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        In Stock (Ready to Dispatch)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      Partial Stock (Split / Backorder)
    </span>
  );
}

export default StockStatusBadge;
