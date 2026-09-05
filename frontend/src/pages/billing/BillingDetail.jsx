import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import { BillingScheduleTable, ProrationPreview } from '../../components/billing/BillingScheduleTable';
import { Loader, Toast } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Repeat, Receipt, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

export function BillingDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [proration, setProration] = useState(null);

  // Proration inputs
  const [remainingDays, setRemainingDays] = useState(14);
  const [newQty, setNewQty] = useState(2);
  const [showProrationEngine, setShowProrationEngine] = useState(false);

  const loadBilling = async () => {
    try {
      const res = await billingService.getByQuotation(id || '1');
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, [id]);

  const handleGenerateBilling = async () => {
    try {
      const res = await billingService.generate(id || '1');
      setToastMessage(res.message || 'Billing schedules and invoice created');
      await loadBilling();
    } catch (err) {
      setToastMessage(err.message || 'Error generating billing');
    }
  };

  const handleCalculateProration = async () => {
    try {
      const res = await billingService.calculateProration({
        totalDaysInCycle: 30,
        remainingDays,
        oldQty: 1,
        newQty,
        oldPrice: 18000,
        newPrice: 18000
      });
      if (res.success) setProration(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader text="Loading hybrid billing schedules..." />;

  const { quotation, invoices = [], schedules = [] } = data || {};
  const customerName = quotation?.customer_name || 'Acme Corp';
  const planTitle = 'Care Plan 2yr';

  // Wireframe Image 8 standard one-time lines & recurring lines
  const oneTimeLines = quotation?.items?.filter(it => it.billing_type === 'ONE_TIME') || [
    { product_name: 'Laptop Pro 14', quantity: 2, line_total: 2280 },
    { product_name: 'Onsite Setup', quantity: 1, line_total: 450 }
  ];

  const recurringLines = schedules.length > 0 ? schedules.map(s => ({
    plan: planTitle,
    cycle: s.frequency || 'Monthly',
    next_bill: s.billing_date ? formatDate(s.billing_date) : 'Sep 15',
    amount: s.amount || 46
  })) : [
    { plan: 'Care Plan 2yr', cycle: 'Monthly', next_bill: 'Sep 15', amount: 46 },
    { plan: 'Support SLA', cycle: 'Quarterly', next_bill: 'Nov 1', amount: 300 }
  ];

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/subscriptions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subscriptions</span>
        </Link>
        <span className="text-xs text-slate-500 font-medium">
          Originating Order: <strong className="text-slate-800 font-bold">{quotation?.quotation_number || 'Q-1042'}</strong>
        </span>
      </div>

      {/* Wireframe Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Billing Detail: {customerName} - {planTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 italic">
            Opened by clicking a row on the Subscriptions list
          </p>
        </div>

        {/* Action Buttons matching wireframe */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProrationEngine(!showProrationEngine)}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition shadow-xs"
          >
            Modify Subscription
          </button>
          <button
            type="button"
            onClick={() => setToastMessage('Subscription cancellation workflow initiated.')}
            className="px-3 py-1.5 bg-white border border-red-400 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-md transition shadow-xs"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Section 1: One-Time Lines (from originating order) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            One-Time Lines (from originating order)
          </h2>
          <span className="text-[11px] text-slate-500">{oneTimeLines.length} Items</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4 text-center">Qty</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {oneTimeLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-semibold text-slate-800">{line.product_name}</td>
                <td className="py-2.5 px-4 text-center text-slate-600">{line.quantity}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                  {formatCurrency(line.line_total || line.amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Recurring Lines */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Recurring Lines
          </h2>
          <span className="text-[11px] text-slate-500">{recurringLines.length} Recurring Contracts</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Plan</th>
              <th className="py-2.5 px-4">Cycle</th>
              <th className="py-2.5 px-4">Next Bill Date</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recurringLines.map((rec, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-[#1565C0]">{rec.plan}</td>
                <td className="py-2.5 px-4 text-slate-700 font-medium">{rec.cycle}</td>
                <td className="py-2.5 px-4 text-slate-600">{rec.next_bill}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                  {typeof rec.amount === 'number' ? formatCurrency(rec.amount) : rec.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Proration Engine simulator modal or collapse if Modify Subscription is clicked */}
      {showProrationEngine && (
        <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#1565C0]" />
              <h3 className="text-sm font-bold text-slate-900">Mid-Cycle Subscription Proration Simulator</h3>
            </div>
            <button
              onClick={() => setShowProrationEngine(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Days Remaining in Billing Cycle</label>
              <input
                type="number"
                min="1"
                max="30"
                value={remainingDays}
                onChange={(e) => setRemainingDays(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Modified Plan Quantity</label>
              <input
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCalculateProration}
              className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded transition shadow-xs"
            >
              Compute Prorated Adjustment
            </button>
            <button
              type="button"
              onClick={handleGenerateBilling}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded transition shadow-xs"
            >
              Trigger Billing Refresh
            </button>
          </div>

          <ProrationPreview prorationResult={proration} />
        </div>
      )}

      {/* Forward schedule timeline details if present */}
      {schedules.length > 0 && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-600" />
              <span>Recurring Forward Billing Schedules</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">Automatic Cycle Dispatch</span>
          </div>
          <BillingScheduleTable schedules={schedules} />
        </div>
      )}
    </div>
  );
}

export default BillingDetail;
