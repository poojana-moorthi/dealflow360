import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { Loader, Toast, Modal } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { AlertCircle, CreditCard, Search, PlusCircle, CheckCircle, FileText, ArrowRight } from 'lucide-react';

export function InvoiceList() {
  const { invoices, recordPayment } = useSales();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('RTGS');
  const [txnRef, setTxnRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const unpaidCount = useMemo(() => {
    return invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIALLY_PAID').length;
  }, [invoices]);

  const paidCount = useMemo(() => {
    return invoices.filter(i => i.status === 'PAID').length;
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesFilter =
        activeFilter === 'ALL' ? true :
        activeFilter === 'UNPAID' ? (inv.status === 'UNPAID' || inv.status === 'PARTIALLY_PAID') :
        inv.status === activeFilter;

      const matchesSearch =
        searchTerm === '' ||
        inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.billing_type?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [invoices, activeFilter, searchTerm]);

  const openPayModal = (e, inv) => {
    e.stopPropagation();
    setSelectedInvoice(inv);
    const balance = Math.max(0, parseFloat(inv.total) - parseFloat(inv.amount_paid || 0));
    setPayAmount(balance.toFixed(2));
    setTxnRef(`RTGS/HDFC/${Date.now().toString().slice(-6)}`);
    setNotes(`Commercial reconciliation by ${user?.name || 'Finance Ops'}`);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    try {
      const res = recordPayment(selectedInvoice.id, {
        amount: parseFloat(payAmount),
        method: payMethod,
        reference: txnRef,
        notes: notes
      });
      if (res.success) {
        setToastMessage(`Payment of ${formatCurrency(parseFloat(payAmount))} reconciled for ${selectedInvoice.invoice_number}`);
        setSelectedInvoice(null);
      } else {
        setToastMessage(res.error || 'Failed to record payment');
      }
    } catch (err) {
      setToastMessage(err.message || 'Payment processing error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Metric Badges matching Image 9 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Invoices (Ledger)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every invoice generated from one-time and recurring orders with live AR reconciliation
          </p>
        </div>

        {/* Metric Badges matching Image 9 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveFilter(activeFilter === 'UNPAID' ? 'ALL' : 'UNPAID')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
              activeFilter === 'UNPAID'
                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                : 'bg-red-50 text-[#EF4444] border-red-200 hover:bg-red-100'
            }`}
          >
            {unpaidCount} Unpaid
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'PAID' ? 'ALL' : 'PAID')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
              activeFilter === 'PAID'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 text-[#10B981] border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {paidCount} Paid
          </button>
        </div>
      </div>

      {/* Info Banner (Yellow) matching Image 9 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-2.5 rounded-md text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Click an invoice row to open its full payment and delivery reconciliation detail, or click [+ Record Payment] to clear outstanding balances.</span>
        </div>
        <span className="text-[11px] font-semibold text-amber-800">
          Showing {filteredInvoices.length} of {invoices.length}
        </span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'UNPAID', 'PAID'].map((flt) => (
            <button
              key={flt}
              onClick={() => setActiveFilter(flt)}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                activeFilter === flt
                  ? 'bg-[#1565C0] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {flt === 'ALL' ? 'All Invoices' : flt}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table matching Image 9 wireframe */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Invoice #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4 text-right">Total</th>
              <th className="py-3 px-4 text-right">Balance Due</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  No invoice records match the selected filters.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'PAID';
                const isPartial = inv.status === 'PARTIALLY_PAID';
                const balanceDue = Math.max(0, parseFloat(inv.total) - parseFloat(inv.amount_paid || 0));

                return (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-[#1565C0]">
                      <Link to={`/invoices/${inv.id}`} className="hover:underline flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#1565C0]" />
                        <span>{inv.invoice_number}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.customer_name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {inv.billing_type || 'HYBRID'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={balanceDue > 0 ? 'text-red-600' : 'text-emerald-700'}>
                        {formatCurrency(balanceDue)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPartial
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {balanceDue > 0 ? (
                        <button
                          type="button"
                          onClick={(e) => openPayModal(e, inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition shadow-2xs inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Reconciled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          title={`Reconcile Payment: ${selectedInvoice.invoice_number}`}
          onClose={() => setSelectedInvoice(null)}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{selectedInvoice.customer_name}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Total Invoiced:</span>
                <span className="font-bold text-slate-800">{formatCurrency(selectedInvoice.total)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Outstanding Balance:</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(Math.max(0, parseFloat(selectedInvoice.total) - parseFloat(selectedInvoice.amount_paid || 0)))}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Payment Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={Math.max(0, parseFloat(selectedInvoice.total) - parseFloat(selectedInvoice.amount_paid || 0))}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Payment Settlement Channel</label>
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
              <label className="block text-slate-700 font-bold mb-1">Transaction / UTR Reference ID</label>
              <input
                type="text"
                required
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Reconciliation Notes</label>
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
                onClick={() => setSelectedInvoice(null)}
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
                <span>{submitting ? 'Reconciling...' : 'Confirm Payment'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default InvoiceList;
