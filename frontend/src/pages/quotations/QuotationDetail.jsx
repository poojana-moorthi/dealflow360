import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  ArrowLeft,
  Building2,
  Package,
  Calculator,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  FileText,
  UserCheck,
  Send,
  XCircle,
  ThumbsUp,
  History
} from 'lucide-react';

export function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getQuotationById, updateQuotation, resolveApproval, approvals, auditEvents, persona } = useSales();

  const [toastMessage, setToastMessage] = useState('');

  const quote = useMemo(() => {
    return getQuotationById(id || 1) || {
      id: 1,
      quotation_number: 'Q-104',
      customer_id: 1,
      customer_name: 'Acme Corporation',
      customer_tier: 'Gold',
      total_amount: 92000,
      subtotal: 105000,
      discount_amount: 19500,
      tax_amount: 6500,
      gross_margin_pct: 24.2,
      discount_pct: 22.0,
      discount_limit: 15.0,
      stage: 'PENDING APPROVAL',
      status: 'PENDING APPROVAL',
      health_score: 58,
      health_status: 'AT RISK',
      risk_score: 82,
      risk_level: 'HIGH RISK',
      approval_required: true,
      required_approval_level: 'FINANCE',
      owner: 'Sales Rep',
      created_at: '2026-09-05T08:10:00Z',
      items: [
        { product_id: 1, product_name: 'Laptop Pro 14', sku: 'HW-LP-14', quantity: 30, unit_price: 2400, discount_pct: 22, discount_amount: 15840, final_price: 56160, margin_pct: 24.5, limit: 15, violation: true },
        { product_id: 4, product_name: 'Thunderbolt Docking Station', sku: 'HW-DK-04', quantity: 30, unit_price: 280, discount_pct: 15, discount_amount: 1260, final_price: 7140, margin_pct: 32.8, limit: 15, violation: false },
        { product_id: 6, product_name: 'Onsite Deployment & Setup', sku: 'SV-STP-01', quantity: 40, unit_price: 450, discount_pct: 12, discount_amount: 2160, final_price: 15840, margin_pct: 44.4, limit: 10, violation: true }
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Discount Optimization',
          description: 'Reduce discount from 22% to 15% on Laptop Pro 14 to protect approximately $6,440 in gross margin.',
          target_discount: 15,
          savings: 6440
        }
      ]
    };
  }, [getQuotationById, id]);

  const matchingApproval = useMemo(() => {
    return approvals.find(a => a.quotation_id === quote.id && a.status === 'PENDING');
  }, [approvals, quote.id]);

  // Apply AI Recommendation handler
  const handleApplyRecommendation = (rec) => {
    const updatedItems = (quote.items || []).map(it => {
      if (it.product_name === 'Laptop Pro 14' || it.violation) {
        return {
          ...it,
          discount_pct: rec.target_discount || 15,
          violation: false,
          margin_pct: 32.4
        };
      }
      return it;
    });

    updateQuotation(quote.id, {
      items: updatedItems,
      discount_pct: 15.0,
      gross_margin_pct: 32.5,
      risk_score: 28,
      risk_level: 'LOW RISK',
      approval_required: false,
      status: 'DRAFT',
      stage: 'DRAFT',
      health_score: 92,
      health_status: 'HEALTHY',
      recommendations: []
    });

    setToastMessage(`Recommendation applied: Discount adjusted to ${rec.target_discount}%. Margin restored to 32.5%.`);
  };

  // Approval actions (by Manager or Finance)
  const handleApprove = () => {
    if (matchingApproval) {
      resolveApproval(matchingApproval.id, 'APPROVE', `Commercial approval granted by ${persona.role}`);
    } else {
      updateQuotation(quote.id, { status: 'APPROVED', stage: 'APPROVED', approval_required: false });
    }
    setToastMessage('Quotation approved successfully.');
  };

  const handleReject = () => {
    if (matchingApproval) {
      resolveApproval(matchingApproval.id, 'REJECT', `Commercial exception rejected by ${persona.role}`);
    } else {
      updateQuotation(quote.id, { status: 'REJECTED', stage: 'REJECTED' });
    }
    setToastMessage('Quotation returned / rejected.');
  };

  const isSalesRepresentative = persona.role === 'SALES_REP';
  const canApprove = (persona.role === 'SALES_MANAGER' || persona.role === 'FINANCE' || persona.role === 'ADMIN') && quote.status === 'PENDING APPROVAL';

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Top Breadcrumb & Status Tag */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link to="/quotations" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations Pipeline</span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Owner: <strong>{quote.owner || 'Sales Rep'}</strong></span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
            quote.status === 'APPROVED' || quote.status === 'WON'
              ? 'bg-emerald-100 text-emerald-800'
              : quote.status === 'PENDING APPROVAL'
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : quote.status === 'REJECTED'
              ? 'bg-red-100 text-red-800'
              : 'bg-slate-100 text-slate-800'
          }`}>
            {quote.status}
          </span>
        </div>
      </div>

      {/* 16. Header matching specification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quotation {quote.quotation_number}
            </h1>
            <span className="text-xl font-bold text-slate-400">•</span>
            <span className="text-xl font-bold text-slate-800">{quote.customer_name}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Created on {new Date(quote.created_at || Date.now()).toLocaleDateString()} • Tier: {quote.customer_tier}
          </p>
        </div>

        {/* Pricing Total in Header */}
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 font-mono">
            ${(quote.total_amount).toLocaleString()}
          </div>
          <span className="text-xs font-bold text-amber-700">
            {quote.status === 'PENDING APPROVAL'
              ? `Pending ${quote.required_approval_level || 'Finance'} Approval`
              : quote.status}
          </span>
        </div>
      </div>

      {/* Governance & Role-Based Actions Bar */}
      {canApprove && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
              Governance Review Required
            </span>
            <p className="text-xs text-blue-700 mt-0.5">
              Acting as <strong>{persona.role}</strong>. You have authorization to approve or reject this quotation.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleApprove}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Quotation</span>
            </button>
            <button
              type="button"
              onClick={handleReject}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md shadow-xs transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Return / Reject</span>
            </button>
          </div>
        </div>
      )}

      {isSalesRepresentative && quote.status === 'PENDING APPROVAL' && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg text-xs text-amber-900 flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            This quote is locked awaiting <strong>{quote.required_approval_level}</strong> sign-off. As a Sales Rep, you cannot self-approve high-risk discounts. Use the top persona switcher to test the manager flow.
          </span>
        </div>
      )}

      {/* Section 16: Customer Info & Deal Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-[#1565C0]" />
            <span>Customer Details</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Account Name:</span>
              <span className="font-bold text-slate-900">{quote.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Customer Tier:</span>
              <span className="font-semibold text-slate-800">{quote.customer_tier} Partner</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Contract Ceiling:</span>
              <span className="font-bold text-[#1565C0]">{quote.discount_limit}% Max Discount</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Payment Terms:</span>
              <span className="font-medium text-slate-800">Net 30</span>
            </div>
          </div>
        </div>

        {/* Governance Telemetry */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <span>Governance Telemetry</span>
          </h3>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Discount Ceiling:</span>
              <span className="font-bold text-slate-800">{quote.discount_limit}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Applied Discount:</span>
              <span className={`font-bold ${quote.discount_pct > quote.discount_limit ? 'text-rose-600' : 'text-emerald-600'}`}>
                {quote.discount_pct}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk Score:</span>
              <span className="font-bold text-rose-600">{quote.risk_score} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Required:</span>
              <span className="font-bold text-slate-900">{quote.approval_required ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Level:</span>
              <span className="font-bold text-[#1565C0]">{quote.required_approval_level}</span>
            </div>
          </div>
        </div>

        {/* Deal Health Telemetry */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Deal Health Telemetry</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold">Health Score:</span>
              <span className="text-xl font-black text-slate-900">{quote.health_score} / 100</span>
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  quote.health_score >= 80
                    ? 'bg-emerald-500'
                    : quote.health_score >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${quote.health_score}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-slate-500">Status:</span>
              <span className={quote.health_score >= 80 ? 'text-emerald-700' : 'text-rose-700'}>
                {quote.health_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 16. AI Recommendations Card with "Apply Recommendation" Button */}
      {quote.recommendations && quote.recommendations.length > 0 && (
        <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-lg shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                AI Recommendation Engine
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">
              Margin Optimization
            </span>
          </div>

          {quote.recommendations.map(rec => (
            <div key={rec.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <p className="text-purple-900 font-medium leading-relaxed">
                {rec.description}
              </p>
              <button
                type="button"
                onClick={() => handleApplyRecommendation(rec)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-md transition shadow-xs shrink-0 flex items-center gap-1"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Apply Recommendation</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Products Line-Item Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1565C0]" />
            <span>Product Line Items ({quote.items?.length || 0})</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">Pricing Ledger</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-4 text-center">Qty</th>
              <th className="py-2.5 px-4 text-right">Unit Price</th>
              <th className="py-2.5 px-4 text-center">Discount</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Final Price</th>
              <th className="py-2.5 px-4 text-right">Margin %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(quote.items || []).map((it, idx) => (
              <tr key={idx} className={it.violation ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                <td className="py-2.5 px-4 font-bold text-slate-900">
                  {it.product_name}
                  <span className="block font-mono font-normal text-[11px] text-slate-400">{it.sku}</span>
                </td>
                <td className="py-2.5 px-4 text-center font-semibold text-slate-800">{it.quantity}</td>
                <td className="py-2.5 px-4 text-right text-slate-700">${(it.unit_price).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-center font-bold text-slate-900">{it.discount_pct}%</td>
                <td className="py-2.5 px-4 text-center">
                  {it.violation ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                      OVER (+{Math.round(it.discount_pct - (it.limit || 15))}pt)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      OK
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">${(it.final_price || 0).toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{it.margin_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grid: Pricing Summary & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Summary */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calculator className="w-4 h-4 text-[#1565C0]" />
            <span>Commercial Pricing Summary</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900 font-mono">${(quote.subtotal || quote.total_amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount ({quote.discount_pct}%):</span>
              <span className="font-bold text-rose-600 font-mono">-${(quote.discount_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax:</span>
              <span className="font-bold text-slate-700 font-mono">+${(quote.tax_amount || 0).toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-mono">
              <span className="text-sm font-black text-slate-900">Total Contract Value:</span>
              <span className="text-2xl font-black text-slate-900">${(quote.total_amount).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <span className="font-bold text-slate-700">Blended Gross Margin:</span>
              <span className="text-sm font-black text-emerald-600">{quote.gross_margin_pct}%</span>
            </div>
          </div>
        </div>

        {/* 20. Audit Activity Panel */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600" />
              <span>Quotation Audit Activity Log</span>
            </h3>
            <span className="text-[11px] text-slate-400">Immutable</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {auditEvents.slice(0, 5).map(ev => (
              <div key={ev.id} className="p-3 text-xs flex justify-between items-start hover:bg-slate-50">
                <div>
                  <div className="font-bold text-slate-900">{ev.action}</div>
                  <div className="text-[11px] text-slate-500">{ev.detail}</div>
                  <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">{ev.user}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationDetail;
