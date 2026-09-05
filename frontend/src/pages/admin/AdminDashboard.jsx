import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import {
  Package,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Settings2
} from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { adminOverview, discountRules, auditEvents } = useSales();

  const metrics = adminOverview || {
    activeProductsCount: 128,
    attentionProductsCount: 6,
    activeRulesCount: 18,
    overridesCount: 12,
    lowMarginCount: 9,
    recentAuditEvents: []
  };

  const recentAudits = (auditEvents || []).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Admin Operations & Governance Console</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-[#1565C0] border border-blue-200">
              System Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized product catalogue pricing, inventory thresholds, discount matrix ceilings, and compliance audit trail.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="px-3.5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Product</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/discount-rules')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Rules</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/audit-log')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Products */}
        <div
          onClick={() => navigate('/admin/products')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Products</span>
            <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{metrics.activeProductsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>128 active, 6 archived</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 2: Attention Products */}
        <div
          onClick={() => navigate('/admin/products?filter=attention')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-amber-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attention Items</span>
            <div className="w-7 h-7 rounded bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{metrics.attentionProductsCount}</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center justify-between">
            <span>Low stock or missing cost</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 3: Active Discount Rules */}
        <div
          onClick={() => navigate('/admin/discount-rules')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-purple-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Rules</span>
            <div className="w-7 h-7 rounded bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">{metrics.activeRulesCount}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Tiers, Categories, Floors</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 4: Governance Overrides */}
        <div
          onClick={() => navigate('/admin/audit-log')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-indigo-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Overrides</span>
            <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700">{metrics.overridesCount}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Executive exceptions</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>

        {/* Card 5: Low Margin Products */}
        <div
          onClick={() => navigate('/admin/products?filter=low-margin')}
          className="bg-white p-4 rounded-lg border border-slate-200 hover:border-rose-300 shadow-xs cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Low Margin</span>
            <div className="w-7 h-7 rounded bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{metrics.lowMarginCount}</div>
          <p className="text-[11px] text-rose-700 font-medium mt-1 flex items-center justify-between">
            <span>&lt; 25% minimum floor</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition" />
          </p>
        </div>
      </div>

      {/* Operational Highlights & Active Governance Matrices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Governance Matrix Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Ceilings Preview */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Active Governance Ceilings & Floors
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/discount-rules')}
                className="text-xs font-bold text-[#1565C0] hover:underline flex items-center gap-1"
              >
                <span>Edit Matrix</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Tiers */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Customer Tiers
                </span>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(discountRules?.tier_ceilings || { Bronze: 5, Silver: 10, Gold: 15, Enterprise: 20 }).map(([tier, ceil]) => (
                    <div key={tier} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                      <span className="font-semibold text-slate-700">{tier}</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        Max {ceil}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Category Limits
                </span>
                <div className="space-y-1.5 text-xs">
                  {Object.entries(discountRules?.category_ceilings || { Hardware: 15, Services: 10, Cloud: 12, Software: 15 }).map(([cat, ceil]) => (
                    <div key={cat} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                        Max {ceil}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gross Margin Floor */}
              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Margin Guardrails
                </span>
                <div className="space-y-3 text-xs pt-1">
                  <div>
                    <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                      <span>Target Margin</span>
                      <span className="font-black text-emerald-700">{discountRules?.margin_floor?.target || 30}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${discountRules?.margin_floor?.target || 30}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-slate-700 font-semibold mb-1">
                      <span>Hard Floor (Min)</span>
                      <span className="font-black text-amber-700">{discountRules?.margin_floor?.minimum || 25}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${discountRules?.margin_floor?.minimum || 25}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    Quotes below {discountRules?.margin_floor?.minimum || 25}% require mandatory VP Finance sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Module Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => navigate('/admin/products')}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Product Catalogue</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Manage SKUs, unit prices, standard costs, recurring billing, and inventory.
              </p>
              <span className="text-[11px] text-[#1565C0] font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                Open Catalogue &rarr;
              </span>
            </div>

            <div
              onClick={() => navigate('/admin/discount-rules')}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-400 cursor-pointer shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Governance Matrix</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Configure tier discount ceilings, category caps, and test with the Rule Simulator.
              </p>
              <span className="text-[11px] text-purple-700 font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                Open Matrix &rarr;
              </span>
            </div>

            <div
              onClick={() => navigate('/admin/audit-log')}
              className="p-4 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 cursor-pointer shadow-xs transition group"
            >
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Administrative Audit Log</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Immutable record of all pricing updates, governance modifications, and overrides.
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition">
                View Audit Trail &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Administrative Audit Trail Feed */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Live Audit Activity
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/audit-log')}
              className="text-xs font-bold text-[#1565C0] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px]">
            {recentAudits.map((item, idx) => (
              <div key={item.id || idx} className="py-3 first:pt-0 last:pb-0 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">
                    {item.action}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mb-1">
                  {item.detail}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="font-medium text-slate-500">User: {item.user}</span>
                  {item.quote_id && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 font-mono text-slate-600">
                      Q-{item.quote_id}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
