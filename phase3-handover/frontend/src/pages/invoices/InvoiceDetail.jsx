import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { Loader, Toast, Modal } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, AlertCircle, CheckCircle, CreditCard, Download, Clock, ShieldCheck, Receipt } from 'lucide-react';

export function InvoiceDetail() {
  const { id } = useParams();
  const { invoices, recordPayment } = useSales();
  const { user } = useAuth();

  const [toastMessage, setToastMessage] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

  // Payment Form States
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('RTGS');
  const [txnRef, setTxnRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Find invoice from live context
  const invoice = useMemo(() => {
    const found = invoices.find(inv => String(inv.id) === String(id));
    if (found) return found;
    return {
      id: id || '1',
      invoice_number: 'INV-1042',
      customer_name: 'Acme Corp',
      total: 2730,
      amount_paid: 0,
      status: 'UNPAID',
      due_date: '2026-09-10',
      quotation_number: 'Q-1042',
      billing_type: 'HYBRID',
      payment_history: []
    };
  }, [invoices, id]);

  const isPaid = invoice.status === 'PAID';
  const isPartial = invoice.status === 'PARTIALLY_PAID';
  const remainingBalance = Math.max(0, parseFloat(invoice.total || 0) - parseFloat(invoice.amount_paid || 0));

  const openPaymentModal = () => {
    setPayAmount(remainingBalance > 0 ? remainingBalance.toFixed(2) : '0');
    setTxnRef(`RTGS/HDFC/${Date.now().toString().slice(-6)}`);
    setNotes(`Settlement recorded by ${user?.name || 'Finance Ops'}`);
    setShowPayModal(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = recordPayment(invoice.id, {
        amount: parseFloat(payAmount),
        method: payMethod,
        reference: txnRef,
        notes: notes
      });
      if (res.success) {
        setToastMessage(`Payment of ${formatCurrency(parseFloat(payAmount))} applied successfully.`);
        setShowPayModal(false);
      } else {
        setToastMessage(res.error || 'Payment recording failed');
      }
    } catch (err) {
      setToastMessage(err.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceLines = [
    {
      invoice_number: invoice.invoice_number,
      description: 'Care Plan 2yr + Hardware Setup Bundle (One-Time Fulfillment)',
      amount: invoice.total,
      status: isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid',
      due_date: formatDate(invoice.due_date) || 'Sep 10'
    },
    {
      invoice_number: 'INV-1043 (Recurring Care)',
      description: 'Care Plan 2yr - Monthly Subscription Schedule Cycle #1',
      amount: 46,
      status: 'Paid',
      due_date: 'Sep 15'
    }
  ];

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/invoices" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoices</span>
        </Link>
        <span className="text-xs text-slate-500 font-medium">
          Originating Order: <strong className="text-slate-800 font-bold">{invoice.quotation_number || 'Q-1042'}</strong>
        </span>
      </div>

      {/* Wireframe Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Invoice Detail: {invoice.invoice_number} ({invoice.customer_name})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 italic">
            Opened by clicking a row on the Invoices list
          </p>
        </div>

        {/* Action Buttons matching wireframe */}
        <div className="flex items-center gap-2.5">
          {remainingBalance > 0 ? (
            <button
              type="button"
              onClick={openPaymentModal}
              className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Fully Reconciled</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setToastMessage('Invoice summary PDF export generated.')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Summary</span>
          </button>
        </div>
      </div>

      {/* Horizontal Stepper matching Image 10 */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between relative">
          {/* Step 1: Order Confirmed */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ✓
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">Order Confirmed</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Completed</span>
          </div>

          <div className="flex-1 h-0.5 bg-emerald-400 -mt-6"></div>

          {/* Step 2: Shipped */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ✓
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">Shipped</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Partial Hub Split</span>
          </div>

          <div className="flex-1 h-0.5 bg-blue-400 -mt-6"></div>

          {/* Step 3: Invoiced */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              3
            </div>
            <span className="text-xs font-bold text-[#1565C0] mt-2">Invoiced</span>
            <span className="text-[10px] text-blue-600 font-semibold">Current State</span>
          </div>

          <div className={`flex-1 h-0.5 -mt-6 ${isPaid ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>

          {/* Step 4: Paid */}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
              isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isPaid ? '✓' : '4'}
            </div>
            <span className={`text-xs font-bold mt-2 ${isPaid ? 'text-emerald-700' : 'text-slate-500'}`}>
              Paid
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {isPaid ? 'Reconciled' : 'Awaiting Settlement'}
            </span>
          </div>
        </div>
      </div>

      {/* Invoice Lines Table matching Image 10 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Invoice Lines
          </h2>
          <span className="text-[11px] text-slate-500">{invoiceLines.length} Line Entries</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Invoice #</th>
              <th className="py-2.5 px-4">Description</th>
              <th className="py-2.5 px-4 text-right">Amount</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoiceLines.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-[#1565C0]">{row.invoice_number}</td>
                <td className="py-2.5 px-4 text-slate-700">{row.description}</td>
                <td className="py-2.5 px-4 font-bold text-slate-900 text-right">{formatCurrency(row.amount)}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    row.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : row.status.includes('Part')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-600">{row.due_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Settlement History if exists */}
      {invoice.payment_history && invoice.payment_history.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Settlement & Reconciliation Audit Trail</span>
            </h2>
            <span className="text-[11px] text-slate-500">{invoice.payment_history.length} Transactions</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Amount</th>
                <th className="py-2 px-4">Channel</th>
                <th className="py-2 px-4">UTR / Ref</th>
                <th className="py-2 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.payment_history.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-4 text-slate-600">{formatDate(tx.paid_at)}</td>
                  <td className="py-2 px-4 font-bold text-emerald-700">{formatCurrency(tx.amount)}</td>
                  <td className="py-2 px-4 font-semibold text-slate-700">{tx.method}</td>
                  <td className="py-2 px-4 font-mono text-[11px] text-slate-600">{tx.reference}</td>
                  <td className="py-2 px-4 text-slate-500 italic">{tx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guidance Banner (Yellow) matching Image 10 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-center gap-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Partial invoicing stays reconciled with partial delivery, nothing is billed before it ships.</span>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && (
        <Modal title={`Record Payment: ${invoice.invoice_number}`} onClose={() => setShowPayModal(false)}>
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Settlement Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance > 0 ? remainingBalance : undefined}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Outstanding Balance: {formatCurrency(remainingBalance)}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-xs font-semibold"
              >
                <option value="RTGS">RTGS Wire Settlement</option>
                <option value="ACH">ACH Direct Debit</option>
                <option value="CREDIT_CARD">Corporate Card</option>
                <option value="CHECK">Commercial Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Transaction / Reference ID</label>
              <input
                type="text"
                required
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{submitting ? 'Recording...' : 'Confirm Payment'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default InvoiceDetail;
