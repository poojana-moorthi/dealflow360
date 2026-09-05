import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { getCustomerEmail, getQuotationCustody } from '../../utils/quotationCustody';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function QuotationList() {
  const { quotations } = useSales();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('BOARD'); // 'BOARD' | 'TABLE'
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('Recently Updated');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stageFilter, riskFilter, sortBy]);

  // Filtered & Sorted Quotations
  const filteredQuotations = useMemo(() => {
    let list = (quotations || []).filter(q => {
      const customerEmail = getCustomerEmail(q.customer_id, q.customer_name);
      const matchSearch = q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (stageFilter !== 'ALL') {
        if (stageFilter === 'DRAFT' && q.status !== 'DRAFT') return false;
        if (stageFilter === 'PENDING' && q.status !== 'PENDING APPROVAL' && q.status !== 'PENDING_APPROVAL') return false;
        if (stageFilter === 'APPROVED' && q.status !== 'APPROVED') return false;
        if (stageFilter === 'NEGOTIATION' && q.status !== 'NEGOTIATION') return false;
        if (stageFilter === 'CONFIRMED' && q.status !== 'CONFIRMED' && q.status !== 'WON') return false;
      }

      if (riskFilter !== 'ALL') {
        if (riskFilter === 'HIGH' && q.risk_score < 70) return false;
        if (riskFilter === 'MEDIUM' && (q.risk_score < 40 || q.risk_score >= 70)) return false;
        if (riskFilter === 'LOW' && q.risk_score >= 40) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'Highest Value') return (b.total_amount || 0) - (a.total_amount || 0);
      if (sortBy === 'Lowest Margin') return (a.gross_margin_pct || 0) - (b.gross_margin_pct || 0);
      if (sortBy === 'Highest Risk') return (b.risk_score || 0) - (a.risk_score || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    return list;
  }, [quotations, searchTerm, stageFilter, riskFilter, sortBy]);

  const totalPages = Math.ceil(filteredQuotations.length / pageSize) || 1;
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotations.slice(start, start + pageSize);
  }, [filteredQuotations, currentPage, pageSize]);

  // 5 Pipeline Stage Columns defined in Wireframe (Image 1)
  const stages = [
    { key: 'DRAFT', title: 'Draft', filter: (q) => q.status === 'DRAFT' },
    { key: 'PENDING', title: 'Pending Approval', filter: (q) => q.status === 'PENDING APPROVAL' || q.status === 'PENDING_APPROVAL' },
    { key: 'APPROVED', title: 'Approved', filter: (q) => q.status === 'APPROVED' },
    { key: 'NEGOTIATION', title: 'Negotiation', filter: (q) => q.status === 'NEGOTIATION' },
    { key: 'CONFIRMED', title: 'Confirmed', filter: (q) => q.status === 'CONFIRMED' || q.status === 'WON' }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1565C0] font-extrabold text-xs">
              {quotations?.length || 0} Deals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every quotation across the sales pipeline, one card or row per deal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/quotations/new"
            className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md shadow-xs transition inline-flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Quotation</span>
          </Link>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'BOARD' ? 'TABLE' : 'BOARD')}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {viewMode === 'BOARD' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            <span>{viewMode === 'BOARD' ? 'Switch to Table View' : 'Switch to Board View'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search quotation # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white font-medium text-slate-800 text-xs cursor-pointer"
            >
              <option value="ALL">All Stages ({filteredQuotations.length})</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="CONFIRMED">Confirmed / Won</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white font-medium text-slate-800 text-xs cursor-pointer"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk (70+)</option>
              <option value="MEDIUM">Medium Risk (40-69)</option>
              <option value="LOW">Low Risk (&lt;40)</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 border border-slate-300 rounded bg-white font-medium text-slate-800 text-xs cursor-pointer"
            >
              <option value="Recently Updated">Recently Updated</option>
              <option value="Highest Value">Highest Value</option>
              <option value="Lowest Margin">Lowest Margin</option>
              <option value="Highest Risk">Highest Risk</option>
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'BOARD' ? (
        /* 5-Column Pipeline Board View (Image 1) */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const items = filteredQuotations.filter(stage.filter);
            return (
              <div
                key={stage.key}
                className="bg-[#FAFAFA] border border-slate-300 rounded-xl p-3.5 flex flex-col shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {stage.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {items.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 max-h-[640px] overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center text-xs text-slate-400">
                      No quotes in {stage.title.toLowerCase()}
                    </div>
                  ) : (
                    items.map((q) => {
                      const customerEmail = getCustomerEmail(q.customer_id, q.customer_name);
                      const custody = getQuotationCustody(q);
                      return (
                        <Link
                          key={q.id}
                          to={`/quotations/${q.id}`}
                          className="block bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-3.5 shadow-xs transition hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-extrabold text-[#1565C0]">{q.quotation_number}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                q.risk_score >= 70
                                  ? 'bg-rose-100 text-rose-800'
                                  : q.risk_score >= 40
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              Risk {q.risk_score}
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 truncate mb-0.5">
                            {q.customer_name}
                          </div>

                          {/* Customer Email ID */}
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono mb-2 truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{customerEmail}</span>
                          </div>

                          <div className="text-sm font-extrabold text-slate-900 mb-2 font-mono">
                            ${(q.total_amount).toLocaleString()}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                            <span>Margin: <strong className="text-emerald-700">{q.gross_margin_pct}%</strong></span>
                            <span>Disc: <strong className="text-slate-700">{q.discount_pct}%</strong></span>
                          </div>

                          {/* Approval Custody & Reviewer Hands */}
                          <div className="mt-2 text-[10px] font-bold py-1 px-1.5 rounded flex items-center gap-1 border border-slate-200 bg-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1565C0] shrink-0"></span>
                            <span className="text-slate-700 truncate">{custody.label}</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Quotation #</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Customer Email ID</th>
                <th className="py-3 px-3">Approval & Custody</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3 text-center">Discount %</th>
                <th className="py-3 px-3 text-center">Margin %</th>
                <th className="py-3 px-3 text-center">Risk</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedQuotations.map((q) => {
                const customerEmail = getCustomerEmail(q.customer_id, q.customer_name);
                const custody = getQuotationCustody(q);
                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-bold text-[#1565C0]">
                      <Link to={`/quotations/${q.id}`} className="hover:underline">
                        {q.quotation_number}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{q.customer_name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-blue-700">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-500" />
                        {customerEmail}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${custody.badgeClass}`}>
                        {custody.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">${(q.total_amount).toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-700">{q.discount_pct}%</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-700">{q.gross_margin_pct}%</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.risk_score >= 70
                          ? 'bg-rose-100 text-rose-800'
                          : q.risk_score >= 40
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {q.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        to={`/quotations/${q.id}`}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded text-xs font-semibold transition"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Showing <strong className="text-slate-900">{filteredQuotations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredQuotations.length)}</strong> of{' '}
              <strong className="text-slate-900">{filteredQuotations.length}</strong> quotations
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="px-2 text-slate-600 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuotationList;
