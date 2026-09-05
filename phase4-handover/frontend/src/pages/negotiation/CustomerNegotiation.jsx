import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import portalService from '../../services/portalService';
import api from '../../services/api';
import { NegotiationChat } from '../../components/portal/NegotiationChat';
import { Loader } from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';
import { ArrowLeft, MessageSquare, AlertTriangle } from 'lucide-react';

export function CustomerNegotiation() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const qRes = await quotationService.getById(id || '1');
        if (qRes.success) setQuotation(qRes.data);

        // Fetch negotiations
        const nRes = await api.get(`/approvals/quotation/${id || '1'}/audits`);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) return <Loader text="Loading negotiation telemetry..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/quotations/${id || '1'}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quotation</span>
        </Link>
        <span className="text-xs text-slate-500">
          Negotiation Governance: <strong className="text-amber-700">Autonomous Re-Approval Triggered on Concessions</strong>
        </span>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Commercial Negotiation: {quotation?.quotation_number}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer: <strong>{quotation?.customer_name}</strong> • Current Value: <strong>{formatCurrency(quotation?.total_amount)}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Status: {quotation?.status}</span>
          </span>
        </div>
      </div>

      <NegotiationChat
        negotiations={quotation?.negotiations || []}
        currentQuotationTotal={quotation?.total_amount}
      />
    </div>
  );
}

export default CustomerNegotiation;
