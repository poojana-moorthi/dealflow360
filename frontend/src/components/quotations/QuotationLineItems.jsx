import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Trash2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

export function QuotationLineItems({
  items = [],
  onUpdateItem,
  onRemoveItem,
  editable = true
}) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
          <tr>
            <th className="py-3 px-3">Product / Service</th>
            <th className="py-3 px-3">Category</th>
            <th className="py-3 px-3">Billing</th>
            <th className="py-3 px-3 w-20">Qty</th>
            <th className="py-3 px-3">Unit Price</th>
            <th className="py-3 px-3 w-24">Discount %</th>
            <th className="py-3 px-3">Line Total</th>
            <th className="py-3 px-3">Governance Alert</th>
            {editable && <th className="py-3 px-3 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {items.length === 0 ? (
            <tr>
              <td colSpan={editable ? 9 : 8} className="py-8 text-center text-slate-400">
                No items added to quotation yet. Select products from the catalogue below.
              </td>
            </tr>
          ) : (
            items.map((it) => (
              <tr key={it.product_id} className={`hover:bg-slate-50 ${it.risk_flag ? 'bg-amber-50/40' : ''}`}>
                <td className="py-3 px-3 font-semibold text-slate-900">
                  <div>{it.product_name}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{it.sku}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                    {it.category}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    it.billing_type === 'RECURRING' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {it.billing_type} {it.billing_frequency !== 'ONE_TIME' ? `(${it.billing_frequency})` : ''}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {editable ? (
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => onUpdateItem(it.product_id, 'quantity', parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-xs focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="font-semibold">{it.quantity}</span>
                  )}
                </td>
                <td className="py-3 px-3 font-medium text-slate-800">
                  {formatCurrency(it.unit_price)}
                </td>
                <td className="py-3 px-3">
                  {editable ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={it.discount_pct}
                        onChange={(e) => onUpdateItem(it.product_id, 'discount_pct', parseFloat(e.target.value) || 0)}
                        className={`w-16 px-2 py-1 border rounded text-center text-xs focus:ring-1 ${
                          it.risk_flag ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-300 focus:ring-blue-500'
                        }`}
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    <span className={`font-semibold ${it.discount_pct > 10 ? 'text-amber-700' : 'text-slate-800'}`}>
                      {formatPercent(it.discount_pct)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-bold text-slate-900">
                  {formatCurrency(it.line_total || ((it.unit_price * it.quantity) * (1 - (it.discount_pct || 0) / 100)))}
                </td>
                <td className="py-3 px-3">
                  {it.risk_flag || it.risk_reason ? (
                    <div className="flex items-center gap-1 text-amber-700 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[10px] leading-tight">{it.risk_reason || 'Policy Breach'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px]">Compliant</span>
                    </div>
                  )}
                </td>
                {editable && (
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(it.product_id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                      title="Remove line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function MarginIndicator({ marginPct, grossProfit }) {
  const pct = parseFloat(marginPct) || 0;
  const isHealthy = pct >= 30;
  const isSubTarget = pct >= 20 && pct < 30;

  return (
    <div className="p-4 rounded-lg bg-white border border-slate-200">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-slate-600 uppercase">Live Blended Margin</span>
        <span className={`font-bold text-sm ${isHealthy ? 'text-emerald-600' : (isSubTarget ? 'text-amber-600' : 'text-rose-600')}`}>
          {formatPercent(pct)}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isHealthy ? 'bg-emerald-500' : (isSubTarget ? 'bg-amber-500' : 'bg-rose-500')
          }`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Target: 30.0%</span>
        <span>Profit: {formatCurrency(grossProfit)}</span>
      </div>
    </div>
  );
}

export function RiskScoreCard({ riskScore = 0, riskLevel = 'LOW', approvalRequired = false, approvalLevel = 'NONE', reasons = [] }) {
  const isHigh = riskScore >= 60;
  const isCritical = riskScore >= 75;

  return (
    <div className={`p-4 rounded-lg border ${
      isCritical ? 'bg-rose-50/70 border-rose-200' : (isHigh ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200')
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Governance Risk Engine</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
          isCritical ? 'bg-rose-600 text-white' : (isHigh ? 'bg-amber-600 text-white' : 'bg-green-600 text-white')
        }`}>
          {riskScore}/100 - {riskLevel}
        </span>
      </div>

      <div className="text-xs space-y-1 mt-2">
        <div className="flex justify-between">
          <span className="text-slate-600">Approval Required:</span>
          <span className="font-bold text-slate-900">{approvalRequired ? 'YES' : 'NO'}</span>
        </div>
        {approvalRequired && (
          <div className="flex justify-between">
            <span className="text-slate-600">Required Reviewer:</span>
            <span className="font-bold text-[#1565C0]">{approvalLevel}</span>
          </div>
        )}
      </div>

      {reasons && reasons.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Detection Reasons:</span>
          <ul className="mt-1 space-y-1">
            {reasons.map((r, i) => (
              <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1">
                <span className="text-rose-500 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function UpsellPanel({ recommendations = [], onAddProduct }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
          Intelligent Upsell Recommendations
        </h4>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.ruleId} className="bg-white p-3 rounded-md border border-blue-100 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{rec.product.name}</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.2 rounded">
                  {rec.product.category}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">{rec.reason}</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                <span>Offer Price: <strong className="text-slate-800">{formatCurrency(rec.offerPrice)}</strong></span>
                <span className="text-emerald-600 font-semibold">Margin Delta: +{rec.marginDeltaPct}%</span>
                <span className="text-emerald-700 font-semibold">Profit: +{formatCurrency(rec.profitDelta)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddProduct(rec.product)}
              className="shrink-0 bg-[#1565C0] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#0D47A1] transition shadow-xs"
            >
              + Add to Quote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuotationLineItems;
