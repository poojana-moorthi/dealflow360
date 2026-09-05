import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import portalService from '../../services/portalService';
import { PortalHeader } from '../../components/portal/PortalHeader';
import { NegotiationChat, CounterOfferForm } from '../../components/portal/NegotiationChat';
import { Loader, Toast } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FileText, CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export function CustomerPortalDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [quoteDetail, setQuoteDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const userJson = localStorage.getItem('dealflow360_portal_user');
  const portalUser = userJson ? JSON.parse(userJson) : { name: 'Johnathan Acme', email: 'customer@acme.com' };

  const loadQuotes = async () => {
    try {
      const res = await portalService.getQuotations();
      if (res.success) {
        setQuotes(res.data);
        if (res.data.length > 0 && !selectedQuoteId) {
          setSelectedQuoteId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuoteDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await portalService.getQuotationDetail(id);
      if (res.success) setQuoteDetail(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    if (selectedQuoteId) {
      loadQuoteDetail(selectedQuoteId);
    }
  }, [selectedQuoteId]);

  const handleCounterOfferSubmit = async ({ counterPrice, counterDiscountPct, comment }) => {
    setSubmitting(true);
    try {
      const res = await portalService.submitNegotiation(selectedQuoteId, {
        counterPrice,
        counterDiscountPct,
        comment
      });
      setToastMessage(res.message);
      await loadQuotes();
      await loadQuoteDetail(selectedQuoteId);
    } catch (err) {
      setToastMessage(err.message || 'Error submitting counter offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    try {
      const res = await portalService.confirmQuotation(selectedQuoteId);
      setToastMessage('Quotation accepted! Commercial order confirmed and initial invoice generated.');
      await loadQuotes();
      await loadQuoteDetail(selectedQuoteId);
    } catch (err) {
      setToastMessage(err.message || 'Error confirming quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Connecting to Secure Customer Procurement Space..." />;

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <PortalHeader
        customerName={portalUser.name}
        companyName="Acme Corporation"
      />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposals List (1 col) */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Your Procurement Proposals</h3>
          <div className="space-y-2">
            {quotes.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuoteId(q.id)}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedQuoteId === q.id
                    ? 'border-[#1565C0] bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-blue-700">{q.quotation_number}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                    {q.status}
                  </span>
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  {formatCurrency(q.total_amount)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Sales Rep: {q.sales_rep_name}</span>
                  <span>Valid to: {formatDate(q.valid_until)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Proposal Details & Negotiation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {detailLoading || !quoteDetail ? (
            <Loader text="Loading proposal contract..." />
          ) : (
            <>
              {/* Proposal Header Banner */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">{quoteDetail.quotation_number}</h2>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                      {quoteDetail.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Assigned Account Executive: <strong>{quoteDetail.sales_rep_name}</strong> ({quoteDetail.sales_rep_email})
                  </p>
                </div>

                {/* Confirm / Accept Order Button */}
                {quoteDetail.status !== 'CONFIRMED' && quoteDetail.status !== 'COMPLETED' ? (
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Execute Order</span>
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Officially Confirmed</span>
                  </span>
                )}
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Procurement Items & Services</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product / Scope</th>
                        <th className="py-2.5 px-3">Billing</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3">Discount</th>
                        <th className="py-2.5 px-3">Net Line Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(quoteDetail.items || []).map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{it.product_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{it.billing_type}</td>
                          <td className="py-2.5 px-3 font-medium">{it.quantity}</td>
                          <td className="py-2.5 px-3">{formatCurrency(it.unit_price)}</td>
                          <td className="py-2.5 px-3 text-amber-700 font-semibold">{it.discount_pct}%</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{formatCurrency(it.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contract Price Summary */}
                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Subtotal: {formatCurrency(quoteDetail.subtotal)}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-slate-500">Tax: {formatCurrency(quoteDetail.tax_amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      Total Package Value: <span className="text-[#1565C0]">{formatCurrency(quoteDetail.total_amount)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Counter Offer Form (Steps 14-16 in Demo) */}
              <CounterOfferForm
                onSubmit={handleCounterOfferSubmit}
                loading={submitting}
                defaultPrice={quoteDetail.total_amount}
              />

              {/* Negotiation Conversation Thread */}
              <NegotiationChat
                negotiations={quoteDetail.negotiations || []}
                currentQuotationTotal={quoteDetail.total_amount}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerPortalDashboard;
