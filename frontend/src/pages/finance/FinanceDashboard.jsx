import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Repeat,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CreditCard,
  Building2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function FinanceDashboard() {
  const navigate = useNavigate();
  const {
    financeOverview,
    invoices,
    subscriptions,
    approvals,
    recordPayment,
    resolveApproval
  } = useSales();

  const [toastMessage, setToastMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(invoices[0]?.id || 1);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const overview = financeOverview || {
    netCollected: 284500,
    totalAR: 48200,
    mrr: 38400,
    dso: 28.4,
    pendingApprovalsCount: 2,
    arAging: { current: 32100, medium: 11400, overdue: 4700 },
    subscriptionMetrics: { active: 18, paused: 2, cancelled: 3 }
  };

  // Finance critical approval queue (quotes with margin < 25% or risk >= 70)
  const financeApprovals = (approvals || []).filter(
    a => a.status === 'PENDING' && (a.required_role === 'FINANCE' || a.risk_score >= 70 || a.margin_pct < 25)
  );

  const openInvoices = (invoices || []).filter(
    i => i.status === 'UNPAID' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID'
  );

  const handleOpenPaymentModal = (invoice = null) => {
    if (invoice) {
      setSelectedInvoiceId(invoice.id);
      const remaining = (invoice.total_amount || 0) - (invoice.paid_amount || 0);
      setPaymentAmount(remaining > 0 ? remaining : invoice.total_amount);
    } else if (openInvoices.length > 0) {
      setSelectedInvoiceId(openInvoices[0].id);
      const remaining = (openInvoices[0].total_amount || 0) - (openInvoices[0].paid_amount || 0);
      setPaymentAmount(remaining > 0 ? remaining : openInvoices[0].total_amount);
    }
    setPaymentRef(`REF-${Date.now().toString().slice(-6)}`);
    setShowPaymentModal(true);
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setToastMessage('Valid payment amount is required.');
      return;
    }

    const updated = recordPayment({
      invoiceId: selectedInvoiceId,
      amount: parseFloat(paymentAmount),
      method: paymentMethod,
      ref: paymentRef,
      notes: paymentNotes
    });

    if (updated) {
      setToastMessage(`Payment of ${formatCurrency(parseFloat(paymentAmount))} reconciled on ${updated.invoice_number}.`);
      setShowPaymentModal(false);
      setPaymentNotes('');
    } else {
      setToastMessage('Error recording payment.');
    }
  };

  const handleQuickApprove = (appId) => {
    resolveApproval(appId, 'APPROVE', 'VP Finance Commercial Approval Granted');
    setToastMessage('Quotation approved and commercial exception logged.');
  };

  const handleQuickReject = (appId) => {
    resolveApproval(appId, 'REJECT', 'Gross margin compression exceeds acceptable risk corridor');
    setToastMessage('Quotation rejected with compliance audit entry.');
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Commercial Finance Command Center</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-100 text-purple-800 border border-purple-200">
              VP Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cash collection, accounts receivable aging, recurring subscriptions MRR, and margin governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenPaymentModal()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>+ Record Payment</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/approvals')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Finance Approvals ({financeApprovals.length})</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/subscriptions')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Repeat className="w-3.5 h-3.5 text-blue-600" />
            <span>Subscriptions</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            <span>Invoices Ledger</span>
          </button>
        </div>
      </div>

      {/* 5 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Net Cash Collected */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Collected Revenue</span>
            <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(overview.netCollected)}</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+14.8% vs prior period</span>
          </p>
        </div>

        {/* Card 2: Total Accounts Receivable */}
        <div
          onClick={() => navigate('/invoices')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Outstanding AR</span>
            <div className="w-7 h-7 rounded bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{formatCurrency(overview.totalAR)}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>{openInvoices.length} open invoices</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 3: Subscription MRR */}
        <div
          onClick={() => navigate('/subscriptions')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subscription MRR</span>
            <div className="w-7 h-7 rounded bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-700">{formatCurrency(overview.mrr)}/mo</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>18 active recurring plans</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 4: Critical Approvals Queue */}
        <div
          onClick={() => navigate('/approvals')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-purple-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Finance Approvals</span>
            <div className="w-7 h-7 rounded bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{financeApprovals.length}</div>
          <p className="text-[11px] text-purple-800 font-semibold mt-1 flex items-center justify-between">
            <span>Margin &lt; 25% or Risk &ge; 70</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 5: Days Sales Outstanding (DSO) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">DSO Benchmark</span>
            <div className="w-7 h-7 rounded bg-slate-50 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{overview.dso} days</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Healthy (&lt; 30d corporate target)
          </p>
        </div>
      </div>

      {/* Grid: AR Aging Distribution & Finance Approvals Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): AR Aging & Open Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* AR Aging Buckets */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Accounts Receivable Aging Breakdown
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-700">
                Total Unpaid: <strong className="text-amber-700">{formatCurrency(overview.totalAR)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-1">
                <span className="text-emerald-800 font-bold block">Current (0–30 Days)</span>
                <span className="text-lg font-black text-emerald-700 block">{formatCurrency(overview.arAging.current)}</span>
                <span className="text-[10px] text-emerald-600 font-medium block">67% of receivables within terms</span>
              </div>
              <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100 space-y-1">
                <span className="text-amber-800 font-bold block">Medium (31–60 Days)</span>
                <span className="text-lg font-black text-amber-700 block">{formatCurrency(overview.arAging.medium)}</span>
                <span className="text-[10px] text-amber-600 font-medium block">Follow-up reminder sent</span>
              </div>
              <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-100 space-y-1">
                <span className="text-rose-800 font-bold block">Critical (60+ Days)</span>
                <span className="text-lg font-black text-rose-700 block">{formatCurrency(overview.arAging.overdue)}</span>
                <span className="text-[10px] text-rose-600 font-medium block">Collections lock triggered</span>
              </div>
            </div>

            {/* Visual Aging Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-emerald-500 h-2.5" style={{ width: '67%' }} title="0-30 days: 67%" />
                <div className="bg-amber-500 h-2.5" style={{ width: '24%' }} title="31-60 days: 24%" />
                <div className="bg-rose-500 h-2.5" style={{ width: '9%' }} title="60+ days: 9%" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>0–30 Days (67%)</span>
                <span>31–60 Days (24%)</span>
                <span>60+ Days (9%)</span>
              </div>
            </div>
          </div>

          {/* Open Invoices Ledger Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Active Receivables Requiring Reconciliation
              </h2>
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="text-xs font-bold text-[#1565C0] hover:underline"
              >
                View all invoices &rarr;
              </button>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Total Amount</th>
                  <th className="py-2.5 px-4 text-right">Balance Due</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openInvoices.map((inv) => {
                  const balance = (inv.total_amount || 0) - (inv.paid_amount || 0);
                  const isOverdue = inv.status === 'OVERDUE';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#1565C0]">
                        {inv.invoice_number}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {inv.customer_name}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(balance)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        {inv.due_date}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs transition"
                        >
                          Record Pay
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: High-Risk Finance Approvals */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                VP Finance Approval Queue ({financeApprovals.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/approvals')}
              className="text-xs font-bold text-[#1565C0] hover:underline"
            >
              Full Queue
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[520px]">
            {financeApprovals.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No high-risk quotes currently pending Finance sign-off.
              </div>
            ) : (
              financeApprovals.map((app) => (
                <div key={app.id} className="py-3.5 first:pt-0 last:pb-0 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{app.quotation_number} - {app.customer_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      Score: {app.risk_score}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-1 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Deal Value:</span>
                      <strong className="text-slate-800">{formatCurrency(app.value)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Discount:</span>
                      <strong className="text-amber-700">{app.discount_pct}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Margin:</span>
                      <strong className={app.margin_pct < 25 ? 'text-rose-700' : 'text-slate-800'}>
                        {app.margin_pct}%
                      </strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-700">Governance Trigger:</strong> {app.reason}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleQuickReject(app.id)}
                      className="px-2.5 py-1 bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-[11px] font-bold rounded transition"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickApprove(app.id)}
                      className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded shadow-2xs transition"
                    >
                      Approve Quote
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Record Customer Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Reconcile incoming cash against invoice receivables ledger.
                </p>
              </div>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setSelectedInvoiceId(id);
                    const inv = invoices.find(i => i.id === id);
                    if (inv) {
                      const remaining = (inv.total_amount || 0) - (inv.paid_amount || 0);
                      setPaymentAmount(remaining > 0 ? remaining : inv.total_amount);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  {invoices.map((inv) => {
                    const balance = (inv.total_amount || 0) - (inv.paid_amount || 0);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} - {inv.customer_name} (Due: {formatCurrency(balance)}) [{inv.status}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-black text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  <option value="Bank Wire Transfer">Bank Wire Transfer</option>
                  <option value="ACH Corporate Transfer">ACH Corporate Transfer</option>
                  <option value="Credit Card (Stripe Autopay)">Credit Card (Stripe Autopay)</option>
                  <option value="Cash / Certified Check">Cash / Certified Check</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Reference #</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-800"
                  placeholder="WIRE-104928"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reconciliation Notes</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cleared via Silicon Valley Bank operating account"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow-xs"
                >
                  Confirm & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinanceDashboard;
