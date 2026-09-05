import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import subscriptionService from '../../services/subscriptionService';
import { Loader } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Repeat, Calendar, CheckCircle, Clock } from 'lucide-react';

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSubs() {
      try {
        const res = await subscriptionService.getAll();
        if (res.success) setSubscriptions(res.data);
      } finally {
        setLoading(false);
      }
    }
    loadSubs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title & Subtitle from Image 7 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscriptions (List)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every recurring plan across every customer, regardless of which order it came from
        </p>
      </div>

      {/* 3 Status Pills from Image 7: [18 Active] [2 Paused] [3 Cancelled] */}
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold shadow-xs">
          18 Active
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#F59E0B] text-white text-xs font-bold shadow-xs">
          2 Paused
        </div>
        <div className="px-4 py-2 rounded-xl bg-[#EF4444] text-white text-xs font-bold shadow-xs">
          3 Cancelled
        </div>
      </div>

      {loading ? (
        <Loader text="Loading subscription contracts..." />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Next Bill</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr
                  onClick={() => window.location.href = '/billing/1'}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">Acme Corp</td>
                  <td className="py-3 px-4 text-slate-700">Care Plan 2yr</td>
                  <td className="py-3 px-4 text-slate-700">Monthly</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">Sep 15</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">Active</td>
                </tr>
                <tr
                  onClick={() => window.location.href = '/billing/1'}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">Beta Industries</td>
                  <td className="py-3 px-4 text-slate-700">Support SLA</td>
                  <td className="py-3 px-4 text-slate-700">Quarterly</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">Nov 1</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">Active</td>
                </tr>
                <tr
                  onClick={() => window.location.href = '/billing/1'}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900">Delta LLC</td>
                  <td className="py-3 px-4 text-slate-700">Care Plan 1yr</td>
                  <td className="py-3 px-4 text-slate-700">Monthly</td>
                  <td className="py-3 px-4 text-slate-400 font-medium">—</td>
                  <td className="py-3 px-4 font-bold text-amber-600">Paused</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Yellow Guidance Alert from Image 7 */}
          <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-xl p-3.5 text-xs text-amber-950 font-medium">
            Click a subscription row to open its billing detail and proration history.
          </div>

          {/* Bottom Action Button from Image 7: [+ New Plan (Admin)] */}
          <div className="pt-2">
            <Link
              to="/admin/products"
              className="inline-block px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl shadow-2xs transition"
            >
              + New Plan (Admin)
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionList;
