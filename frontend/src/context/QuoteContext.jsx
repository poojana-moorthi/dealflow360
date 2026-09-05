import React, { createContext, useContext, useState } from 'react';
import quotationService from '../services/quotationService';

const QuoteContext = createContext(null);

export function QuoteProvider({ children }) {
  const [activeQuote, setActiveQuote] = useState(null);
  const [calculationPreview, setCalculationPreview] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const recalculate = async (customerId, items) => {
    if (!customerId || !items || items.length === 0) {
      setCalculationPreview(null);
      return;
    }
    setIsCalculating(true);
    try {
      const res = await quotationService.recalculatePreview(customerId, items);
      if (res.success) {
        setCalculationPreview(res.data);
      }
    } catch (err) {
      console.error('[QUOTE-PREVIEW] Recalculation failed:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <QuoteContext.Provider value={{ activeQuote, setActiveQuote, calculationPreview, setCalculationPreview, recalculate, isCalculating }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  return useContext(QuoteContext);
}
