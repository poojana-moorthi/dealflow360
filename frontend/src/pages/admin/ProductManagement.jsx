import React, { useState, useEffect } from 'react';
import productService from '../../services/productService';
import { Loader, Toast } from '../../components/common/Card';
import { formatCurrency } from '../../utils/formatters';
import { Plus, ArrowLeft, AlertCircle, Package, Layers, Tag, DollarSign, CheckCircle2 } from 'lucide-react';

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Selected product for Image 14 detail view
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states for Image 14 Detail view
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Hardware',
    price: '',
    unit: 'Each',
    description: '',
    tax_pct: 15,
    is_subscription: false,
    recurring_cycle: 'Monthly',
    qty_on_hand: 50
  });

  const loadProducts = async () => {
    try {
      const res = await productService.getAll();
      if (res.success && res.data && res.data.length > 0) {
        setProducts(res.data);
      } else {
        // Mock products matching Image 13 wireframe
        setProducts([
          { id: 1, name: 'Laptop Pro 14', category: 'Hardware', variants: '3(size)', price: 1200, unit: 'Each', tax: '15%', status: 'Active' },
          { id: 2, name: 'Onsite Setup Service', category: 'Services', variants: '—', price: 450, unit: 'Each', tax: '—', status: 'Active' },
          { id: 3, name: 'Docking Station', category: 'Hardware', variants: '3(color)', price: 180, unit: 'Each', tax: '15%', status: 'Active' },
          { id: 4, name: 'Care Plan 3 years', category: 'Subscription', variants: '—', price: 40, unit: 'Recurring', tax: '0%', status: 'Active' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setProducts([
        { id: 1, name: 'Laptop Pro 14', category: 'Hardware', variants: '3(size)', price: 1200, unit: 'Each', tax: '15%', status: 'Active' },
        { id: 2, name: 'Onsite Setup Service', category: 'Services', variants: '—', price: 450, unit: 'Each', tax: '—', status: 'Active' },
        { id: 3, name: 'Docking Station', category: 'Hardware', variants: '3(color)', price: 180, unit: 'Each', tax: '15%', status: 'Active' },
        { id: 4, name: 'Care Plan 3 years', category: 'Subscription', variants: '—', price: 40, unit: 'Recurring', tax: '0%', status: 'Active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setProductForm({
      name: p.name || '',
      category: p.category || 'Hardware',
      price: p.price || 1200,
      unit: p.unit || 'Each',
      description: p.description || 'Enterprise grade performance laptop',
      tax_pct: p.tax ? parseInt(p.tax, 10) || 15 : 15,
      is_subscription: p.category === 'Subscription' || p.billing_type === 'RECURRING',
      recurring_cycle: 'Monthly',
      qty_on_hand: 48
    });
  };

  const handleOpenNew = () => {
    setSelectedProduct({ id: 'new', name: 'New Product' });
    setProductForm({
      name: '',
      category: 'Hardware',
      price: '',
      unit: 'Each',
      description: '',
      tax_pct: 15,
      is_subscription: false,
      recurring_cycle: 'Monthly',
      qty_on_hand: 0
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduct.id !== 'new') {
        await productService.update(selectedProduct.id, {
          name: productForm.name,
          category: productForm.category,
          price: parseFloat(productForm.price),
          billing_type: productForm.is_subscription ? 'RECURRING' : 'ONE_TIME',
          description: productForm.description
        });
        setToastMessage('Product details updated successfully');
      } else {
        await productService.create({
          name: productForm.name,
          sku: `SKU-${Date.now().toString().slice(-4)}`,
          category: productForm.category,
          price: parseFloat(productForm.price),
          cost: parseFloat(productForm.price) * 0.7,
          billing_type: productForm.is_subscription ? 'RECURRING' : 'ONE_TIME',
          description: productForm.description
        });
        setToastMessage('New product created successfully');
      }
      await loadProducts();
      setSelectedProduct(null);
    } catch (err) {
      setToastMessage(err.message || 'Error saving product');
    }
  };

  if (loading) return <Loader text="Loading product inventory..." />;

  // -------------------------------------------------------------
  // IMAGE 14 VIEW: Product and pricelist Details Page
  // -------------------------------------------------------------
  if (selectedProduct) {
    return (
      <div className="space-y-6">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />

        {/* Back to Catalog */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1565C0] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Product Catalog</span>
          </button>
        </div>

        {/* Header matching Image 14 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Product and pricelist</h1>
          <button
            type="button"
            onClick={handleSaveProduct}
            className="px-4 py-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs"
          >
            Save Product Changes
          </button>
        </div>

        {/* Validation Banner (Yellow) matching Image 14 */}
        <div className="bg-[#FEF9C3] border border-[#FDE047] text-amber-950 px-4 py-3 rounded-md text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Product details should be filled. Recurring order with this product will be invoiced at the beginning of the period.</span>
        </div>

        {/* Section: General Info Form */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
            General Info
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Product name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Laptop Pro 14"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Category</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="Hardware">Hardware</option>
                <option value="Services">Services</option>
                <option value="Subscription">Subscription</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Price ($)</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-blue-500"
                placeholder="1200"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Unit</label>
              <select
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white font-medium"
              >
                <option value="Each">Each</option>
                <option value="Recurring">Recurring</option>
                <option value="Hour">Hour</option>
                <option value="License">License</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Tax %</label>
              <input
                type="number"
                value={productForm.tax_pct}
                onChange={(e) => setProductForm({ ...productForm, tax_pct: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded font-medium"
                placeholder="15"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Quantity on hand</label>
              <input
                type="number"
                value={productForm.qty_on_hand}
                onChange={(e) => setProductForm({ ...productForm, qty_on_hand: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded font-medium"
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1 text-xs">Description</label>
            <textarea
              rows={2}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              placeholder="Product technical details and specifications..."
            />
          </div>

          {/* Subscription Toggle matching Image 14 */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Subscription:</span>
              <button
                type="button"
                onClick={() => setProductForm({ ...productForm, is_subscription: !productForm.is_subscription })}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  productForm.is_subscription
                    ? 'bg-[#1565C0] text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {productForm.is_subscription ? 'YES' : 'NO'}
              </button>
            </div>

            {productForm.is_subscription && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Recurring:</span>
                <select
                  value={productForm.recurring_cycle}
                  onChange={(e) => setProductForm({ ...productForm, recurring_cycle: e.target.value })}
                  className="px-2.5 py-1 border border-slate-300 rounded bg-white text-xs font-medium"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Section: Product Variants Table matching Image 14 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Product Variants
            </h2>
            <span className="text-[11px] text-slate-500 font-semibold">Configurable Attributes</span>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Attribute</th>
                <th className="py-2.5 px-4">Values</th>
                <th className="py-2.5 px-4 text-right">Extra price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">Color</td>
                <td className="py-2.5 px-4 text-slate-600">Blue, Black</td>
                <td className="py-2.5 px-4 text-right font-medium text-slate-600">0</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">RAM</td>
                <td className="py-2.5 px-4 text-slate-600">4GB, 8GB</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">+$30</td>
              </tr>
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-4 font-bold text-slate-800">Manufacturer</td>
                <td className="py-2.5 px-4 text-slate-600">Dell, HP</td>
                <td className="py-2.5 px-4 text-right font-bold text-emerald-700">+$10/+$30</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section: Pricelists Table matching Image 14 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Pricelists
            </h2>
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
                <td className="py-2.5 px-4 font-bold text-yellow-600">Gold</td>
                <td className="py-2.5 px-4 font-semibold text-slate-700">USD/EUR</td>
                <td className="py-2.5 px-4 font-medium text-blue-700">Price minus 10 percent base</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // IMAGE 13 VIEW: Product Catalog & Dashboard
  // -------------------------------------------------------------
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
            onClick={handleOpenNew}
            className="px-3.5 py-1.5 bg-[#1565C0] hover:bg-[#0D47A1] text-white text-xs font-bold rounded-md transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Product</span>
          </button>
          <button
            type="button"
            onClick={() => setToastMessage('Custom price fields configuration panel opened.')}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition shadow-xs"
          >
            Manage Price fields
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

      {/* Products Table matching Image 13 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Product name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Variants</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Unit</th>
              <th className="py-3 px-4">Tax</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="hover:bg-blue-50/40 cursor-pointer transition"
              >
                <td className="py-3 px-4 font-bold text-[#1565C0]">{p.name}</td>
                <td className="py-3 px-4 text-slate-700">{p.category}</td>
                <td className="py-3 px-4 text-slate-600">{p.variants || '—'}</td>
                <td className="py-3 px-4 font-bold text-slate-900">
                  {typeof p.price === 'number' ? formatCurrency(p.price) : p.price}
                </td>
                <td className="py-3 px-4 text-slate-600">{p.unit || 'Each'}</td>
                <td className="py-3 px-4 text-slate-600">{p.tax || '15%'}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {p.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManagement;
