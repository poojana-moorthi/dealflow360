import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSales } from '../../context/SalesContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Toast } from '../../components/common/Card';
import {
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Save,
  Send,
  Building2,
  Package,
  Calculator,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export function QuotationBuilder() {
  const navigate = useNavigate();
  const { customers, products, calculatePricing, createQuotation, persona } = useSales();

  const [toastMessage, setToastMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // 10. Customer Information Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(1); // Default Acme Corporation
  const customer = useMemo(() => {
    return customers.find(c => c.id === parseInt(selectedCustomerId, 10)) || customers[0];
  }, [customers, selectedCustomerId]);

  const [contactPerson, setContactPerson] = useState(customer.contact_person || '');
  const [email, setEmail] = useState(customer.email || '');
  const [phone, setPhone] = useState(customer.phone || '');
  const [billingAddress, setBillingAddress] = useState(customer.billing_address || '');
  const [shippingAddress, setShippingAddress] = useState(customer.shipping_address || '');
  const [priceList, setPriceList] = useState(customer.price_list || 'Enterprise Gold Tier (USD)');
  const [paymentTerms, setPaymentTerms] = useState(customer.payment_terms || 'Net 30');
  const [notes, setNotes] = useState('');

  // When customer changes, auto-populate contact details
  const handleCustomerChange = (newId) => {
    setSelectedCustomerId(newId);
    const c = customers.find(item => item.id === parseInt(newId, 10));
    if (c) {
      setContactPerson(c.contact_person);
      setEmail(c.email);
      setPhone(c.phone);
      setBillingAddress(c.billing_address);
      setShippingAddress(c.shipping_address);
      setPriceList(c.price_list);
      setPaymentTerms(c.payment_terms);
    }
  };

  // 11. Product Line-Item Table State (Defaults to Golden Demo Scenario)
  const [lineItems, setLineItems] = useState([
    {
      product_id: 1, // Laptop Pro 14
      quantity: 30,
      unit_price: 2400,
      unit_cost: 1600,
      discount_pct: 22 // Triggers 22% vs 15% violation
    },
    {
      product_id: 4, // Thunderbolt Docking Station
      quantity: 30,
      unit_price: 280,
      unit_cost: 160,
      discount_pct: 15
    },
    {
      product_id: 6, // Onsite Deployment & Setup
      quantity: 40,
      unit_price: 450,
      unit_cost: 220,
      discount_pct: 12
    }
  ]);

  // 12. Live Pricing Calculation (immediate, zero reload)
  const pricing = useMemo(() => {
    return calculatePricing(lineItems, customer.tier);
  }, [calculatePricing, lineItems, customer.tier]);

  // Add Product Handler
  const handleAddProduct = () => {
    const defaultProd = products[0];
    setLineItems(prev => [
      ...prev,
      {
        product_id: defaultProd.id,
        quantity: 1,
        unit_price: defaultProd.unit_price,
        unit_cost: defaultProd.unit_cost,
        discount_pct: 0
      }
    ]);
  };

  // Update Line Item
  const handleUpdateItem = (index, field, value) => {
    setLineItems(prev => {
      const updated = [...prev];
      if (field === 'product_id') {
        const prod = products.find(p => p.id === parseInt(value, 10)) || products[0];
        updated[index] = {
          ...updated[index],
          product_id: prod.id,
          unit_price: prod.unit_price,
          unit_cost: prod.unit_cost
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: field === 'quantity' ? (parseInt(value, 10) || 1) : (parseFloat(value) || 0)
        };
      }
      return updated;
    });
  };

  // Remove Line Item
  const handleRemoveItem = (index) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  // Preload Golden Demo Shortcut
  const handleLoadGoldenDemo = () => {
    handleCustomerChange(1); // Acme Corp (Gold, 15% limit)
    setLineItems([
      {
        product_id: 1,
        quantity: 30,
        unit_price: 2400,
        unit_cost: 1600,
        discount_pct: 22 // 22% vs 15% limit -> OVER LIMIT (+7pt), Margin 24.2%, Risk 82
      },
      {
        product_id: 4,
        quantity: 30,
        unit_price: 280,
        unit_cost: 160,
        discount_pct: 15
      },
      {
        product_id: 6,
        quantity: 40,
        unit_price: 450,
        unit_cost: 220,
        discount_pct: 12
      }
    ]);
    setToastMessage('Golden Demo Scenario preloaded: 22% discount applied on Laptop Pro 14.');
  };

  // Submit / Save Draft
  const handleSaveQuotation = (submitForApproval = false) => {
    if (lineItems.length === 0) {
      setToastMessage('Please add at least one product line item.');
      return;
    }

    setSaving(true);
    try {
      const created = createQuotation({
        customer_id: customer.id,
        items: lineItems,
        notes,
        submit_for_approval: submitForApproval,
        status: submitForApproval ? 'PENDING APPROVAL' : 'DRAFT'
      });

      if (submitForApproval) {
        setToastMessage(`Quotation ${created.quotation_number} submitted for ${pricing.required_approval_level} approval.`);
      } else {
        setToastMessage(`Draft Quotation ${created.quotation_number} saved successfully.`);
      }

      setTimeout(() => {
        navigate(`/quotations/${created.id}`);
      }, 800);
    } catch (err) {
      setToastMessage('Error saving quotation.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Top Breadcrumb & Demo Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <Link to="/quotations" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1565C0] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>

        <button
          type="button"
          onClick={handleLoadGoldenDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded text-xs font-bold transition shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Load Golden Demo Scenario (22% Violation)</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Quotation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure customer details, product lines, and live governance pricing with real-time risk scoring
        </p>
      </div>

      {/* 10. Customer Information Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1565C0]" />
            <span>Customer Information</span>
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-[#1565C0] border border-blue-200">
            Tier: {customer.tier} (Ceiling: {customer.max_discount}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Customer Account *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 bg-white focus:ring-1 focus:ring-blue-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Billing Address</label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Shipping Address</label>
            <input
              type="text"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Price List Tier</label>
            <select
              value={priceList}
              onChange={(e) => setPriceList(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium"
            >
              <option value="Enterprise Gold Tier (USD)">Enterprise Gold Tier (USD)</option>
              <option value="Commercial Silver Tier (USD)">Commercial Silver Tier (USD)</option>
              <option value="Global Platinum Partner (USD)">Global Platinum Partner (USD)</option>
              <option value="Standard Base (USD)">Standard Base (USD)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 font-medium"
            >
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
              <option value="Net 15">Net 15</option>
              <option value="Due on Receipt">Due on Receipt</option>
            </select>
          </div>
        </div>
      </div>

      {/* 11. Product Line-Item Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1565C0]" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Product & Service Lines ({lineItems.length})
            </h2>
          </div>

          <button
            type="button"
            onClick={handleAddProduct}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Product</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-center">Discount %</th>
                <th className="py-2.5 px-3 text-center">Discount Check</th>
                <th className="py-2.5 px-3 text-right">Discount $</th>
                <th className="py-2.5 px-3 text-right">Final Price</th>
                <th className="py-2.5 px-3 text-right">Margin %</th>
                <th className="py-2.5 px-3 text-center">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pricing.items.map((it, idx) => (
                <tr key={idx} className={it.violation ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 min-w-[180px]">
                    <select
                      value={it.product_id}
                      onChange={(e) => handleUpdateItem(idx, 'product_id', e.target.value)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-medium bg-white text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.unit_price})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {it.sku}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold text-slate-900 text-xs"
                    />
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                    ${(it.unit_price).toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={it.discount_pct}
                        onChange={(e) => handleUpdateItem(idx, 'discount_pct', e.target.value)}
                        className={`w-14 px-2 py-1 border rounded text-center font-bold text-xs ${
                          it.violation
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-300 text-slate-800'
                        }`}
                      />
                      <span className="font-semibold text-slate-500">%</span>
                    </div>
                  </td>

                  {/* 13. Discount Ceiling Check Column */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {it.violation ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                        <span>⚠ OVER LIMIT (+{it.over_pt}pt)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span>✓ DISCOUNT WITHIN LIMIT</span>
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                    ${Math.round(it.discount_amount).toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${Math.round(it.final_price).toLocaleString()}
                  </td>

                  <td className="py-2.5 px-3 text-right font-bold">
                    <span className={it.margin_pct >= 30 ? 'text-emerald-700' : 'text-amber-700'}>
                      {it.margin_pct}%
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: 12. Live Pricing Calculation & 14. AI Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 12. LIVE PRICING CALCULATION CARD */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#1565C0]" />
              <span>Live Pricing & Margin Calculation</span>
            </h3>
            <span className="text-[11px] text-slate-400">Zero Refresh Live Calc</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 py-1">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900 font-mono">${(pricing.subtotal).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 py-1">
              <span>Discount ({pricing.overall_discount_pct}%):</span>
              <span className="font-bold text-rose-600 font-mono">-${(pricing.discount_amount).toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-slate-600 py-1">
              <span>Tax (8.25%):</span>
              <span className="font-bold text-slate-700 font-mono">+${(pricing.tax_amount).toLocaleString()}</span>
            </div>

            <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Final Total:</span>
              <span className="text-2xl font-black text-slate-900 font-mono">${(pricing.grand_total).toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-700">Gross Margin:</span>
              <span className={`text-base font-black ${
                pricing.gross_margin_pct >= 30 ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {pricing.gross_margin_pct}%
                <span className="text-xs text-slate-400 font-normal ml-1.5">(Target: 30%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* 14. AI RISK SCORE & BREAKDOWN */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Blended Risk Score Calculation
              </h3>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              pricing.risk_score >= 70
                ? 'bg-rose-100 text-rose-800'
                : pricing.risk_score >= 40
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {pricing.risk_level}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <span className="text-xs text-slate-500 font-semibold">Deterministic Blended Score</span>
              <div className="text-2xl font-black text-slate-900">{pricing.risk_score} / 100</div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span>Required Approval Tier:</span>
              <div className="font-bold text-base text-[#1565C0]">{pricing.required_approval_level}</div>
            </div>
          </div>

          {/* Risk Factors Breakdown matching Section 14 */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Discount Risk</span>
              <span className="font-bold text-rose-600">+{pricing.risk_breakdown.discount_risk}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Margin Risk</span>
              <span className="font-bold text-amber-600">+{pricing.risk_breakdown.margin_risk}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Deal Size Risk</span>
              <span className="font-bold text-slate-700">+{pricing.risk_breakdown.deal_size_risk}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Inactivity Risk</span>
              <span className="font-bold text-slate-700">+{pricing.risk_breakdown.inactivity_risk}</span>
            </div>
            <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Score</span>
              <span className="text-rose-600">{pricing.risk_score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 15. QUOTATION DECISION CARD */}
      <div className={`p-5 rounded-lg border shadow-xs ${
        pricing.approval_required
          ? 'bg-amber-50/70 border-amber-300'
          : 'bg-emerald-50/70 border-emerald-300'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {pricing.approval_required ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <h3 className="text-base font-black tracking-tight text-slate-900">
                {pricing.approval_required ? '⚠ APPROVAL REQUIRED' : '✓ READY TO SUBMIT'}
              </h3>
            </div>

            <p className="text-xs text-slate-700">
              {pricing.approval_required ? (
                <>
                  Discount exceeds the allowed ceiling (+{pricing.worst_violation}pt violation).
                  Gross margin ({pricing.gross_margin_pct}%) requires governance review.
                  <strong className="block text-slate-900 mt-0.5">
                    Risk Score: {pricing.risk_score} • Approval Route: {pricing.required_approval_level}
                  </strong>
                </>
              ) : (
                <>
                  Discount within allowed limit. Margin ({pricing.gross_margin_pct}%) above target. No major anomalies detected.
                </>
              )}
            </p>
          </div>

          {/* Action Buttons matching Section 15 */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveQuotation(false)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-md hover:bg-slate-50 transition shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Save Draft</span>
            </button>

            {pricing.approval_required ? (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveQuotation(true)}
                className="px-5 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveQuotation(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Quotation</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationBuilder;
