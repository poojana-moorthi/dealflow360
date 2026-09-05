import React, { useState } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { MessageSquare, Send, ArrowDownRight, User } from 'lucide-react';

export function NegotiationChat({ negotiations = [], currentQuotationTotal }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">Procurement Negotiation History</h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {negotiations.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No counter offers or comments submitted yet.
          </p>
        ) : (
          negotiations.map((n) => {
            const isCustomer = n.role === 'CUSTOMER';
            const isRevisedOffer = !isCustomer && n.counter_price;
            return (
              <div
                key={n.id}
                className={`p-3 rounded-lg text-xs border ${
                  isCustomer
                    ? 'bg-blue-50/70 border-blue-200 ml-4'
                    : isRevisedOffer
                    ? 'bg-emerald-50 border-emerald-300 mr-4 shadow-2xs'
                    : 'bg-amber-50/60 border-amber-200 mr-4'
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      {n.user_name}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      isCustomer
                        ? 'bg-blue-100 text-blue-800'
                        : isRevisedOffer
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {isCustomer ? 'Customer' : isRevisedOffer ? 'Sales Counter-Offer' : 'Sales Rep Reply'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px]">{formatDateTime(n.created_at)}</span>
                </div>
                {n.counter_price && (
                  <div className={`my-1.5 p-1.5 rounded border inline-block font-semibold ${
                    isRevisedOffer
                      ? 'bg-white border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-white border-blue-200 text-blue-900'
                  }`}>
                    {isRevisedOffer ? 'Sales Proposed Price: ' : 'Counter Offer Price: '}
                    {formatCurrency(n.counter_price)}
                    {n.counter_discount_pct && ` (${n.counter_discount_pct}% discount)`}
                  </div>
                )}
                <p className="text-slate-800 mt-1 font-medium">{n.comment}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function CounterOfferForm({ onSubmit, loading = false, defaultPrice = 0 }) {
  const [counterPrice, setCounterPrice] = useState('');
  const [counterDiscountPct, setCounterDiscountPct] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment && !counterPrice && !counterDiscountPct) return;
    onSubmit({
      counterPrice: parseFloat(counterPrice) || null,
      counterDiscountPct: parseFloat(counterDiscountPct) || null,
      comment
    });
    setCounterPrice('');
    setCounterDiscountPct('');
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Submit Counter Offer / Request Concessions</h3>
        <p className="text-xs text-slate-500">
          Propose target pricing or specific line discounts for enterprise review.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Proposed Total Price (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 780000"
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Target Discount (%)
          </label>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 20"
            value={counterDiscountPct}
            onChange={(e) => setCounterDiscountPct(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Procurement Notes / Business Justification *
        </label>
        <textarea
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. Acme procurement requires ₹7,80,000 all-inclusive package price to execute contract this fiscal quarter."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#1565C0] text-white text-xs font-semibold rounded-md hover:bg-[#0D47A1] transition shadow-xs flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{loading ? 'Submitting...' : 'Submit Counter Offer'}</span>
        </button>
      </div>
    </form>
  );
}

export default NegotiationChat;
