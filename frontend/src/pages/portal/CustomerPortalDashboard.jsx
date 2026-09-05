import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import portalService from '../../services/portalService';
import { PortalHeader } from '../../components/portal/PortalHeader';
import { NegotiationChat, CounterOfferForm } from '../../components/portal/NegotiationChat';
import { Loader, Toast, Modal } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getQuotationCustody } from '../../utils/quotationCustody';
import { FileText, CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle, Send, Clock, UserCheck, Sparkles } from 'lucide-react';

export function CustomerPortalDashboard() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [quoteDetail, setQuoteDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Line-Level Question & Inquiry State
  const [lineQuestionItem, setLineQuestionItem] = useState(null);
  const [lineQuestionText, setLineQuestionText] = useState('');
  const [lineCounterDiscount, setLineCounterDiscount] = useState('');

  const userJson = localStorage.getItem('dealflow360_portal_user');
  const authUserJson = localStorage.getItem('dealflow360_user');
  const stored = userJson ? JSON.parse(userJson) : (authUserJson ? JSON.parse(authUserJson) : null);
  const portalUser = stored || { name: 'Customer Partner', email: 'customer1@dealflow360.com', companyName: 'Acme Corporation' };

  // Resolve customer company name (never mail id)
  const companyName = useMemo(() => {
    return (
      portalUser.companyName ||
      portalUser.company_name ||
      quoteDetail?.customer_name ||
      quotes[0]?.customer_name ||
      (portalUser.email?.toLowerCase().includes('nova') ? 'Nova Technologies' :
       portalUser.email?.toLowerCase().includes('techcorp') ? 'TechCorp International' :
       portalUser.email?.toLowerCase().includes('delta') ? 'Delta Logistics LLC' :
       portalUser.email?.toLowerCase().includes('zenith') ? 'Zenith Health Systems' :
       'Acme Corporation')
    );
  }, [portalUser, quoteDetail, quotes]);

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

  // Real-time synchronization when sales rep replies or proposes revised terms
  useEffect(() => {
    const handlePortalUpdate = () => {
      loadQuotes();
      if (selectedQuoteId) {
        loadQuoteDetail(selectedQuoteId);
      }
    };
    window.addEventListener('dealflow360_portal_update', handlePortalUpdate);
    window.addEventListener('storage', handlePortalUpdate);

    // Fast polling to pick up any replies or revisions
    const pollInterval = setInterval(() => {
      if (selectedQuoteId) {
        loadQuoteDetail(selectedQuoteId);
      }
    }, 3000);

    return () => {
      window.removeEventListener('dealflow360_portal_update', handlePortalUpdate);
      window.removeEventListener('storage', handlePortalUpdate);
      clearInterval(pollInterval);
    };
  }, [selectedQuoteId]);

  // Detect latest revised proposal from sales rep
  const latestRepRevision = useMemo(() => {
    if (!quoteDetail || !quoteDetail.negotiations) return null;
    return quoteDetail.negotiations.find(
      (n) => n.role === 'SALES_REP' && n.counter_price && n.id !== 'init-1'
    );
  }, [quoteDetail]);

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

  const handleLineQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!lineQuestionItem) return;
    setSubmitting(true);
    try {
      const discountPart = lineCounterDiscount ? ` (Requested Line Discount: ${lineCounterDiscount}%)` : '';
      const message = `[Item Inquiry: ${lineQuestionItem.product_name}]${discountPart}: ${lineQuestionText}`;
      await portalService.submitNegotiation(selectedQuoteId, {
        counterPrice: quoteDetail.total_amount,
        counterDiscountPct: quoteDetail.discount_pct || 0,
        comment: message
      });
      setToastMessage(`Question on "${lineQuestionItem.product_name}" submitted to Account Executive.`);
      setLineQuestionItem(null);
      setLineQuestionText('');
      setLineCounterDiscount('');
      await loadQuoteDetail(selectedQuoteId);
    } catch (err) {
      setToastMessage(err.message || 'Failed to submit line-level inquiry.');
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
        companyName={companyName}
        customerName={companyName}
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
              quotes.map((q) => {
                const custody = getQuotationCustody(q);
                return (
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
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${custody.badgeClass}`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="mt-2 text-base font-extrabold text-slate-900 font-mono">
                      {formatCurrency(q.total_amount)}
                    </div>

                    {/* Custody Tag */}
                    <div className="mt-2 text-[10px] font-bold py-0.5 px-1.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span className="truncate">{custody.label}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between pt-1 border-t border-slate-100">
                      <span>AE: {q.sales_rep_name || 'Alex Morgan'}</span>
                      <span>Valid: {formatDate(q.valid_until)}</span>
                    </div>
                  </div>
                );
              })
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
                      className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getQuotationCustody(quoteDetail).badgeClass}`}
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

              {/* Highlighted Sales Rep Revised Counter-Offer Alert */}
              {latestRepRevision && quoteDetail.status !== 'CONFIRMED' && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Revised Terms Offered by Sales Rep</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        Revised Price: {formatCurrency(latestRepRevision.counter_price)} {latestRepRevision.counter_discount_pct ? `(${latestRepRevision.counter_discount_pct}% Discount)` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900 font-medium italic">
                      "{latestRepRevision.comment}"
                    </p>
                    <div className="text-[11px] text-emerald-700">
                      Proposed by {latestRepRevision.user_name} • Ready for your immediate acceptance
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmOrder}
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Revised Terms</span>
                  </button>
                </div>
              )}

              {/* Prominent Quotation Approval Status & In Whose Hands It Is Banner */}
              {(() => {
                const c = getQuotationCustody(quoteDetail);
                return (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${c.badgeClass}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase tracking-wider">
                          Proposal Status: {quoteDetail.status}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white shadow-2xs">
                          {c.label}
                        </span>
                      </div>
                      <div className="text-xs font-semibold">
                        <span>Current Custody Hand: </span>
                        <strong className="underline">{c.reviewer}</strong>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {c.description}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-white/80 p-2.5 rounded-lg border border-current/20">
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        In Whose Hands It Is
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-0.5">
                        {c.hands}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
                        <th className="py-2.5 px-3 text-center">Line Inquiry</th>
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
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setLineQuestionItem(it);
                                setLineQuestionText('');
                                setLineCounterDiscount(it.discount_pct || '');
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#1565C0] border border-blue-200 rounded text-[11px] font-semibold flex items-center gap-1 mx-auto transition cursor-pointer"
                              title="Ask question or propose counter discount on this line"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Ask</span>
                            </button>
                          </td>
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

      {/* Line Level Inquiry Modal */}
      {lineQuestionItem && (
        <Modal
          isOpen={!!lineQuestionItem}
          title={`Line Item Inquiry: ${lineQuestionItem.product_name}`}
          onClose={() => setLineQuestionItem(null)}
        >
          <form onSubmit={handleLineQuestionSubmit} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Product / Scope:</span>
                <span className="font-bold text-slate-900">{lineQuestionItem.product_name}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Current Unit Price:</span>
                <span className="font-bold text-slate-800">{formatCurrency(lineQuestionItem.unit_price)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-slate-500">Current Discount:</span>
                <span className="font-bold text-amber-700">{lineQuestionItem.discount_pct}%</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Proposed Line Discount Counter (%) [Optional]</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                placeholder={`Current is ${lineQuestionItem.discount_pct}%`}
                value={lineCounterDiscount}
                onChange={(e) => setLineCounterDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Your Question or Adjustment Request</label>
              <textarea
                required
                rows={3}
                placeholder="Ask about volume pricing, delivery lead time, or service scope for this item..."
                value={lineQuestionText}
                onChange={(e) => setLineQuestionText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLineQuestionItem(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{submitting ? 'Submitting...' : 'Submit Line Inquiry'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CustomerPortalDashboard;
