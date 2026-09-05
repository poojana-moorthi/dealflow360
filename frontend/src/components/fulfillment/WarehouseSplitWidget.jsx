import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Package, Truck, AlertCircle, CheckCircle } from 'lucide-react';

export function WarehouseSplitWidget({ fulfillmentData, onAllocate, onOverride, canEdit = true }) {
  if (!fulfillmentData) return null;

  const plan = fulfillmentData.recommendedPlan || {};
  const allocations = plan.allocations || [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Multi-Warehouse Inventory Allocation</span>
          </h3>
          <p className="text-xs text-slate-500">Autonomous stock split prioritizing availability and min-shipments</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            {plan.shipmentCount || 0} Shipments ({formatCurrency(plan.shippingCost || 0)})
          </span>
          {plan.hasShortage && (
            <span className="px-2 py-1 rounded bg-rose-50 text-rose-800 font-semibold border border-rose-200">
              {plan.totalBackorders} Units Backorder
            </span>
          )}
        </div>
      </div>

      {/* Allocation Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Required</th>
              <th className="py-2.5 px-3">Warehouse Hub</th>
              <th className="py-2.5 px-3">Allocated Qty</th>
              <th className="py-2.5 px-3">Available</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((a, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-semibold text-slate-800">
                  {a.product_name}
                  <span className="block text-[10px] text-slate-400 font-mono">{a.sku}</span>
                </td>
                <td className="py-2.5 px-3 font-medium">{a.required_quantity}</td>
                <td className="py-2.5 px-3 font-medium text-slate-700">
                  {a.warehouse_name} ({a.warehouse_code})
                </td>
                <td className="py-2.5 px-3 font-bold text-blue-700 text-sm">{a.quantity}</td>
                <td className="py-2.5 px-3 text-slate-600">{a.available_stock}</td>
                <td className="py-2.5 px-3">
                  {a.backorder_quantity > 0 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Backorder: {a.backorder_quantity}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                      Satisfied
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canEdit && (
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onAllocate}
            className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-md hover:bg-[#0D47A1] transition shadow-xs"
          >
            Confirm & Reserve Allocation
          </button>
        </div>
      )}
    </div>
  );
}

export default WarehouseSplitWidget;
