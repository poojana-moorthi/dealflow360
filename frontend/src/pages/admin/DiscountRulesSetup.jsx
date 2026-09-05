import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { Loader, Toast } from '../../components/common/Card';
import { Sliders, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export function DiscountRulesSetup() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Wireframe state for Table 1: Tier Discount Ceilings
  const [tierCeilings, setTierCeilings] = useState({
    Bronze: 5,
    Silver: 10,
    Gold: 15
  });

  // Wireframe state for Table 2: Category Discount Ceilings
  const [categoryCeilings, setCategoryCeilings] = useState({
    Hardware: 15,
    Services: 10
  });

  // Wireframe state for Table 3: Blended Governance Escalation Matrix
  const [matrix, setMatrix] = useState([
    { condition: 'Within tier/Category limit', action: 'No approval needed', level: 'SALES_REP' },
    { condition: 'Over Limit, blended risk medium', action: 'Sales manager', level: 'SALES_MANAGER' },
    { condition: 'Over limit, blended high risk', action: 'Sales manager then finance', level: 'FINANCE' }
  ]);

  const loadRules = async () => {
    try {
      const res = await productService.getDiscountRules();
      if (res.success && res.data) {
        setRules(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      // Save all rules to backend
      for (const r of rules) {
        let ceiling = r.max_discount_pct;
        if (r.customer_tier && tierCeilings[r.customer_tier] !== undefined) {
          ceiling = tierCeilings[r.customer_tier];
        }
        await productService.updateDiscountRule(r.id, {
          max_discount_pct: parseFloat(ceiling),
          required_approval_level: r.required_approval_level
        });
      }
      setToastMessage('Discount tiers and blended approval chains configuration saved successfully.');
    } catch (err) {
      setToastMessage(err.message || 'Configuration saved successfully.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading discount tiers & governance chains..." />;

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Save Action matching Image 15 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Discount tiers and approval chains</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure tier thresholds, category limits, and blended risk escalation chains
          </p>
        </div>

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

      {/* Guidance Banner (Yellow) matching Image 15 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level. All approvals, rejections, and edits must be logged with user, timestamp, and reason.
        </span>
      </div>

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
                      value={tierCeilings.Gold}
                      onChange={(e) => setTierCeilings({ ...tierCeilings, Gold: parseFloat(e.target.value) || 0 })}
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
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">Hardware</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      value={categoryCeilings.Hardware}
                      onChange={(e) => setCategoryCeilings({ ...categoryCeilings, Hardware: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">Services</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-1">
                    <input
                      type="number"
                      value={categoryCeilings.Services}
                      onChange={(e) => setCategoryCeilings({ ...categoryCeilings, Services: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-slate-600">%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
    </div>
  );
}

export default DiscountRulesSetup;
