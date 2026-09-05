import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Activity,
  Clock,
  Send,
  Filter,
  Search,
  ArrowUpDown
} from 'lucide-react';

export function DealHealthDashboard() {
  const { quotations, dashboardSummary } = useSales();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All Deals');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Highest Risk');
  const [toastMessage, setToastMessage] = useState('');
  const [actionStates, setActionStates] = useState({
    1: 'Nudge sent',
    2: 'Escalated to Manager'
  });

  const handleNudge = (dealName, id) => {
    setActionStates(prev => ({ ...prev, [id]: 'Nudge sent' }));
    setToastMessage(`Automated slack/email nudge dispatched to sales rep for ${dealName}.`);
  };

  const handleEscalate = (dealName, id) => {
    setActionStates(prev => ({ ...prev, [id]: 'Escalated to Manager' }));
    setToastMessage(`Priority governance alert escalated to regional sales manager for ${dealName}.`);
  };

  // 19. Filtering & Sorting Logic
  const filteredDeals = useMemo(() => {
    let result = quotations.filter(q => {
      const matchSearch = q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (activeTab === 'Healthy') return q.health_score >= 80;
      if (activeTab === 'Watch') return q.health_score >= 60 && q.health_score < 80;
      if (activeTab === 'At Risk') return q.health_score >= 40 && q.health_score < 60;
      if (activeTab === 'Critical') return q.health_score < 40;
      return true; // All Deals
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'Highest Value') return (b.total_amount || 0) - (a.total_amount || 0);
      if (sortBy === 'Lowest Margin') return (a.gross_margin_pct || 0) - (b.gross_margin_pct || 0);
      if (sortBy === 'Highest Risk') return (b.risk_score || 0) - (a.risk_score || 0);
      if (sortBy === 'Recently Updated') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      return 0;
    });

    return result;
  }, [quotations, activeTab, searchTerm, sortBy]);

  // Wireframe mockup anomalies
  const wireframeAnomalies = [
    { id: 1, deal: 'Zenith Co', issue: 'Idle 9 days', flagged: 'Aug 24', defaultAction: 'NUDGE' },
    { id: 2, deal: 'Delta LLC', issue: 'Discount 22% vs avg 8%', flagged: 'Aug 25', defaultAction: 'ESCALATE' }
  ];

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Deal Health & Anomaly Radar</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Autonomous portfolio scoring, idle deal friction detection, and margin erosion diagnostics
        </p>
      </div>

      {/* 3 Telemetry Summary Cards matching wireframe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Stalled Deals */}
        <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stalled Deals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">5</div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">5 quotes idle 7+ days</p>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="bg-white p-4 rounded-lg border border-red-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Discount Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-600">2</div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">2 above rep average</p>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Delivery Slippage</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#1565C0]">3</div>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">3 promise dates at risk</p>
        </div>
      </div>

      {/* Anomaly Detection Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Automated Anomaly Radar
          </h2>
          <span className="text-[11px] text-slate-500 font-semibold">2 Flagged Outliers</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Deal</th>
              <th className="py-2.5 px-4">Issue</th>
              <th className="py-2.5 px-4">Flagged</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {wireframeAnomalies.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-900">{a.deal}</td>
                <td className="py-2.5 px-4 font-semibold text-rose-700">{a.issue}</td>
                <td className="py-2.5 px-4 text-slate-600">{a.flagged}</td>
                <td className="py-2.5 px-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    {actionStates[a.id] && (
                      <span className="text-xs font-semibold text-slate-500 italic">
                        {actionStates[a.id]}
                      </span>
                    )}

                    {a.defaultAction === 'NUDGE' ? (
                      <button
                        type="button"
                        onClick={() => handleNudge(a.deal, a.id)}
                        className="px-3 py-1 bg-[#1565C0] hover:bg-blue-800 text-white rounded text-xs font-semibold transition shadow-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Nudge Rep</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEscalate(a.deal, a.id)}
                        className="px-3 py-1 bg-[#DC2626] hover:bg-red-700 text-white rounded text-xs font-semibold transition shadow-xs flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        <span>Escalate</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 19. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs text-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['All Deals', 'Healthy', 'Watch', 'At Risk', 'Critical'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md font-bold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search deal or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs w-48 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-semibold text-slate-700"
          >
            <option value="Highest Risk">Highest Risk</option>
            <option value="Highest Value">Highest Value</option>
            <option value="Lowest Margin">Lowest Margin</option>
            <option value="Recently Updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Pipeline Health Radar Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Quotation #</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Value</th>
              <th className="py-3 px-4 text-center">Discount</th>
              <th className="py-3 px-4 text-center">Margin %</th>
              <th className="py-3 px-4">Health Score</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                  No deals match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredDeals.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-[#1565C0]">
                    <Link to={`/quotations/${d.id}`} className="hover:underline">
                      {d.quotation_number}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.customer_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">${(d.total_amount).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">{d.discount_pct}%</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">{d.gross_margin_pct}%</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{d.health_score} / 100</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          d.health_score >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.health_score >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {d.health_status}
                        </span>
                      </div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.health_score >= 80 ? 'bg-emerald-500' : d.health_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${d.health_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{d.last_activity || 'Recent'}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => navigate(`/quotations/${d.id}`)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded text-xs font-semibold transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DealHealthDashboard;
