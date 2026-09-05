import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import approvalService from '../../services/approvalService';
import { useSales } from '../../context/SalesContext';
import { Loader, Toast } from '../../components/common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function ApprovalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { approvals, resolveApproval, persona } = useSales();
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadDetail = async () => {
    try {
      const res = await approvalService.getById(id || '1');
      if (res.success && res.data) {
        setData(res.data);
      } else {
        // Fallback from mock state
        const app = approvals.find(a => a.id === parseInt(id || '1', 10)) || approvals[0];
        setData({
          approval: {
            ...app,
            quotation_number: app.quotation_number || 'Q-104',
            customer_name: app.customer_name || 'Acme Corp',
            customer_tier: 'Gold',
            risk_score: app.risk_score || 82,
            assigned_to_role: app.required_role || 'Sales Manager'
          },
          quotation: {
            id: app.quotation_id || 1,
            quotation_number: app.quotation_number || 'Q-104',
            customer_name: app.customer_name || 'Acme Corp',
            total_amount: app.value || 92000,
            status: app.status || 'PENDING'
          }
        });
      }
    } catch (err) {
      console.error(err);
      const app = approvals.find(a => a.id === parseInt(id || '1', 10)) || approvals[0];
      setData({
        approval: {
          ...app,
          quotation_number: app.quotation_number || 'Q-104',
          customer_name: app.customer_name || 'Acme Corp',
          customer_tier: 'Gold',
          risk_score: app.risk_score || 82,
          assigned_to_role: app.required_role || 'Sales Manager'
        },
        quotation: {
          id: app.quotation_id || 1,
          quotation_number: app.quotation_number || 'Q-104',
          total_amount: app.value || 92000,
          status: app.status || 'PENDING'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      if (resolveApproval) {
        resolveApproval(id || 1, actionType === 'APPROVE' ? 'APPROVE' : 'REJECT', notes);
      }
      try {
        if (actionType === 'APPROVE') {
          await approvalService.approve(id || 1, notes || 'Approved within manager discretionary threshold');
        } else if (actionType === 'REJECT') {
          await approvalService.reject(id || 1, notes || 'Rejected due to severe gross margin erosion');
        } else if (actionType === 'REVISION') {
          await approvalService.revision(id || 1, notes || 'Reduce discount on service lines to under 12%');
        }
      } catch (err) {
        // Fallback for mock mode
      }
      setToastMessage(`Governance action ${actionType} recorded successfully.`);
      await loadDetail();
    } catch (err) {
      setToastMessage(err.message || 'Action executed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader text="Loading governance review dossier..." />;

  const { approval = {}, quotation = {} } = data || {};
  const isSalesRepresentative = persona.role === 'SALES_REP';

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <div className="flex items-center justify-between">
        <Link to="/approvals" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Approval Queue</span>
        </Link>
      </div>

      {/* Header & Subtitle from Image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Approval Detail: {approval.quotation_number || 'Q-104'} ({approval.customer_name || 'Acme Corp'})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Opened by clicking a row on the Approvals list
          </p>
        </div>

        {/* Badges from Image 4 */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#DC2626] text-white shadow-xs">
            Blended Risk: {approval.risk_score >= 70 ? 'HIGH' : 'MEDIUM'} ({approval.risk_score || 82}/100)
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#1565C0] text-white shadow-xs">
            Customer Tier: {approval.customer_tier || 'Gold'}
          </span>
        </div>
      </div>

      {isSalesRepresentative && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-lg text-xs text-amber-900 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Acting as <strong>Sales Rep</strong>. Sales reps cannot self-approve high-risk discounts. Switch persona in the top nav to <strong>Sales Manager</strong> or <strong>Finance</strong> to approve or reject this quotation.
          </span>
        </div>
      )}

      {/* Section: Why This Quote Was Flagged from Image 4 */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[#1565C0]">Why This Quote Was Flagged</h3>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Line</th>
                <th className="py-2.5 px-4">Discount Given</th>
                <th className="py-2.5 px-4">Limit Allowed</th>
                <th className="py-2.5 px-4">Over By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900">Laptop Pro 14 (Hardware)</td>
                <td className="py-2.5 px-4 text-slate-700">22%</td>
                <td className="py-2.5 px-4 text-slate-700">15%</td>
                <td className="py-2.5 px-4 font-bold text-red-600">7 pt OVER</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900">Docking Station (Hardware)</td>
                <td className="py-2.5 px-4 text-slate-700">15%</td>
                <td className="py-2.5 px-4 text-slate-700">15%</td>
                <td className="py-2.5 px-4 text-slate-600 font-medium">0 pt - OK</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-2.5 px-4 font-bold text-slate-900">Setup Service (Services)</td>
                <td className="py-2.5 px-4 text-slate-700">12%</td>
                <td className="py-2.5 px-4 text-slate-700">10%</td>
                <td className="py-2.5 px-4 font-bold text-red-600">2 pt OVER</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Yellow Guidance Alert from Image 4 */}
        <div className="bg-[#FEF9C3] border border-[#FDE047] rounded-md p-3 text-xs text-amber-950 font-medium shadow-xs">
          Worst single line (7pt over) plus overall pattern across the order sets the blended score (82/100). One bad line is enough to require approval.
        </div>
      </div>

      {/* Horizontal Workflow Stepper from Image 4 */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs">
          {/* 1. Submitted */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1.5">
              ✓
            </div>
            <span className="font-bold text-slate-900">Submitted</span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-800 mx-2 -mt-5"></div>

          {/* 2. Sales Manager */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-xs shadow-xs mb-1.5 ring-2 ring-blue-200">
              ●
            </div>
            <span className="font-bold text-slate-900">Sales Manager</span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-300 mx-2 -mt-5"></div>

          {/* 3. Finance */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs mb-1.5">
              ○
            </div>
            <span className="font-medium text-slate-500">Finance</span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-300 mx-2 -mt-5"></div>

          {/* 4. Confirmed */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shadow-xs mb-1.5">
              ○
            </div>
            <span className="font-medium text-slate-500">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Decision Action Buttons from Image 4 */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => handleAction('APPROVE')}
          disabled={actionLoading || isSalesRepresentative}
          className={`px-5 py-2 text-white text-xs font-bold rounded-md shadow-xs transition flex items-center gap-1.5 ${
            isSalesRepresentative ? 'bg-slate-300 cursor-not-allowed text-slate-500' : 'bg-[#16A34A] hover:bg-green-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approve</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('REVISION')}
          disabled={actionLoading || isSalesRepresentative}
          className={`px-4 py-2 text-white text-xs font-bold rounded-md shadow-xs transition ${
            isSalesRepresentative ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-[#F59E0B] hover:bg-amber-600'
          }`}
        >
          Return for Revision
        </button>

        <button
          type="button"
          onClick={() => handleAction('REJECT')}
          disabled={actionLoading || isSalesRepresentative}
          className={`px-4 py-2 text-white text-xs font-bold rounded-md shadow-xs transition ${
            isSalesRepresentative ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-[#DC2626] hover:bg-red-700'
          }`}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default ApprovalDetail;
