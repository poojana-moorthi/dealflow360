import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  PlusCircle,
  CheckSquare,
  TrendingUp,
  FileText,
  Percent,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Activity,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function SalesDashboard() {
  const { user } = useAuth();
  const { persona, dashboardSummary, quotations, approvals, auditEvents } = useSales();
  const navigate = useNavigate();

  const currentRole = user?.role || persona?.role || 'SALES_REP';

  const metrics = dashboardSummary.metrics;
  const healthCounts = dashboardSummary.dealHealthCounts;
  const anomalies = dashboardSummary.anomalies;

  // Render Health Badge & Bar helper
  const renderHealthScore = (score) => {
    let tag = 'HEALTHY';
    let colorClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let barColor = 'bg-emerald-500';

    if (score < 40) {
      tag = 'CRITICAL';
      colorClass = 'text-rose-700 bg-rose-50 border-rose-200';
      barColor = 'bg-rose-500';
    } else if (score < 60) {
      tag = 'AT RISK';
      colorClass = 'text-orange-700 bg-orange-50 border-orange-200';
      barColor = 'bg-orange-500';
    } else if (score < 80) {
      tag = 'WATCH';
      colorClass = 'text-amber-700 bg-amber-50 border-amber-200';
      barColor = 'bg-amber-500';
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800 text-xs">{score}</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${colorClass}`}>
            {tag}
          </span>
        </div>
        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(100, score)}%` }} />
        </div>
      </div>
    );
  };

  const getGreetingName = () => {
    if (user?.name && user.name !== 'User' && user.name !== 'Sales Rep') {
      return `${user.name} (${currentRole.replace(/_/g, ' ')})`;
    }
    if (currentRole === 'ADMIN') return 'System Administrator';
    if (currentRole === 'SALES_MANAGER') return 'Sarah Connor (Sales Director)';
    if (currentRole === 'FINANCE') return 'David Miller (VP Finance)';
    return 'Alex Morgan (Senior Sales Executive)';
  };

  return (
    <div className="space-y-6">
      {/* 3. Header matching specification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Good morning, {getGreetingName()}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here's what's happening with your pipeline today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {['ADMIN', 'SALES_REP', 'SALES_MANAGER'].includes(currentRole) && (
            <Link
              to="/quotations/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white text-xs font-bold rounded-md hover:bg-[#0D47A1] transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Quotation</span>
            </Link>
          )}

          {['ADMIN', 'SALES_MANAGER', 'FINANCE'].includes(currentRole) && (
            <Link
              to="/approvals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 text-xs font-bold rounded-md border border-slate-300 hover:bg-slate-50 transition shadow-xs"
            >
              <CheckSquare className="w-4 h-4 text-amber-600" />
              <span>Approvals ({metrics.pendingApprovals})</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4. 5 KPI CARDS matching specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Won Revenue */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Won Revenue</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">${(metrics.wonRevenue).toLocaleString()}</span>
            <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
              <span className="font-semibold">{metrics.wonDealsCount} Won Deals</span>
              <span className="text-emerald-700 font-bold">+{metrics.wonGrowthPct}% vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Pipeline */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Pipeline</span>
            <div className="p-1.5 rounded-md bg-blue-50 text-[#1565C0]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900">${(metrics.pipelineValue).toLocaleString()}</span>
            <div className="text-[11px] text-slate-600 mt-1">
              <span className="font-semibold">{metrics.activeDealsCount} Active Deals</span>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">Draft • Pending Approval • Negotiation</p>
            </div>
          </div>
        </div>

        {/* Card 3: Average Gross Margin */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Gross Margin</span>
            <div className={`p-1.5 rounded-md ${metrics.avgGrossMargin >= 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-2xl font-black ${
              metrics.avgGrossMargin >= 30 ? 'text-emerald-600' : metrics.avgGrossMargin >= 25 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {metrics.avgGrossMargin}%
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Target: {metrics.targetMargin}%</p>
          </div>
        </div>

        {/* Card 4: Pending Approvals (Clickable) */}
        <div
          onClick={() => navigate('/approvals')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-amber-300 hover:bg-amber-50/20 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Approvals</span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-600">{metrics.pendingApprovals}</span>
            <p className="text-[11px] text-rose-600 mt-1 font-bold">{metrics.highRiskApprovals} High Risk</p>
          </div>
        </div>

        {/* Card 5: At-Risk Deals (Clickable) */}
        <div
          onClick={() => navigate('/deal-health')}
          className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs cursor-pointer hover:border-rose-300 hover:bg-rose-50/20 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">At-Risk Deals</span>
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600">{metrics.atRiskDeals}</span>
            <p className="text-[11px] text-rose-700 mt-1 font-bold">{metrics.criticalDeals} Critical</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Deal Health & AI Sentinel), Right Column (Active Pipeline & Approvals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col): 5. AI Deal Health Panel & 6. AI Sentinel */}
        <div className="space-y-6">
          {/* 5. AI DEAL HEALTH PANEL */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Portfolio Deal Health</h3>
                <p className="text-xs text-slate-500">Continuous 4-tier telemetry</p>
              </div>
              <Link to="/deal-health" className="text-xs font-semibold text-[#1565C0] hover:underline flex items-center gap-1">
                <span>Inspect</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center justify-between font-bold text-emerald-800">
                  <span>Healthy</span>
                  <span className="text-base">{healthCounts.healthy} deals</span>
                </div>
                <div className="w-full bg-emerald-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[80%]" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between font-bold text-amber-800">
                  <span>Watch</span>
                  <span className="text-base">{healthCounts.watch} deals</span>
                </div>
                <div className="w-full bg-amber-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-600 h-full w-[45%]" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200">
                <div className="flex items-center justify-between font-bold text-orange-800">
                  <span>At Risk</span>
                  <span className="text-base">{healthCounts.atRisk} deals</span>
                </div>
                <div className="w-full bg-orange-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-orange-600 h-full w-[35%]" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200">
                <div className="flex items-center justify-between font-bold text-rose-800">
                  <span>Critical</span>
                  <span className="text-base">{healthCounts.critical} deals</span>
                </div>
                <div className="w-full bg-rose-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rose-600 h-full w-[25%]" />
                </div>
              </div>
            </div>
          </div>

          {/* 6. AI SENTINEL / ANOMALY RADAR */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">AI Sentinel / Anomaly Radar</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1565C0] border border-blue-200">
                Autonomous
              </span>
            </div>

            <div className="space-y-3">
              {anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{anom.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/quotations/${anom.quote_id}`)}
                      className="px-2.5 py-0.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-bold transition shadow-2xs"
                    >
                      Inspect
                    </button>
                  </div>
                  <div className="font-semibold text-slate-800">
                    Quote {anom.quote_number} • {anom.customer}
                  </div>
                  <div className="text-[11px] text-slate-600 flex justify-between">
                    <span>Given: <strong>{anom.metric_given}</strong></span>
                    <span>Benchmark: <strong>{anom.benchmark}</strong></span>
                  </div>
                  <p className="text-[11px] text-rose-800 font-medium pt-0.5">
                    {anom.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 9. PENDING APPROVALS WIDGET */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Pending Approvals</h3>
              </div>
              <Link to="/approvals" className="text-xs font-semibold text-[#1565C0] hover:underline">
                View All ({approvals.filter(a => a.status === 'PENDING').length}) →
              </Link>
            </div>

            <div className="space-y-2">
              {approvals.filter(a => a.status === 'PENDING').slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/quotations/${app.quotation_id}`)}
                  className="p-2.5 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer text-xs space-y-1"
                >
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#1565C0]">{app.quotation_number}</span>
                    <span className="text-slate-900">${(app.value).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-700 text-[11px] flex justify-between">
                    <span>{app.customer_name}</span>
                    <span className="text-rose-600 font-bold">Risk: {app.risk_score}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-0.5 border-t border-slate-100">
                    <span className="truncate max-w-[180px]">{app.reason}</span>
                    <span className="font-bold text-amber-700">{app.stage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): 7. ACTIVE DEAL PIPELINE & 20. AUDIT LEDGER */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7. ACTIVE DEAL PIPELINE TABLE */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Active Deal Pipeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time quotation health, margin, and velocity</p>
              </div>
              <Link to="/quotations" className="text-xs font-bold text-[#1565C0] hover:underline">
                View All Quotes ({quotations.length}) →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Quotation #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Total Value</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Margin %</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.slice(0, 8).map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-bold text-[#1565C0]">
                        <Link to={`/quotations/${q.id}`} className="hover:underline">
                          {q.quotation_number}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{q.customer_name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${(q.total_amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.status === 'APPROVED' || q.status === 'WON'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'PENDING APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : q.status === 'NEGOTIATION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {q.gross_margin_pct}%
                      </td>
                      <td className="py-3 px-4">
                        {renderHealthScore(q.health_score || 85)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{q.last_activity || 'Recent'}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(`/quotations/${q.id}`)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-blue-50 hover:text-blue-700 rounded text-xs font-semibold transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 20. AUDIT LEDGER / IMMUTABLE ACTIVITY PANEL */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Governance & Sales Activity Trail</h3>
                <p className="text-xs text-slate-500">Immutable ledger of quotation events, discount checks, and approval escalations</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Live Sentinel</span>
            </div>

            <div className="divide-y divide-slate-100">
              {auditEvents.slice(0, 7).map((ev) => (
                <div key={ev.id} className="p-3.5 flex items-start justify-between text-xs hover:bg-slate-50/50 transition">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ev.action}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {ev.user}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{ev.detail}</p>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] shrink-0 pl-3">
                    {ev.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
