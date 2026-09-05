const { query } = require('../config/db');

/**
 * DealFlow360 Upsell & Cross-Sell Recommendation Engine
 * Analyzes active quotation line items, queries cross-sell association rules,
 * projects gross margin impacts and potential financial delta.
 */
async function getRecommendationsForQuotation({ quotation, items }) {
  if (!items || items.length === 0) return [];

  const productIds = items.map(it => it.product_id);
  const currentSubtotal = parseFloat(quotation.subtotal) || 0;
  const currentCost = parseFloat(quotation.total_cost) || 0;
  const currentMarginPct = currentSubtotal > 0
    ? (((currentSubtotal - currentCost) / currentSubtotal) * 100)
    : 0;

  // Find all active upsell rules triggered by products currently in quotation
  const rules = await query(
    `SELECT ur.*, p.name as recommended_product_name, p.sku as recommended_sku,
            p.category as recommended_category, p.price as recommended_price,
            p.cost as recommended_cost, p.billing_type as recommended_billing_type
     FROM upsell_rules ur
     JOIN products p ON ur.recommended_product_id = p.id
     WHERE ur.trigger_product_id IN (?) AND p.is_active = TRUE`,
    [productIds]
  );

  const recommendations = [];
  const seenRecommended = new Set();

  for (const rule of rules) {
    // If quote already includes the recommended product, don't duplicate
    if (productIds.includes(rule.recommended_product_id) || seenRecommended.has(rule.recommended_product_id)) {
      continue;
    }
    seenRecommended.add(rule.recommended_product_id);

    const price = parseFloat(rule.recommended_price);
    const cost = parseFloat(rule.recommended_cost);
    const discountIncentive = parseFloat(rule.discount_incentive_pct) || 0;
    const effectivePrice = price * (1 - (discountIncentive / 100));

    const projectedSubtotal = currentSubtotal + effectivePrice;
    const projectedCost = currentCost + cost;
    const projectedMarginPct = projectedSubtotal > 0
      ? (((projectedSubtotal - projectedCost) / projectedSubtotal) * 100)
      : 0;

    const marginDelta = projectedMarginPct - currentMarginPct;
    const profitDelta = (effectivePrice - cost);

    recommendations.push({
      ruleId: rule.id,
      triggerProductId: rule.trigger_product_id,
      product: {
        id: rule.recommended_product_id,
        name: rule.recommended_product_name,
        sku: rule.recommended_sku,
        category: rule.recommended_category,
        price: price,
        cost: cost,
        billing_type: rule.recommended_billing_type
      },
      reason: rule.reason,
      discountIncentivePct: discountIncentive,
      offerPrice: effectivePrice,
      currentMarginPct: parseFloat(currentMarginPct.toFixed(2)),
      projectedMarginPct: parseFloat(projectedMarginPct.toFixed(2)),
      marginDeltaPct: parseFloat(marginDelta.toFixed(2)),
      profitDelta: parseFloat(profitDelta.toFixed(2)),
      rank: profitDelta > 10000 ? 'HIGH' : 'STANDARD'
    });
  }

  // Sort by profit delta descending
  recommendations.sort((a, b) => b.profitDelta - a.profitDelta);
  return recommendations;
}

module.exports = { getRecommendationsForQuotation };
