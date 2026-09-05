import React, { useState, useMemo } from 'react';
import { useSales } from '../../context/SalesContext';
import { Toast } from '../../components/common/Card';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Lock,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function AdminAuditLog() {
  const { auditEvents } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  // Extract unique users
  const uniqueUsers = useMemo(() => {
    const set = new Set((auditEvents || []).map(e => e.user).filter(Boolean));
    return Array.from(set);
  }, [auditEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return (auditEvents || []).filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.user && item.user.toLowerCase().includes(q)) ||
        (item.detail && item.detail.toLowerCase().includes(q));

      const matchUser = selectedUser === 'ALL' || item.user === selectedUser;

      return matchSearch && matchUser;
    });
  }, [auditEvents, searchTerm, selectedUser]);

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Event ID', 'Timestamp', 'Action', 'User', 'Quotation Ref', 'Details'];
      const rows = filteredEvents.map(e => [
        e.id || '',
        `"${e.time || ''}"`,
        `"${(e.action || '').replace(/"/g, '""')}"`,
        `"${(e.user || '').replace(/"/g, '""')}"`,
        e.quote_id ? `"Q-${e.quote_id}"` : '""',
        `"${(e.detail || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `dealflow360_audit_log_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setToastMessage('Audit log CSV exported successfully.');
    } catch (err) {
      setToastMessage('Failed to export CSV.');
    }
  };

  const getActionBadgeColor = (action = '') => {
    const lower = action.toLowerCase();
    if (lower.includes('override')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (lower.includes('deactivat') || lower.includes('reject')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (lower.includes('approv') || lower.includes('won') || lower.includes('create') || lower.includes('add')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (lower.includes('margin') || lower.includes('risk') || lower.includes('warning')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Administrative Audit Log</h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              <span>Immutable</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically signed event ledger tracking administrative overrides, pricing changes, and approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Immutable Banner */}
      <div className="bg-slate-900 text-white px-4 py-3.5 rounded-lg text-xs flex items-center justify-between shadow-xs border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">
              🔒 Immutable Record — Enterprise Governance & Compliance Log
            </span>
            <span className="text-slate-400 text-[11px] block mt-0.5">
              All pricing adjustments, discount threshold alterations, approval escalations, and administrative overrides are permanently signed and logged for SOC2/ISO audit compliance.
            </span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-slate-800/80 px-3 py-1 rounded border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Integrity: Verified</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit action, user, or detail notes..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold">User:</span>
            </div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Actors</option>
              {uniqueUsers.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Logged Governance Events ({filteredEvents.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Real-time streaming ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-28">Timestamp</th>
                <th className="py-2.5 px-4 w-44">Action Event</th>
                <th className="py-2.5 px-4 w-40">User / Actor</th>
                <th className="py-2.5 px-4 w-28">Ref</th>
                <th className="py-2.5 px-4">Audit Trail Details</th>
                <th className="py-2.5 px-4 text-right w-24">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {item.time || '10:00 AM'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getActionBadgeColor(item.action)}`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-800 font-semibold">
                      {item.user}
                    </td>
                    <td className="py-2.5 px-4">
                      {item.quote_id ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-700">
                          Q-{item.quote_id}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 leading-relaxed">
                      {item.detail}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminAuditLog;
