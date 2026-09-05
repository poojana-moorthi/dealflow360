import { useState, useEffect } from 'react';
import { useQuote } from '../context/QuoteContext';
import customerService from '../services/customerService';
import productService from '../services/productService';

export function useQuoteBuilder(initialCustomerId = '') {
  const { recalculate, calculationPreview, isCalculating } = useQuote();
  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cRes, pRes] = await Promise.all([
          customerService.getAll(),
          productService.getAll()
        ]);
        if (cRes.success) setCustomers(cRes.data);
        if (pRes.success) setProducts(pRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Trigger recalculation whenever customer or items change
  useEffect(() => {
    if (customerId && items.length > 0) {
      const timer = setTimeout(() => {
        recalculate(customerId, items);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [customerId, items]);

  const addItem = (product) => {
    setItems(prev => {
      const exists = prev.find(p => p.product_id === product.id);
      if (exists) {
        return prev.map(p => p.product_id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          category: product.category,
          sku: product.sku,
          quantity: 1,
          unit_price: parseFloat(product.price),
          unit_cost: parseFloat(product.cost),
          discount_pct: 0,
          billing_type: product.billing_type,
          billing_frequency: product.billing_type === 'RECURRING' ? 'MONTHLY' : 'ONE_TIME'
        }
      ];
    });
  };

  const updateItem = (productId, field, value) => {
    setItems(prev => prev.map(it => {
      if (it.product_id === productId) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(it => it.product_id !== productId));
  };

  return {
    customerId,
    setCustomerId,
    customers,
    products,
    items,
    setItems,
    notes,
    setNotes,
    addItem,
    updateItem,
    removeItem,
    calculationPreview,
    isCalculating,
    loading
  };
}

export default useQuoteBuilder;
