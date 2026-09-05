import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { TrendingUp, AlertTriangle, CheckCircle, FileText, Percent, ShieldAlert } from 'lucide-react';

export function MetricsSummary({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Won Revenue',
      value: formatCurrency(metrics.totalRevenue),
      subtext: `${metrics.wonDeals} deals closed`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Active Pipeline',
      value: formatCurrency(metrics.pipelineValue),
      subtext: `${metrics.totalQuotations} total quotes`,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Avg Gross Margin',
      value: formatPercent(metrics.avgGrossMargin),
      subtext: metrics.avgGrossMargin >= 30 ? 'Healthy target reached' : 'Sub-benchmark review needed',
      icon: Percent,
      color: metrics.avgGrossMargin >= 30 ? 'text-emerald-600' : 'text-amber-600',
      bg: metrics.avgGrossMargin >= 30 ? 'bg-emerald-50' : 'bg-amber-50'
    },
    {
      title: 'Pending Approvals',
      value: metrics.pendingApprovals,
      subtext: 'Requires manager / finance review',
      icon: AlertTriangle,
      color: metrics.pendingApprovals > 0 ? 'text-amber-600' : 'text-slate-500',
      bg: metrics.pendingApprovals > 0 ? 'bg-amber-50' : 'bg-slate-50'
    },
    {
      title: 'At-Risk Deals',
      value: metrics.highRiskDeals,
      subtext: `${metrics.criticalDeals} critical governance score`,
      icon: ShieldAlert,
      color: metrics.highRiskDeals > 0 ? 'text-rose-600' : 'text-slate-500',
      bg: metrics.highRiskDeals > 0 ? 'bg-rose-50' : 'bg-slate-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{c.title}</span>
              <div className={`p-2 rounded-md ${c.bg}`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-slate-900">{c.value}</span>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DealHealthAlertCard({ healthData }) {
  if (!healthData) return null;
  const { counts, anomalies } = healthData;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio Deal Health</h3>
          <p className="text-xs text-slate-500">Autonomous risk & velocity diagnostics</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Live AI Scanner
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center py-2 mb-4 bg-slate-50 rounded-lg border border-slate-100">
        <div>
          <span className="block text-lg font-bold text-emerald-600">{counts?.healthy || 0}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">Healthy</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-amber-600">{counts?.watch || 0}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">Watch</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-orange-600">{counts?.at_risk || 0}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">At Risk</span>
        </div>
        <div>
          <span className="block text-lg font-bold text-rose-600">{counts?.critical || 0}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">Critical</span>
        </div>
      </div>

      {anomalies && anomalies.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Active Anomalies Detected
          </div>
          {anomalies.slice(0, 3).map((a, idx) => (
            <div key={idx} className="p-2.5 rounded-md bg-rose-50 border border-rose-100 flex items-start gap-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-900">{a.anomaly_type.replace('_', ' ')}</span>
                <p className="text-rose-700 text-[11px] mt-0.5">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StalledDealsTable({ quotations = [] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Quotations & Governance</h3>
          <p className="text-xs text-slate-500">Real-time risk scoring and routing state</p>
        </div>
        <a href="/quotations" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
          View all quotes →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-4">Quote #</th>
              <th className="py-2.5 px-4">Customer</th>
              <th className="py-2.5 px-4">Value</th>
              <th className="py-2.5 px-4">Margin %</th>
              <th className="py-2.5 px-4">Risk Score</th>
              <th className="py-2.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50 transition">
                <td className="py-2.5 px-4 font-semibold text-blue-600">
                  <a href={`/quotations/${q.id}`}>{q.quotation_number}</a>
                </td>
                <td className="py-2.5 px-4 text-slate-800">{q.customer_name}</td>
                <td className="py-2.5 px-4 font-medium text-slate-900">{formatCurrency(q.total_amount)}</td>
                <td className="py-2.5 px-4">
                  <span className={`font-semibold ${q.gross_margin_pct >= 25 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {formatPercent(q.gross_margin_pct)}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    q.risk_score >= 70 ? 'bg-rose-100 text-rose-800' : (q.risk_score >= 40 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800')
                  }`}>
                    {q.risk_score} - {q.risk_level}
                  </span>
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {q.status}
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

export default MetricsSummary;
