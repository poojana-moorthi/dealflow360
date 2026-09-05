import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export function ApprovalQueue() {
  const { approvals, resolveApproval, persona } = useSales();
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentRole = user?.role || persona?.role || 'SALES_REP';
  const isSalesRepresentative = currentRole === 'SALES_REP';

  const [activeTab, setActiveTab] = useState('All');
  const [toastMessage, setToastMessage] = useState('');

  // Tab filtering logic
  const filteredApprovals = useMemo(() => {
    return approvals.filter(a => {
      if (activeTab === 'My Pending') return a.status === 'PENDING' && (a.required_role === currentRole || currentRole === 'ADMIN');
      if (activeTab === 'High Risk') return a.risk_score >= 70;
      if (activeTab === 'Approved') return a.status === 'APPROVED';
      if (activeTab === 'Rejected') return a.status === 'REJECTED';
      return true; // 'All'
    });
  }, [approvals, activeTab, currentRole]);

  const pendingCount = approvals.filter(a => a.status === 'PENDING').length;
  const highRiskCount = approvals.filter(a => a.risk_score >= 70 && a.status === 'PENDING').length;
  const approvedCount = approvals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = approvals.filter(a => a.status === 'REJECTED').length;

  const canApproveItem = (app) => {
    if (app.status !== 'PENDING') return false;
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'SALES_MANAGER' && (app.required_role === 'SALES_MANAGER' || !app.required_role)) return true;
    if (currentRole === 'FINANCE' && app.required_role === 'FINANCE') return true;
    return false;
  };

  const handleApprove = (approvalId, quoteNum) => {
    resolveApproval(approvalId, 'APPROVE', `Approved by ${currentRole}`);
    setToastMessage(`Quotation ${quoteNum} approved successfully.`);
  };

  const handleReject = (approvalId, quoteNum) => {
    resolveApproval(approvalId, 'REJECT', `Rejected by ${currentRole}`);
    setToastMessage(`Quotation ${quoteNum} returned/rejected.`);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Badges matching Image 3 wireframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Governance requests requiring review based on discount violation, blended risk, and margin impact
          </p>
        </div>

        {/* 3 Status Metric Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
            {pendingCount} Pending
          </div>
          <div className="px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
            {rejectedCount} Returned
          </div>
          <div className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            {approvedCount} Approved
          </div>
        </div>
      </div>

      {/* Guidance Banner */}
      {isSalesRepresentative ? (
        <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Viewing queue as <strong>Sales Rep</strong>. Sales reps can monitor review stages, but cannot self-approve high-risk discounts. Switch persona to <strong>Sales Manager</strong> or <strong>Finance</strong> in the top bar to perform approvals.
          </span>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 text-blue-950 px-4 py-3 rounded-md text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#1565C0] shrink-0" />
            <span>
              Authorized Reviewer Active: <strong>{persona.role}</strong>. You have permissions to commit or return discount exceptions.
            </span>
          </div>
        </div>
      )}

      {/* 18. Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 text-xs">
        {['All', 'My Pending', 'High Risk', 'Approved', 'Rejected'].map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 font-bold rounded-t-md transition ${
              activeTab === tab
                ? 'bg-[#1565C0] text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
            {tab === 'High Risk' && highRiskCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                {highRiskCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 18. Approvals Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Quotation</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4 text-center">Discount</th>
              <th className="py-3 px-4 text-center">Margin</th>
              <th className="py-3 px-4 text-center">Blended Risk</th>
              <th className="py-3 px-4">Requested By</th>
              <th className="py-3 px-4">Status / Stage</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApprovals.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                  No approval records found for the selected tab.
                </td>
              </tr>
            ) : (
              filteredApprovals.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-[#1565C0]">
                    <Link to={`/approvals/${app.id}`} className="hover:underline flex items-center gap-1">
                      <span>{app.quotation_number}</span>
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{app.customer_name}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">${(app.value).toLocaleString()}</td>
                  <td className="py-3 px-4 text-center font-bold text-rose-600">{app.discount_pct}%</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">{app.margin_pct}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.risk_score >= 70
                        ? 'bg-rose-100 text-rose-800'
                        : app.risk_score >= 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {app.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{app.requested_by}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {app.stage || app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {app.status === 'PENDING' ? (
                      canApproveItem(app) ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(app.id, app.quotation_number)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded transition shadow-2xs cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(app.id, app.quotation_number)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded transition shadow-2xs cursor-pointer"
                          >
                            Reject
                          </button>
                          <Link
                            to={`/approvals/${app.id}`}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded transition"
                          >
                            Review
                          </Link>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Awaiting {app.required_role}
                          </span>
                          <Link
                            to={`/approvals/${app.id}`}
                            className="text-xs font-semibold text-[#1565C0] hover:underline"
                          >
                            Review
                          </Link>
                        </div>
                      )
                    ) : (
                      <Link
                        to={`/approvals/${app.id}`}
                        className="text-xs font-semibold text-[#1565C0] hover:underline"
                      >
                        Inspect
                      </Link>
                    )}
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

export default ApprovalQueue;
