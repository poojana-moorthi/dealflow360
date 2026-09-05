import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export function BillingScheduleTable({ schedules = [] }) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
        No subscription schedules generated yet. Confirm a quotation with recurring items to populate schedules.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
          <tr>
            <th className="py-2.5 px-4">Cycle Date</th>
            <th className="py-2.5 px-4">Due Date</th>
            <th className="py-2.5 px-4">Subscription Plan</th>
            <th className="py-2.5 px-4">Billing Amount</th>
            <th className="py-2.5 px-4">Schedule Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {schedules.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50">
              <td className="py-2.5 px-4 font-medium text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{formatDate(s.schedule_date)}</span>
              </td>
              <td className="py-2.5 px-4 text-slate-600">{formatDate(s.due_date)}</td>
              <td className="py-2.5 px-4 text-slate-700">{s.plan_name || 'Cloud Support'} ({s.frequency || 'MONTHLY'})</td>
              <td className="py-2.5 px-4 font-bold text-slate-900">{formatCurrency(s.amount)}</td>
              <td className="py-2.5 px-4">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  s.status === 'PAID' ? 'bg-green-100 text-green-800' : (s.status === 'INVOICED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700')
                }`}>
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProrationPreview({ prorationResult }) {
  if (!prorationResult) return null;

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
      <div className="flex justify-between font-semibold text-slate-800 border-b border-slate-200 pb-2">
        <span>Prorated Mid-Cycle Adjustment</span>
        <span className="text-blue-700">{prorationResult.actionType}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
        <div>Cycle Remaining: <strong>{prorationResult.remainingDays} / {prorationResult.totalDaysInCycle} days</strong></div>
        <div>Unused Plan Credit: <strong className="text-slate-900">{formatCurrency(prorationResult.unusedCredit)}</strong></div>
        <div>New Plan Charge: <strong className="text-slate-900">{formatCurrency(prorationResult.newCharge)}</strong></div>
        <div>Net Adjustment: <strong className="text-emerald-700 text-xs">{formatCurrency(prorationResult.netAdjustment)}</strong></div>
      </div>
    </div>
  );
}

export default BillingScheduleTable;
