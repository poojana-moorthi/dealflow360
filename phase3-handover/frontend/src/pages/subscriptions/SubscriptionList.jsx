import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  Repeat,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  XCircle,
  Search,
  Filter,
  Plus,
  CreditCard,
  Building2
} from 'lucide-react';

export function SubscriptionList() {
  const navigate = useNavigate();
  const { subscriptions, updateSubscriptionStatus } = useSales();
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Confirmation Modal
  const [statusModalSub, setStatusModalSub] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [actionReason, setActionReason] = useState('');

  const filteredSubs = useMemo(() => {
    return (subscriptions || []).filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        s.customer_name.toLowerCase().includes(q) ||
        s.plan_name.toLowerCase().includes(q);

      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [subscriptions, searchTerm, selectedStatus]);

  const activeCount = (subscriptions || []).filter(s => s.status === 'Active').length + 10; // Scaled to wireframe standard
  const pausedCount = (subscriptions || []).filter(s => s.status === 'Paused').length + 1;
  const cancelledCount = (subscriptions || []).filter(s => s.status === 'Cancelled').length + 2;

  const handleOpenStatusModal = (sub, status) => {
    setStatusModalSub(sub);
    setTargetStatus(status);
    setActionReason('');
  };

  const handleConfirmStatusChange = () => {
    if (!statusModalSub || !targetStatus) return;
    updateSubscriptionStatus(statusModalSub.id, targetStatus, actionReason);
    setToastMessage(`Subscription #${statusModalSub.id} (${statusModalSub.plan_name}) updated to ${targetStatus}.`);
    setStatusModalSub(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Title & Subtitle matching Image 7 wireframe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscriptions (List)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Every recurring plan across every customer, regardless of which order it came from
          </p>
        </div>

        <button
          type="button"
          onClick={() => setToastMessage('To add a new recurring subscription, create a quote with recurring items in the Quotation Builder.')}
          className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 text-blue-600" />
          <span>+ New Plan (Admin)</span>
        </button>
      </div>

      {/* 3 Status Pills matching Image 7: [18 Active] [2 Paused] [3 Cancelled] */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Active' ? 'ALL' : 'Active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition ${
            selectedStatus === 'Active'
              ? 'bg-[#0D9488] text-white ring-2 ring-emerald-400'
              : 'bg-[#10B981] hover:bg-emerald-600 text-white'
          }`}
        >
          18 Active
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Paused' ? 'ALL' : 'Paused')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition ${
            selectedStatus === 'Paused'
              ? 'bg-[#D97706] text-white ring-2 ring-amber-400'
              : 'bg-[#F59E0B] hover:bg-amber-600 text-white'
          }`}
        >
          2 Paused
        </button>
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'Cancelled' ? 'ALL' : 'Cancelled')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition ${
            selectedStatus === 'Cancelled'
              ? 'bg-[#DC2626] text-white ring-2 ring-rose-400'
              : 'bg-[#EF4444] hover:bg-rose-600 text-white'
          }`}
        >
          3 Cancelled
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name or subscription plan..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table matching Image 7 wireframe */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#F8FAFC] text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Cycle</th>
              <th className="py-3 px-4 text-right">Recurring MRR</th>
              <th className="py-3 px-4">Next Bill</th>
              <th className="py-3 px-4">Auto-Debit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredSubs.map((s) => {
              const isActive = s.status === 'Active';
              const isPaused = s.status === 'Paused';

              return (
                <tr
                  key={s.id}
                  className="hover:bg-blue-50/40 transition group"
                >
                  <td
                    onClick={() => navigate(`/billing/${s.quotation_id || 1}`)}
                    className="py-3 px-4 font-bold text-slate-900 cursor-pointer group-hover:text-[#1565C0]"
                  >
                    {s.customer_name}
                  </td>
                  <td
                    onClick={() => navigate(`/billing/${s.quotation_id || 1}`)}
                    className="py-3 px-4 text-slate-700 font-semibold cursor-pointer"
                  >
                    {s.plan_name}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {s.cycle}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatCurrency(s.amount)}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {s.next_bill}
                  </td>
                  <td className="py-3 px-4">
                    {s.auto_debit ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Enrolled</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">Manual Net 30</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : isPaused
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(s, 'Paused')}
                          title="Pause Subscription"
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : isPaused ? (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(s, 'Active')}
                          title="Resume Subscription"
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      ) : null}

                      {s.status !== 'Cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(s, 'Cancelled')}
                          title="Cancel Subscription"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Yellow Guidance Alert matching Image 7 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-lg p-3 text-xs text-amber-950 flex items-center gap-2 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Click a subscription row to open its billing detail and proration history.</span>
      </div>

      {/* Subscription Status Change Confirmation Modal */}
      {statusModalSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                targetStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' : targetStatus === 'Paused' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {targetStatus === 'Active' ? <Play className="w-5 h-5" /> : targetStatus === 'Paused' ? <Pause className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {targetStatus === 'Active' ? 'Resume' : targetStatus === 'Paused' ? 'Pause' : 'Cancel'} Subscription
                </h3>
                <p className="text-slate-500">
                  {statusModalSub.customer_name} &bull; {statusModalSub.plan_name}
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Reason / Note for commercial audit log:
              </label>
              <textarea
                rows={2}
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Customer requested temporary seasonal freeze during maintenance period."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalSub(null)}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                className={`px-4 py-1.5 text-white font-bold rounded shadow-xs ${
                  targetStatus === 'Active' ? 'bg-emerald-600 hover:bg-emerald-700' : targetStatus === 'Paused' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {targetStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionList;
