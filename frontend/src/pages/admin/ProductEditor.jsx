import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  ArrowLeft,
  AlertCircle,
  Save,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Building2,
  Plus,
  Trash2,
  Tag
} from 'lucide-react';

export function ProductEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';

  const { products, saveProduct, discountRules } = useSales();
  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    price: 1200,
    cost: 840,
    unit: 'Each',
    tax_pct: 15,
    is_subscription: false,
    recurring_cycle: 'Monthly',
    description: '',
    stock: 50,
    warehouses: [
      { name: 'Main Distribution Center (Austin)', stock: 30 },
      { name: 'East Regional Depot (Atlanta)', stock: 20 }
    ],
    variantsList: [
      { attribute: 'Color', values: 'Blue, Black', extra_price: 0 },
      { attribute: 'RAM', values: '16GB, 32GB', extra_price: 150 },
      { attribute: 'Storage', values: '512GB, 1TB SSD', extra_price: 120 }
    ]
  });

  useEffect(() => {
    if (!isNew) {
      const prod = products.find(p => p.id === parseInt(id, 10));
      if (prod) {
        setFormData({
          name: prod.name || '',
          sku: prod.sku || '',
          category: prod.category || 'Hardware',
          price: prod.unit_price || 1200,
          cost: prod.unit_cost || (prod.unit_price ? Math.round(prod.unit_price * 0.7) : 840),
          unit: prod.unit || 'Each',
          tax_pct: prod.tax_pct !== undefined ? prod.tax_pct : 15,
          is_subscription: prod.billing_type === 'RECURRING' || prod.category === 'Subscription',
          recurring_cycle: prod.frequency || 'Monthly',
          description: prod.description || 'High-performance commercial hardware configuration with enterprise warranties.',
          stock: prod.stock || 50,
          warehouses: prod.warehouses || [
            { name: 'Main Distribution Center (Austin)', stock: Math.round((prod.stock || 50) * 0.6) },
            { name: 'East Regional Depot (Atlanta)', stock: Math.round((prod.stock || 50) * 0.4) }
          ],
          variantsList: [
            { attribute: 'Color', values: 'Blue, Black', extra_price: 0 },
            { attribute: 'RAM', values: '16GB, 32GB', extra_price: 150 },
            { attribute: 'Storage', values: '512GB, 1TB SSD', extra_price: 120 }
          ]
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        sku: `SKU-${Date.now().toString().slice(-5)}`
      }));
    }
  }, [id, isNew, products]);

  // Calculations: Live Gross Profit & Margin %
  const priceNum = parseFloat(formData.price) || 0;
  const costNum = parseFloat(formData.cost) || 0;
  const grossProfit = priceNum - costNum;
  const grossMarginPct = priceNum > 0 ? Math.round(((grossProfit / priceNum) * 100) * 10) / 10 : 0;

  const minFloor = discountRules?.margin_floor?.minimum || 25;
  const targetMargin = discountRules?.margin_floor?.target || 30;

  // Margin color helper
  const getMarginBadge = () => {
    if (grossMarginPct >= targetMargin) {
      return {
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        label: 'Healthy Margin'
      };
    } else if (grossMarginPct >= minFloor) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        label: 'Acceptable Corridor'
      };
    } else {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        label: 'Below Minimum Floor'
      };
    }
  };

  const marginBadge = getMarginBadge();

  // Warehouse stock handlers
  const handleWarehouseStockChange = (idx, val) => {
    const updated = [...formData.warehouses];
    updated[idx].stock = parseInt(val, 10) || 0;
    const total = updated.reduce((acc, w) => acc + w.stock, 0);
    setFormData({
      ...formData,
      warehouses: updated,
      stock: total
    });
  };

  // Variant handlers
  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variantsList: [
        ...formData.variantsList,
        { attribute: 'New Option', values: 'Standard, Custom', extra_price: 0 }
      ]
    });
  };

  const handleRemoveVariant = (idx) => {
    setFormData({
      ...formData,
      variantsList: formData.variantsList.filter((_, i) => i !== idx)
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setToastMessage('Product name is required.');
      return;
    }

    setSaving(true);
    try {
      saveProduct({
        id: isNew ? 'new' : parseInt(id, 10),
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: priceNum,
        cost: costNum,
        unit: formData.unit,
        tax_pct: parseFloat(formData.tax_pct) || 0,
        billing_type: formData.is_subscription ? 'RECURRING' : 'ONE_TIME',
        frequency: formData.is_subscription ? formData.recurring_cycle : undefined,
        description: formData.description,
        stock: formData.stock,
        warehouses: formData.warehouses,
        variants: formData.variantsList.length
      });

      setToastMessage(isNew ? 'New product registered successfully.' : 'Product updated successfully.');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1000);
    } catch (err) {
      setToastMessage(err.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Catalog</span>
        </button>
      </div>

      {/* Page Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isNew ? 'New Product Definition' : 'Product and pricelist'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure pricing, costs, subscription billing, multi-warehouse inventory, and variants.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Product Changes'}</span>
        </button>
      </div>

      {/* Validation Yellow Banner matching Image 14 */}
      <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-center gap-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-relaxed">
          Product details should be filled. Recurring orders with this product will be invoiced at the beginning of the period.
        </span>
      </div>

      {/* Live Financial Margin Calculation Preview Card */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Real-time Financial & Margin Preview</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${marginBadge.bg}`}>
            {marginBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Base Price</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {formatCurrency(priceNum)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Standard Cost</span>
            <span className="text-lg font-black text-slate-700 mt-0.5 block">
              {formatCurrency(costNum)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Gross Profit</span>
            <span className={`text-lg font-black mt-0.5 block ${grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {formatCurrency(grossProfit)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium block">Gross Margin %</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-lg font-black ${
                grossMarginPct >= targetMargin ? 'text-emerald-700' : grossMarginPct >= minFloor ? 'text-amber-700' : 'text-rose-600'
              }`}>
                {grossMarginPct}%
              </span>
              <span className="text-[10px] text-slate-400">
                (Min Floor: {minFloor}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* General Info Form Section matching Image 14 */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>General Info</span>
          <span className="text-[11px] text-slate-400 font-normal">Pricing & Specifications</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Product name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Laptop Pro 14"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">SKU</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-800"
              placeholder="HW-LP-14"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
            >
              <option value="Hardware">Hardware</option>
              <option value="Services">Services</option>
              <option value="Subscription">Subscription</option>
              <option value="Accessories">Accessories</option>
              <option value="Cloud">Cloud</option>
              <option value="Software">Software</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-black text-slate-900 focus:ring-1 focus:ring-blue-500"
              placeholder="1200"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Standard Cost ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-800 focus:ring-1 focus:ring-blue-500"
              placeholder="840"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
            >
              <option value="Each">Each</option>
              <option value="Recurring">Recurring</option>
              <option value="Hour">Hour</option>
              <option value="Day">Day</option>
              <option value="License">License</option>
              <option value="Set">Set</option>
              <option value="Month">Month</option>
              <option value="Project">Project</option>
              <option value="Package">Package</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tax %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.tax_pct}
              onChange={(e) => setFormData({ ...formData, tax_pct: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-medium"
              placeholder="15"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Total Quantity on hand</label>
            <input
              type="number"
              readOnly
              value={formData.stock}
              className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded font-bold text-slate-800 cursor-not-allowed"
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1 text-xs">Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
            placeholder="Product technical details and specifications..."
          />
        </div>

        {/* Subscription Toggle matching Image 14 */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Subscription:</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_subscription: !formData.is_subscription })}
              className={`px-3 py-1 rounded text-xs font-bold transition shadow-2xs ${
                formData.is_subscription
                  ? 'bg-[#1565C0] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {formData.is_subscription ? 'YES' : 'NO'}
            </button>
          </div>

          {formData.is_subscription && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Recurring:</span>
              <select
                value={formData.recurring_cycle}
                onChange={(e) => setFormData({ ...formData, recurring_cycle: e.target.value })}
                className="px-2.5 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Weekly">Weekly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Section: Multi-Warehouse Inventory Stock */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Warehouse Inventory Distribution
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            Total Available Stock: <span className="text-blue-700">{formData.stock} units</span>
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.warehouses.map((wh, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{wh.name}</span>
                <span className="text-[10px] text-slate-500">Live operational warehouse</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={wh.stock}
                  onChange={(e) => handleWarehouseStockChange(idx, e.target.value)}
                  className="w-20 px-2.5 py-1 border border-slate-300 bg-white rounded font-bold text-center text-slate-900 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-500">units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Product Variants Table matching Image 14 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Product Variants
            </h2>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded transition shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-purple-600" />
            <span>Add Attribute</span>
          </button>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Attribute</th>
              <th className="py-2.5 px-4">Values</th>
              <th className="py-2.5 px-4 text-right">Extra Price ($)</th>
              <th className="py-2.5 px-4 text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {formData.variantsList.map((v, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">
                  <input
                    type="text"
                    value={v.attribute}
                    onChange={(e) => {
                      const updated = [...formData.variantsList];
                      updated[idx].attribute = e.target.value;
                      setFormData({ ...formData, variantsList: updated });
                    }}
                    className="px-2 py-1 border border-slate-200 rounded font-bold text-slate-800 text-xs w-full max-w-[150px]"
                  />
                </td>
                <td className="py-2.5 px-4 text-slate-600">
                  <input
                    type="text"
                    value={v.values}
                    onChange={(e) => {
                      const updated = [...formData.variantsList];
                      updated[idx].values = e.target.value;
                      setFormData({ ...formData, variantsList: updated });
                    }}
                    className="px-2 py-1 border border-slate-200 rounded text-slate-700 text-xs w-full max-w-sm"
                  />
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                  <div className="inline-flex items-center justify-end gap-1">
                    <span>+$</span>
                    <input
                      type="number"
                      min="0"
                      value={v.extra_price}
                      onChange={(e) => {
                        const updated = [...formData.variantsList];
                        updated[idx].extra_price = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, variantsList: updated });
                      }}
                      className="w-16 px-2 py-1 border border-slate-200 rounded text-right font-bold text-emerald-700 text-xs"
                    />
                  </div>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section: Pricelists Table matching Image 14 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pricelists
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Tiered Currencies & Pricing Formulas</span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Tier</th>
              <th className="py-2.5 px-4">Currency</th>
              <th className="py-2.5 px-4">Price Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50/60">
              <td className="py-2.5 px-4 font-bold text-amber-700">Bronze</td>
              <td className="py-2.5 px-4 font-semibold text-slate-700">USD</td>
              <td className="py-2.5 px-4 text-slate-600">Price, no adjustment</td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-2.5 px-4 font-bold text-slate-700">Silver</td>
              <td className="py-2.5 px-4 font-semibold text-slate-700">USD/EUR</td>
              <td className="py-2.5 px-4 text-slate-600">Price minus 5 percent standard</td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-2.5 px-4 font-bold text-yellow-600">Gold</td>
              <td className="py-2.5 px-4 font-semibold text-slate-700">USD/EUR</td>
              <td className="py-2.5 px-4 font-medium text-blue-700">Price minus 10 percent base</td>
            </tr>
            <tr className="hover:bg-slate-50/60">
              <td className="py-2.5 px-4 font-bold text-purple-700">Enterprise</td>
              <td className="py-2.5 px-4 font-semibold text-slate-700">USD/EUR/GBP</td>
              <td className="py-2.5 px-4 font-medium text-purple-700">Price minus 15 percent strategic partnership</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductEditor;
