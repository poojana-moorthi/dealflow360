import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export function ApprovalStatus({ status }) {
  const configs = {
    APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
    REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle },
    PENDING: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: Clock },
    REVISION_REQUIRED: { label: 'Revision Required', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: AlertCircle }
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}

export function ApprovalAuditTrail({ audits = [] }) {
  if (!audits || audits.length === 0) {
    return <p className="text-xs text-slate-400 italic">No audit records logged yet.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {audits.map((item, idx) => (
          <li key={item.id || idx}>
            <div className="relative pb-8">
              {idx !== audits.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white text-blue-600 font-bold text-xs">
                    ✓
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      {item.action} <span className="font-normal text-slate-500">by</span> {item.user_name} ({item.user_role})
                    </p>
                    {item.reason && <p className="text-xs text-slate-600 mt-0.5">{item.reason}</p>}
                  </div>
                  <div className="text-right text-[11px] whitespace-nowrap text-slate-400 font-mono">
                    {formatDateTime(item.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ApprovalStatus;
