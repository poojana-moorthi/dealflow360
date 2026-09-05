import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  Plus,
  Search,
  Filter,
  Package,
  Layers,
  Tag,
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  TrendingDown,
  Check
} from 'lucide-react';

export function ProductManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';

  const { products, deactivateProduct, saveProduct, discountRules } = useSales();
  const [toastMessage, setToastMessage] = useState('');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState(initialFilter === 'attention' ? 'ALL' : 'ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState(initialFilter === 'attention' ? 'LOW' : 'ALL');
  const [selectedMarginFilter, setSelectedMarginFilter] = useState(initialFilter === 'low-margin' ? 'LOW' : 'ALL');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Deactivation Modal State
  const [deactivateModalProduct, setDeactivateModalProduct] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Manage Price Fields Modal State
  const [showPriceFieldsModal, setShowPriceFieldsModal] = useState(false);

  const minFloor = discountRules?.margin_floor?.minimum || 25;
  const targetMargin = discountRules?.margin_floor?.target || 30;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchLower) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower)) ||
        (p.category && p.category.toLowerCase().includes(searchLower));

      // Category
      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      // Type
      const matchType = selectedType === 'ALL' || p.billing_type === selectedType;

      // Status
      const matchStatus = selectedStatus === 'ALL' || (p.status || 'Active') === selectedStatus;

      // Stock
      const stockVal = p.stock !== undefined ? p.stock : 50;
      let matchStock = true;
      if (selectedStockFilter === 'LOW') matchStock = stockVal < 20;
      if (selectedStockFilter === 'NORMAL') matchStock = stockVal >= 20;

      // Margin
      const price = p.unit_price || 0;
      const cost = p.unit_cost || (price * 0.7);
      const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
      let matchMargin = true;
      if (selectedMarginFilter === 'LOW') matchMargin = margin < minFloor;
      if (selectedMarginFilter === 'HEALTHY') matchMargin = margin >= targetMargin;

      return matchSearch && matchCategory && matchType && matchStatus && matchStock && matchMargin;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'margin') {
        const pA = a.unit_price || 0;
        const cA = a.unit_cost || (pA * 0.7);
        valA = pA > 0 ? ((pA - cA) / pA) * 100 : 0;

        const pB = b.unit_price || 0;
        const cB = b.unit_cost || (pB * 0.7);
        valB = pB > 0 ? ((pB - cB) / pB) * 100 : 0;
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedStatus,
    selectedStockFilter,
    selectedMarginFilter,
    sortField,
    sortDirection,
    minFloor,
    targetMargin
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleConfirmDeactivate = () => {
    if (!deactivateModalProduct) return;
    deactivateProduct(deactivateModalProduct.id, deactivationReason);
    setToastMessage(`Product ${deactivateModalProduct.name} has been marked Inactive.`);
    setDeactivateModalProduct(null);
    setDeactivationReason('');
  };

  const handleReactivate = (product) => {
    saveProduct({
      ...product,
      status: 'Active'
    });
    setToastMessage(`Product ${product.name} reactivated.`);
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header & Top Actions matching Image 13 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every product, variant and price list in one place.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="px-3.5 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Product</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPriceFieldsModal(true)}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Manage Price fields</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Metrics Cards matching Image 13 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Products</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">128</div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">128 active, 6 archived</p>
        </div>

        {/* Card 2: Pricelists */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pricelists</span>
            <Tag className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-700">3</div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">3 tiers, 2 Currencies</p>
        </div>

        {/* Card 3: Variants */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Variants</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">340</div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">340 SKUs across all products</p>
        </div>
      </div>

      {/* Info Banner (Yellow) matching Image 13 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-2.5 rounded-md text-xs flex items-center gap-2 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>Click a product row to open general info, variants and tier/currency price lists.</span>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product name, SKU, or category..."
              className="w-full pl-9 pr-4 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Categories</option>
              <option value="Hardware">Hardware</option>
              <option value="Services">Services</option>
              <option value="Subscription">Subscription</option>
              <option value="Accessories">Accessories</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="ONE_TIME">One-time</option>
              <option value="RECURRING">Recurring</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Margin Filter */}
            <select
              value={selectedMarginFilter}
              onChange={(e) => setSelectedMarginFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white font-medium text-slate-700"
            >
              <option value="ALL">All Margins</option>
              <option value="HEALTHY">Healthy (&gt;= 30%)</option>
              <option value="LOW">Low Margin (&lt; 25%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table matching Specifications */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleSort('sku')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Product name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Type</th>
                <th
                  onClick={() => handleSort('unit_price')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Base Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('unit_cost')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Std Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('margin')}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stock')}
                  className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/70"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Available Stock</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-8 text-center text-slate-400 font-medium">
                    No products found matching the specified filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const price = p.unit_price || 0;
                  const cost = p.unit_cost || Math.round(price * 0.7);
                  const marginPct = price > 0 ? Math.round(((price - cost) / price) * 1000) / 10 : 0;
                  const isLowStock = (p.stock || 0) < 20;
                  const isInactive = p.status === 'Inactive';

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/40 transition ${isInactive ? 'opacity-60 bg-slate-50/40' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {p.sku || `SKU-${p.id}`}
                      </td>
                      <td
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                        className="py-3 px-4 font-bold text-[#1565C0] hover:underline cursor-pointer"
                      >
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.category}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.billing_type === 'RECURRING' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            Recurring ({p.frequency || 'Monthly'})
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">One-time</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatCurrency(price)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(cost)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            marginPct >= targetMargin
                              ? 'bg-emerald-100 text-emerald-800'
                              : marginPct >= minFloor
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800 font-black'
                          }`}
                        >
                          {marginPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isLowStock
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'text-slate-700 font-semibold'
                          }`}
                        >
                          {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                          <span>{p.stock !== undefined ? p.stock : 50} units</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isInactive
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/products/${p.id}`)}
                            title="Edit Product"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isInactive ? (
                            <button
                              type="button"
                              onClick={() => handleReactivate(p)}
                              title="Reactivate Product"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition text-[11px] font-bold"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeactivateModalProduct(p)}
                              title="Deactivate Product"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deactivation Confirmation Modal */}
      {deactivateModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Deactivate Product: {deactivateModalProduct.name}
                </h3>
                <p className="text-xs text-slate-500">
                  SKU: {deactivateModalProduct.sku} | Category: {deactivateModalProduct.category}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deactivating this product will remove it from active quotation lookups while preserving historical quotations and contract records.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for deactivation *
              </label>
              <input
                type="text"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="e.g. Deprecated hardware model, supplier end-of-life"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setDeactivateModalProduct(null);
                  setDeactivationReason('');
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded shadow-xs"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Price Fields Modal */}
      {showPriceFieldsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Custom Price Fields Configuration</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPriceFieldsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Commercial Price Fields Active:</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li><strong>Base Price (MSRP):</strong> Catalog reference price.</li>
                  <li><strong>Standard Unit Cost:</strong> COGS floor for live margin calculations.</li>
                  <li><strong>Tiered Multiplier:</strong> Automatic discount discount applied by customer tier.</li>
                  <li><strong>Commercial Tax:</strong> Default 15% rate applied to net balance.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowPriceFieldsModal(false);
                  setToastMessage('Custom price fields configuration updated.');
                }}
                className="px-4 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded"
              >
                Save Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
