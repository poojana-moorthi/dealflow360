export function useMarginCalculator(revenue = 0, cost = 0) {
  const rev = parseFloat(revenue) || 0;
  const cst = parseFloat(cost) || 0;
  const grossProfit = rev - cst;
  const grossMarginPct = rev > 0 ? (grossProfit / rev) * 100 : 0;

  return {
    revenue: rev,
    cost: cst,
    grossProfit,
    grossMarginPct: parseFloat(grossMarginPct.toFixed(2)),
    isHealthy: grossMarginPct >= 30,
    isSubTarget: grossMarginPct >= 20 && grossMarginPct < 30,
    isCritical: grossMarginPct < 20
  };
}

export default useMarginCalculator;
