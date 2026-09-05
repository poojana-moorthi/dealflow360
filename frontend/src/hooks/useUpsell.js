import { useState, useEffect } from 'react';
import quotationService from '../services/quotationService';

export function useUpsell(quotationId) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!quotationId) return;
    setLoading(true);
    try {
      const res = await quotationService.getUpsell(quotationId);
      if (res.success) {
        setRecommendations(res.data);
      }
    } catch (err) {
      console.warn('[UPSELL] Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [quotationId]);

  return { recommendations, loading, refresh: fetchRecommendations };
}

export default useUpsell;
