import React, { useState } from 'react';
import { useSales } from '../../context/SalesContext';
import { Toast } from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';
import {
  Save,
  AlertCircle,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Play,
  TrendingDown,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export function DiscountRulesSetup() {
  const {
    discountRules,
    updateTierCeiling,
    updateCategoryCeiling,
    updateMarginFloor,
    evaluateGovernanceSimulation,
    adminOverrideQuotation,
    quotations
  } = useSales();

  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Table 1: Tier Discount Ceilings state
  const [tierCeilings, setTierCeilings] = useState({
    Bronze: discountRules?.tier_ceilings?.Bronze ?? 5,
    Silver: discountRules?.tier_ceilings?.Silver ?? 10,
    Gold: discountRules?.tier_ceilings?.Gold ?? 15,
    Enterprise: discountRules?.tier_ceilings?.Enterprise ?? 20
  });

  // Table 2: Category Discount Ceilings state
  const [categoryCeilings, setCategoryCeilings] = useState({
    Hardware: discountRules?.category_ceilings?.Hardware ?? 15,
    Services: discountRules?.category_ceilings?.Services ?? 10,
    Cloud: discountRules?.category_ceilings?.Cloud ?? 12,
    Software: discountRules?.category_ceilings?.Software ?? 15,
    Subscription: discountRules?.category_ceilings?.Subscription ?? 10,
    Accessories: discountRules?.category_ceilings?.Accessories ?? 20
  });

  // Margin floor state
  const [marginFloor, setMarginFloor] = useState({
    target: discountRules?.margin_floor?.target ?? 30,
    minimum: discountRules?.margin_floor?.minimum ?? 25
  });

  // Escalation matrix state
  const [matrix] = useState([
    { condition: 'Within tier/Category limit', action: 'No approval needed', level: 'SALES_REP' },
    { condition: 'Over Limit, blended risk medium (40-69)', action: 'Sales Manager Approval', level: 'SALES_MANAGER' },
    { condition: 'Over limit, blended high risk (70+) or margin < 25%', action: 'Sales Manager then Finance Approval', level: 'FINANCE' }
  ]);

  // Rule Simulator State
  const [simTier, setSimTier] = useState('Gold');
  const [simCategory, setSimCategory] = useState('Hardware');
  const [simDiscount, setSimDiscount] = useState(22);
  const [simMargin, setSimMargin] = useState(24);
  const [simDealValue, setSimDealValue] = useState(92000);
  const [simResult, setSimResult] = useState(null);

  // Admin Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideQuoteId, setOverrideQuoteId] = useState(quotations[0]?.id || 1);
  const [overrideDiscount, setOverrideDiscount] = useState(20);
  const [overrideReason, setOverrideReason] = useState('');

  // Handle Save All Rules
  const handleSaveConfiguration = () => {
    setSaving(true);
    try {
      // Update all tiers
      Object.entries(tierCeilings).forEach(([tier, ceil]) => {
        updateTierCeiling(tier, ceil, 'Bulk configuration update');
      });

      // Update all categories
      Object.entries(categoryCeilings).forEach(([cat, ceil]) => {
        updateCategoryCeiling(cat, ceil, 'Bulk configuration update');
      });

      // Update margin floor
      updateMarginFloor(marginFloor.target, marginFloor.minimum, 'Bulk configuration update');

      setToastMessage('Discount tiers, category limits, and margin guardrails saved successfully.');
    } catch (err) {
      setToastMessage(err.message || 'Configuration saved successfully.');
    } finally {
      setSaving(false);
    }
  };

  // Run Rule Simulator
  const handleRunSimulation = () => {
    const res = evaluateGovernanceSimulation({
      customerTier: simTier,
      category: simCategory,
      requestedDiscount: parseFloat(simDiscount) || 0,
      grossMargin: parseFloat(simMargin) || 0,
      dealValue: parseFloat(simDealValue) || 0
    });
    setSimResult(res);
  };

  // Handle Admin Override Submit
  const handleApplyOverride = (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setToastMessage('Mandatory governance override reason must be provided.');
      return;
    }
    const overridden = adminOverrideQuotation(overrideQuoteId, overrideDiscount, overrideReason);
    if (overridden) {
      setToastMessage(`Quotation ${overridden.quotation_number} governance overridden and authorized.`);
      setShowOverrideModal(false);
      setOverrideReason('');
    } else {
      setToastMessage('Quotation not found for override.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Save Action matching Image 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Discount tiers and approval chains</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tier thresholds, category limits, gross margin floors, and test blended risk escalation chains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOverrideModal(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Authorize Override</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfiguration}
            disabled={saving}
            className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save configuration'}</span>
          </button>
        </div>
      </div>

      {/* Guidance Banner (Yellow) matching Image 15 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level. All approvals, rejections, and edits must be logged with user, timestamp, and reason.
        </span>
      </div>

      {/* Grid: Tier Ceilings & Category Ceilings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Tier Discount Ceilings */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Tier Discount Ceilings
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold">Customer Segment</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Tier</th>
                <th className="py-2.5 px-4 text-right">Max Discount Ceiling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-amber-800">Bronze</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tierCeilings.Bronze}
                      onChange={(e) => setTierCeilings({ ...tierCeilings, Bronze: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-700">Silver</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tierCeilings.Silver}
                      onChange={(e) => setTierCeilings({ ...tierCeilings, Silver: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-yellow-600">Gold</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tierCeilings.Gold}
                      onChange={(e) => setTierCeilings({ ...tierCeilings, Gold: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-purple-700">Enterprise</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tierCeilings.Enterprise}
                      onChange={(e) => setTierCeilings({ ...tierCeilings, Enterprise: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table 2: Category Discount Ceilings */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Category Discount Ceilings
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold">Catalog Category</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right">Max Discount Ceiling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(categoryCeilings).map(([cat, ceil]) => (
                <tr key={cat} className="hover:bg-slate-50/60">
                  <td className="py-2 px-4 font-bold text-slate-800">{cat}</td>
                  <td className="py-2 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={ceil}
                        onChange={(e) => setCategoryCeilings({ ...categoryCeilings, [cat]: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-600">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gross Margin Floor & Guardrails Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Gross Margin Floor Guardrails
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Global Profitability Protection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Target Profit Margin:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={marginFloor.target}
                  onChange={(e) => setMarginFloor({ ...marginFloor, target: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-600">%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Company-wide profitability benchmark. Deals maintaining &gt;= {marginFloor.target}% enjoy streamlined approvals.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Hard Floor (Minimum Allowable):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={marginFloor.minimum}
                  onChange={(e) => setMarginFloor({ ...marginFloor, minimum: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-amber-800 focus:ring-1 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-600">%</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Quotes yielding &lt; {marginFloor.minimum}% margin trigger an automatic Finance approval lock and high risk escalation.
            </p>
          </div>
        </div>
      </div>

      {/* Table 3: Blended Governance Escalation Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Blended Governance Escalation Matrix
          </h2>
          <span className="text-[11px] text-slate-500 font-semibold">Autonomous Escalation Routing</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Condition</th>
              <th className="py-3 px-4">Escalation Reviewer / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-semibold text-slate-800">{row.condition}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                    idx === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : idx === 1
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {row.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rule Simulator Component */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Live Governance Rule Simulator
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Shared Pricing & Compliance Engine</span>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Test how proposed discounts and margins interact with customer tier ceilings, category caps, and risk scoring without altering active database records.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Customer Tier</label>
              <select
                value={simTier}
                onChange={(e) => setSimTier(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="Bronze">Bronze (Max {tierCeilings.Bronze}%)</option>
                <option value="Silver">Silver (Max {tierCeilings.Silver}%)</option>
                <option value="Gold">Gold (Max {tierCeilings.Gold}%)</option>
                <option value="Enterprise">Enterprise (Max {tierCeilings.Enterprise}%)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Catalog Category</label>
              <select
                value={simCategory}
                onChange={(e) => setSimCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium"
              >
                {Object.keys(categoryCeilings).map((cat) => (
                  <option key={cat} value={cat}>{cat} (Max {categoryCeilings[cat]}%)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Requested Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={simDiscount}
                onChange={(e) => setSimDiscount(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-800"
                placeholder="22"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Projected Gross Margin %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={simMargin}
                onChange={(e) => setSimMargin(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-800"
                placeholder="24"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Deal Value ($)</label>
              <input
                type="number"
                min="0"
                value={simDealValue}
                onChange={(e) => setSimDealValue(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold text-slate-800"
                placeholder="92000"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleRunSimulation}
              className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Evaluate Governance Simulation</span>
            </button>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Simulation Outcome:</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    simResult.riskLevel === 'HIGH RISK'
                      ? 'bg-rose-100 text-rose-800'
                      : simResult.riskLevel === 'MEDIUM RISK'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {simResult.riskLevel} (Score: {simResult.riskScore}/100)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-600">Required Approval:</span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    simResult.requiredApprovalLevel === 'FINANCE'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : simResult.requiredApprovalLevel === 'SALES_MANAGER'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {simResult.requiredApprovalLevel === 'FINANCE'
                      ? 'VP Finance Approval Required'
                      : simResult.requiredApprovalLevel === 'SALES_MANAGER'
                      ? 'Sales Manager Review'
                      : 'Auto-Approved (Sales Rep)'}
                  </span>
                </div>
              </div>

              {/* Warning Badges */}
              {simResult.warningBadges.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {simResult.warningBadges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Compliant: Discount is within customer tier and catalog category limits.</span>
                </div>
              )}

              {/* Risk Breakdown Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 font-medium block">Discount Ceiling Risk</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    +{simResult.riskBreakdown.discountRisk} pts
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 font-medium block">Margin Compression Risk</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    +{simResult.riskBreakdown.marginRisk} pts
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 font-medium block">Deal Size Exposure</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    +{simResult.riskBreakdown.dealSizeRisk} pts
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-slate-200">
                  <span className="text-slate-500 font-medium block">Inactivity Factor</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    +{simResult.riskBreakdown.inactivityRisk} pts
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Authorize Governance Override
                </h3>
                <p className="text-xs text-slate-500">
                  Executive governance bypass with mandatory immutable audit logging.
                </p>
              </div>
            </div>

            <form onSubmit={handleApplyOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Quotation</label>
                <select
                  value={overrideQuoteId}
                  onChange={(e) => setOverrideQuoteId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
                >
                  {quotations.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.quotation_number} - {q.customer_name} ({formatCurrency(q.total_amount)}) [Status: {q.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Authorized Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overrideDiscount}
                  onChange={(e) => setOverrideDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-purple-700 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mandatory Justification / Exception Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Executive Board exception authorized for strategic customer expansion in Q3."
                  className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded shadow-xs"
                >
                  Apply Override & Force Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiscountRulesSetup;
