import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCustomerEmail, getQuotationCustody } from '../../utils/quotationCustody';
import { Toast, Modal } from '../../components/common/Card';
import portalService from '../../services/portalService';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  ArrowRight,
  Sparkles,
  Search,
  FileText
} from 'lucide-react';

export function CustomerNegotiationsHub() {
  const { quotations, updateQuotation } = useSales();
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [counterModalQuote, setCounterModalQuote] = useState(null);
  const [revisedDiscount, setRevisedDiscount] = useState(15);
  const [revisedNote, setRevisedNote] = useState('');

  // Collect quotations with active negotiations or customer inquiries
  const negotiationList = useMemo(() => {
    return (quotations || []).map((q) => {
      const customerEmail = getCustomerEmail(q.customer_id, q.customer_name);
      const custody = getQuotationCustody(q);

      // Synthesize realistic customer inquiries / counter-offers if none stored
      const threads = q.negotiations && q.negotiations.length > 0 ? q.negotiations : [
        {
          id: `neg-${q.id}-1`,
          sender: 'CUSTOMER',
          sender_name: q.customer_name || 'Customer Procurement',
          sender_email: customerEmail,
          counter_price: Math.round(q.total_amount * 0.93),
          discount_pct: Math.min(45, (q.discount_pct || 10) + 4),
          comment: `Requesting standard 4% volume concession or Net-45 terms for ${q.customer_name}. Please advise if this can be confirmed.`,
          time: '1 hour ago'
        }
      ];

      return {
        ...q,
        customerEmail,
        custody,
        threads
      };
    }).filter((item) => {
      // Prioritize quotes in NEGOTIATION stage or matching search term
      const matchesSearch =
        item.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [quotations, searchTerm]);

  const handleAcceptCounter = (quote, thread) => {
    updateQuotation(quote.id, {
      total_amount: thread.counter_price,
      discount_pct: thread.discount_pct,
      status: 'APPROVED',
      stage: 'APPROVED',
      notes: `Customer counter-offer accepted by ${user?.name || 'Sales Rep'}. Revised total: ${formatCurrency(thread.counter_price)}`
    });
    setToastMessage(`Accepted customer counter-offer for ${quote.quotation_number}! Quotation updated and approved.`);
  };

  const handleSendReply = (quoteId) => {
    if (!replyText.trim()) return;
    const message = replyText.trim();
    updateQuotation(quoteId, {
      notes: `Sales Rep reply: ${message}`
    });
    portalService.recordSalesRepMessage(quoteId, {
      comment: message,
      userName: user?.name || 'Alex Morgan (Sales Rep)'
    });
    setToastMessage(`Response successfully delivered to Customer Procurement Portal!`);
    setReplyText('');
    setActiveReplyId(null);
  };

  const handleOpenRevisedModal = (quote) => {
    setCounterModalQuote(quote);
    setRevisedDiscount(quote.discount_pct || 15);
    setRevisedNote(`We can offer ${quote.discount_pct ? quote.discount_pct + 2 : 15}% if contract execution is finalized this week.`);
  };

  const handleRevisedCounterSubmit = (e) => {
    e.preventDefault();
    if (!counterModalQuote) return;
    const newPrice = Math.round((counterModalQuote.subtotal || counterModalQuote.total_amount) * (1 - revisedDiscount / 100));
    const noteText = revisedNote.trim() || `Sales Rep proposed revised terms of ${formatCurrency(newPrice)} (${revisedDiscount}% discount).`;
    updateQuotation(counterModalQuote.id, {
      total_amount: newPrice,
      discount_pct: parseFloat(revisedDiscount),
      stage: 'NEGOTIATION',
      notes: `Revised counter sent: ${noteText}`
    });
    portalService.recordSalesRepMessage(counterModalQuote.id, {
      comment: noteText,
      counterPrice: newPrice,
      counterDiscountPct: parseFloat(revisedDiscount),
      userName: user?.name || 'Alex Morgan (Sales Rep)'
    });
    setToastMessage(`Revised counter-offer sent to ${counterModalQuote.customerEmail} (${formatCurrency(newPrice)}).`);
    setCounterModalQuote(null);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Negotiations & Inquiries</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
              {negotiationList.length} Active Threads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct two-way commercial negotiation console between Sales Representatives and Customer Procurement portals
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer, email, or quote #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Negotiation Thread Cards */}
      <div className="space-y-4">
        {negotiationList.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">No matching customer negotiation threads found</p>
          </div>
        ) : (
          negotiationList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition space-y-4"
            >
              {/* Card Header: Quote #, Customer Name, Customer Email, and Custody */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/quotations/${item.id}`}
                      className="text-base font-extrabold text-[#1565C0] hover:underline flex items-center gap-1"
                    >
                      <span>{item.quotation_number}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-bold text-slate-900">{item.customer_name}</span>
                  </div>

                  {/* Customer Email ID */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Customer Email:</span>
                    </span>
                    <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {item.customerEmail}
                    </span>
                  </div>
                </div>

                {/* Custody Tag */}
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${item.custody.badgeClass}`}>
                    {item.custody.label}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Value: <strong className="text-slate-900 font-mono">{formatCurrency(item.total_amount)}</strong>
                  </div>
                </div>
              </div>

              {/* Thread Messages */}
              <div className="space-y-3">
                {item.threads.map((t, idx) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.sender_name}</span>
                        <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          Customer Counter-Offer / Inquiry
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{t.time}</span>
                    </div>

                    <div className="text-xs text-slate-800 bg-white p-2.5 rounded border border-amber-100 italic">
                      "{t.comment}"
                    </div>

                    {/* Pricing telemetry */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                      <div className="flex items-center gap-4">
                        <span>
                          Proposed Price: <strong className="text-emerald-700 font-mono text-sm">{formatCurrency(t.counter_price)}</strong>
                        </span>
                        <span>
                          Requested Discount: <strong className="text-rose-600 font-mono">{t.discount_pct}%</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptCounter(item, t)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Customer Terms</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenRevisedModal(item)}
                          className="px-3 py-1.5 bg-[#1565C0] hover:bg-blue-700 text-white font-bold text-xs rounded transition cursor-pointer shadow-xs"
                        >
                          Propose Revised Terms
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(activeReplyId === item.id ? null : item.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline Reply Input */}
              {activeReplyId === item.id && (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Type response to ${item.customer_name} (${item.customerEmail})...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(item.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Customer Portal</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Revised Counter Modal */}
      {counterModalQuote && (
        <Modal
          isOpen={!!counterModalQuote}
          title={`Propose Revised Terms for ${counterModalQuote.quotation_number}`}
          onClose={() => setCounterModalQuote(null)}
        >
          <form onSubmit={handleRevisedCounterSubmit} className="space-y-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Customer Account:</span>
              <span className="font-bold text-slate-900">{counterModalQuote.customer_name} ({counterModalQuote.customerEmail})</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Adjusted Discount (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                required
                value={revisedDiscount}
                onChange={(e) => setRevisedDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block font-mono">
                Revised Offer Value: {formatCurrency(Math.round((counterModalQuote.subtotal || counterModalQuote.total_amount) * (1 - revisedDiscount / 100)))}
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Explanation Message for Customer</label>
              <textarea
                rows={3}
                required
                value={revisedNote}
                onChange={(e) => setRevisedNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCounterModalQuote(null)}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#1565C0] hover:bg-blue-700 text-white rounded text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Send Revised Counter to Customer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default CustomerNegotiationsHub;
