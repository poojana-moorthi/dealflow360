import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import portalService from '../../services/portalService';
import { PortalHeader } from '../../components/portal/PortalHeader';
import { NegotiationChat, CounterOfferForm } from '../../components/portal/NegotiationChat';
import { Loader, Toast } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { FileText, CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

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
  const authUserJson = localStorage.getItem('dealflow360_user');
  const stored = userJson ? JSON.parse(userJson) : (authUserJson ? JSON.parse(authUserJson) : null);
  const portalUser = stored || { name: 'Customer Partner', email: 'customer1@dealflow360.com', companyName: 'Acme Corporation' };

  const loadQuotes = async () => {
    try {
      const res = await portalService.getQuotations();
      if (res && res.success && Array.isArray(res.data)) {
        setQuotes(res.data);
        if (res.data.length > 0) {
          setSelectedQuoteId((prev) => prev || res.data[0].id);
        }
      }
    } catch (err) {
      console.error('[PORTAL] Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadQuoteDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await portalService.getQuotationDetail(id);
      if (res && res.success) {
        setQuoteDetail(res.data);
      }
    } catch (err) {
      console.error('[PORTAL] Error loading quote detail:', err);
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
      setToastMessage(res.message || 'Counter offer successfully submitted.');
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
        customerName={portalUser.name || 'Johnathan Acme'}
        companyName={portalUser.companyName || 'Acme Corporation'}
      />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposals List (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Your Procurement Proposals</h3>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {quotes.length} {quotes.length === 1 ? 'Proposal' : 'Proposals'}
            </span>
          </div>

          <div className="space-y-2">
            {quotes.length === 0 ? (
              <div className="p-6 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-white">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Proposals Found</p>
                <p className="mt-1 text-slate-400">Your Account Executive has not yet published an active quote.</p>
              </div>
            ) : (
              quotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedQuoteId === q.id
                      ? 'border-[#1565C0] bg-blue-50/50 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-blue-700">{q.quotation_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.status === 'NEGOTIATION'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <div className="mt-2 text-base font-extrabold text-slate-900">
                    {formatCurrency(q.total_amount)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between pt-1 border-t border-slate-100">
                    <span>AE: {q.sales_rep_name || 'Alex Morgan'}</span>
                    <span>Valid: {formatDate(q.valid_until)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected Proposal Details & Negotiation (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {quotes.length === 0 ? (
            <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-500 shadow-xs">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Proposals Available</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Once your DealFlow360 Account Executive drafts and submits a formal proposal, it will appear here for your review, counter-offer, and acceptance.
              </p>
            </div>
          ) : detailLoading || !quoteDetail ? (
            <Loader text="Loading proposal contract..." />
          ) : (
            <>
              {/* Proposal Header Banner */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900">{quoteDetail.quotation_number}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        quoteDetail.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : quoteDetail.status === 'NEGOTIATION'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {quoteDetail.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Assigned Account Executive:{' '}
                    <strong className="text-slate-900">{quoteDetail.sales_rep_name || 'Alex Morgan'}</strong>{' '}
                    <span className="text-slate-400">({quoteDetail.sales_rep_email || 'sales_rep@dealflow360.com'})</span>
                  </p>
                </div>

                {/* Confirm / Accept Order Button */}
                {quoteDetail.status !== 'CONFIRMED' && quoteDetail.status !== 'COMPLETED' ? (
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Execute Order</span>
                  </button>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Officially Confirmed</span>
                  </span>
                )}
              </div>

              {/* Items Breakdown Table */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Procurement Items & Services</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Confidential Client Pricing</span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product / Scope</th>
                        <th className="py-2.5 px-3">Billing</th>
                        <th className="py-2.5 px-3">Quantity</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3">Discount</th>
                        <th className="py-2.5 px-3 text-right">Net Line Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(quoteDetail.items || []).map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {it.product_name}
                            {it.sku && <span className="ml-2 text-[10px] text-slate-400 font-normal">[{it.sku}]</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              it.billing_type === 'RECURRING' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {it.billing_type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium">{it.quantity}</td>
                          <td className="py-2.5 px-3">{formatCurrency(it.unit_price)}</td>
                          <td className="py-2.5 px-3 text-amber-700 font-semibold">{it.discount_pct}%</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900 text-right">{formatCurrency(it.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Contract Price Summary */}
                <div className="p-3.5 bg-slate-50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 text-xs border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span>Subtotal: <strong>{formatCurrency(quoteDetail.subtotal)}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Commercial Tax: <strong>{formatCurrency(quoteDetail.tax_amount)}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      Total Contract Value: <span className="text-[#1565C0] font-black">{formatCurrency(quoteDetail.total_amount)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Counter Offer Form (Steps 14-16 in Demo) */}
              {quoteDetail.status !== 'CONFIRMED' && (
                <CounterOfferForm
                  onSubmit={handleCounterOfferSubmit}
                  loading={submitting}
                  defaultPrice={quoteDetail.total_amount}
                />
              )}

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
