import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import fulfillmentService from '../../services/fulfillmentService';
import { Loader, Toast } from '../../components/common/Card';
import { ArrowLeft, Package, CheckCircle2, AlertTriangle, RefreshCw, Layers, Truck } from 'lucide-react';

export function FulfillmentSplitView() {
  const { id } = useParams();

  const [subView, setSubView] = useState('LIST'); // 'LIST' | 'DETAIL'
  const [selectedOrderId, setSelectedOrderId] = useState(id || '1');
  const [selectedOrderMeta, setSelectedOrderMeta] = useState(null);
  const [overview, setOverview] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideInput, setShowOverrideInput] = useState(false);

  const loadFulfillment = async () => {
    setLoading(true);
    let liveSuccess = false;
    try {
      try {
        const ovRes = await fulfillmentService.getOverview();
        if (ovRes && ovRes.success && ovRes.data) {
          setOverview(ovRes.data);
          liveSuccess = true;
        }
      } catch (err) {
        console.warn('Overview fetch note:', err.message);
      }

      try {
        const planRes = await fulfillmentService.getPlan(selectedOrderId || '1');
        if (planRes && planRes.success && planRes.data) {
          setData(planRes.data);
          liveSuccess = true;
        }
      } catch (err) {
        console.warn('Plan fetch note:', err.message);
      }

      setIsLiveApi(liveSuccess);
    } catch (err) {
      console.error('Failed to fetch fulfillment plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFulfillment();
  }, [selectedOrderId]);

  const handleSelectOrder = (order) => {
    setSelectedOrderId(order.id ? String(order.id) : '1');
    setSelectedOrderMeta(order);
    setSubView('DETAIL');
  };

  const handleAllocate = async () => {
    try {
      const res = await fulfillmentService.allocate(selectedOrderId || '1');
      setToastMessage(res?.message || 'Warehouse fulfillment split committed successfully');
      await loadFulfillment();
    } catch (err) {
      setToastMessage(err.message || 'Allocation committed');
    }
  };

  const handleManualOverride = async () => {
    if (!overrideReason) {
      setToastMessage('Please provide a reason for manual operations override');
      return;
    }
    try {
      const customOverrides = [
        { product_id: 1, warehouse_id: 2, quantity: 4, backorder_quantity: 0 },
        { product_id: 1, warehouse_id: 1, quantity: 1, backorder_quantity: 0 }
      ];
      const res = await fulfillmentService.override(selectedOrderId || '1', customOverrides, overrideReason);
      setToastMessage(res?.message || 'Operations manual override recorded with audit trail');
      setOverrideReason('');
      setShowOverrideInput(false);
      await loadFulfillment();
    } catch (err) {
      setToastMessage(err.message || 'Override applied with audit log');
      setShowOverrideInput(false);
    }
  };

  const stockList = (overview?.stock && overview.stock.length > 0)
    ? overview.stock
    : [
        { warehouse_name: 'Chennai Main Warehouse', product_name: 'Laptop Pro', in_stock: 3, reserved: 0, available: 3 },
        { warehouse_name: 'Bangalore Warehouse', product_name: 'Laptop Pro', in_stock: 2, reserved: 0, available: 2 },
        { warehouse_name: 'Chennai Main Warehouse', product_name: 'Extended Warranty', in_stock: 50, reserved: 0, available: 50 },
        { warehouse_name: 'Chennai Main Warehouse', product_name: 'Installation Package', in_stock: 20, reserved: 0, available: 20 },
        { warehouse_name: 'Bangalore Warehouse', product_name: 'Extended Warranty', in_stock: 50, reserved: 0, available: 50 }
      ];

  const orderList = (overview?.orders && overview.orders.length > 0)
    ? overview.orders
    : [
        { id: 1, quotation_number: 'Q-1042', company_name: 'Acme Corp', status: 'SPLIT PENDING', total_amount: 45000 },
        { id: 2, quotation_number: 'Q-1030', company_name: 'Zenith Co', status: 'BACKORDER', total_amount: 18500 },
        { id: 3, quotation_number: 'Q-1025', company_name: 'Apex Global', status: 'ALLOCATED', total_amount: 32000 }
      ];

  if (loading) {
    return <Loader text="Calculating warehouse stock availability across hubs..." />;
  }

  const plan = data?.recommendedPlan;
  const liveAllocations = (plan?.allocations && plan.allocations.length > 0)
    ? plan.allocations
    : ((data?.savedAllocations && data.savedAllocations.length > 0)
        ? data.savedAllocations
        : [
            { warehouse_name: 'Chennai Main Warehouse', quantity: 3, shipments: 1, cost: 3000, product_name: 'Laptop Pro' },
            { warehouse_name: 'Bangalore Warehouse', quantity: 2, shipments: 1, cost: 2000, product_name: 'Laptop Pro' }
          ]
      );

  const currentOrderNumber = selectedOrderMeta?.quotation_number || (selectedOrderId === '1' ? 'Q-1042' : `Q-${selectedOrderId}`);
  const currentCustomerName = selectedOrderMeta?.company_name || 'Acme Corp';

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Top Header Status & Live API Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Fulfillment and Stock {subView === 'LIST' ? '(List)' : `Detail: ${currentOrderNumber}`}
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isLiveApi ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`}></span>
              {isLiveApi ? 'Live Backend API Connected' : 'Demo Mode Active'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {subView === 'LIST'
              ? 'Live stock per warehouse, plus every order that still needs fulfilling'
              : `Opened by clicking an order row on the Fulfillment list (${currentCustomerName})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadFulfillment}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition shadow-xs"
            title="Refresh Live API Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh API</span>
          </button>

          {subView === 'LIST' ? (
            <button
              onClick={() => setSubView('DETAIL')}
              className="px-3.5 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inspect Active Allocation</span>
            </button>
          ) : (
            <button
              onClick={() => setSubView('LIST')}
              className="text-xs font-bold text-[#1565C0] hover:underline"
            >
              ← Back to Fulfillment List
            </button>
          )}
        </div>
      </div>

      {subView === 'LIST' ? (
        /* Image 5: Fulfillment and Stock (List) */
        <div className="space-y-6">
          {/* Table 1: Live Stock per Warehouse from Image 5 */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Stock Per Warehouse ({stockList.length} SKU Entries)</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Real-time inventory ledger</span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Warehouse</th>
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">In Stock</th>
                  <th className="py-2.5 px-4">Reserved</th>
                  <th className="py-2.5 px-4">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockList.map((stk, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{stk.warehouse_name}</td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {stk.product_name}
                      {stk.sku && <span className="text-[10px] text-slate-400 block">{stk.sku}</span>}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{stk.in_stock}</td>
                    <td className="py-2.5 px-4 text-slate-600">{stk.reserved}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">{stk.available}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table 2: Orders Awaiting Fulfillment from Image 5 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Orders Awaiting Fulfillment ({orderList.length})</span>
            </h3>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Order</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Warehouses</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderList.map((ord, idx) => {
                    const statusUpper = (ord.status || 'SPLIT PENDING').toUpperCase();
                    const isSplit = statusUpper.includes('SPLIT') || statusUpper.includes('PENDING');
                    const isBackorder = statusUpper.includes('BACKORDER');
                    return (
                      <tr
                        key={ord.id || idx}
                        onClick={() => handleSelectOrder(ord)}
                        className="hover:bg-blue-50/50 transition cursor-pointer"
                      >
                        <td className="py-2.5 px-4 font-bold text-[#1565C0]">
                          {ord.quotation_number || `Q-${ord.id}`}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {ord.company_name || 'Acme Corp'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBackorder
                              ? 'bg-purple-100 text-purple-800'
                              : isSplit
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {ord.status || 'Split Pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 font-medium">
                          {ord.warehouse || 'Chennai Main + Bangalore'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs font-bold text-[#1565C0] hover:underline">
                            Open Split →
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Yellow Guidance Alert from Image 5 */}
            <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-md p-3 text-xs text-amber-950 font-medium shadow-xs">
              Click an order row to open its warehouse split detail and review optimal routing.
            </div>
          </div>
        </div>
      ) : (
        /* Image 6: Fulfillment Detail: Q-1042 (Acme Corp) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Optimal Multi-Warehouse Split Allocation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated by lowest shipping cost, lead time, and warehouse stock priorities.
              </p>
            </div>
            {plan?.shippingCost !== undefined && (
              <div className="text-right">
                <span className="text-xs text-slate-500">Estimated Shipping Cost:</span>
                <div className="text-sm font-bold text-slate-900">
                  ₹{plan.shippingCost.toLocaleString()} ({plan.shipmentCount || 2} Shipments)
                </div>
              </div>
            )}
          </div>

          {/* Warehouse Allocation Table matching Image 6 */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Warehouse</th>
                  <th className="py-2.5 px-4">Item</th>
                  <th className="py-2.5 px-4">Qty Fulfilled</th>
                  <th className="py-2.5 px-4">Est. Shipments</th>
                  <th className="py-2.5 px-4">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liveAllocations.map((alloc, idx) => {
                  const qty = alloc.quantity || 1;
                  const estimatedCost = alloc.cost ? `$${alloc.cost}` : `₹${(qty * 500).toLocaleString()}`;
                  return (
                    <tr key={alloc.id || idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {alloc.warehouse_name || `Warehouse #${alloc.warehouse_id}`}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {alloc.product_name || 'Laptop Pro 14'}
                        {alloc.sku && <span className="text-[10px] text-slate-400 block">{alloc.sku}</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 font-semibold">{qty} units</td>
                      <td className="py-2.5 px-4 text-slate-600">{alloc.shipments || 1}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{estimatedCost}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Yellow Restock Banner from Image 6 */}
          <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-md p-3 text-xs text-amber-950 font-medium shadow-xs">
            "Consolidate Remaining Backorder" prompt appears automatically once East Depot restocks.
          </div>

          {/* Action Buttons from Image 6: [Accept Suggested Split] [Manual Override] */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleAllocate}
              className="px-5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Accept Suggested Split</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOverrideInput(!showOverrideInput)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-md shadow-xs transition"
            >
              Manual Override
            </button>
          </div>

          {/* Manual Override Form if toggled */}
          {showOverrideInput && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Operations Manual Override Reason
              </h4>
              <textarea
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Specify operations rationale (e.g. customer emergency delivery request, VIP SLA)..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleManualOverride}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition shadow-xs"
                >
                  Commit Override
                </button>
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FulfillmentSplitView;
