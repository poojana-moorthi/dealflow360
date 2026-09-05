const { query } = require('../config/db');

/**
 * DealFlow360 Blended Dynamic Risk Score Engine
 * Evaluates line-by-line discount governance, gross margin degradation,
 * deal volume, tier tolerance, and counter-offer slippage.
 */
async function calculateRiskScore({ customerTier, items, grossMarginPct, totalAmount, isCounterOffer = false }) {
  let riskScore = 10; // Baseline healthy score
  const reasons = [];
  let violationsCount = 0;
  let maxLineViolationPct = 0;

  // 1. Fetch discount governance rules
  const discountRules = await query('SELECT * FROM discount_rules');
  const rulesMap = {};
  discountRules.forEach(r => {
    const key = `${r.customer_tier}_${r.product_category}`;
    rulesMap[key] = {
      maxDiscountPct: parseFloat(r.max_discount_pct),
      approvalLevel: r.required_approval_level
    };
  });

  // 2. Evaluate line items against category and tier governance
  let requiredApprovalLevel = 'NONE';

  for (const item of items) {
    const category = item.category || 'Hardware';
    const discountPct = parseFloat(item.discount_pct) || 0;
    const key = `${customerTier}_${category}`;
    const rule = rulesMap[key] || { maxDiscountPct: 10, approvalLevel: 'SALES_MANAGER' };

    if (discountPct > rule.maxDiscountPct) {
      violationsCount++;
      const excess = discountPct - rule.maxDiscountPct;
      if (excess > maxLineViolationPct) maxLineViolationPct = excess;

      // Penalty scaled by violation severity
      const penalty = Math.round(excess * 3.5);
      riskScore += penalty;

      reasons.push(
        `${item.product_name || 'Product'} (${category}): Discount ${discountPct.toFixed(1)}% exceeds ${customerTier} policy cap of ${rule.maxDiscountPct.toFixed(1)}% (+${excess.toFixed(1)}% violation)`
      );

      // Escalation check
      if (excess > 10.0 || discountPct > 25.0) {
        requiredApprovalLevel = 'FINANCE';
      } else if (requiredApprovalLevel !== 'FINANCE') {
        requiredApprovalLevel = rule.approvalLevel || 'SALES_MANAGER';
      }
    }
  }

  // Risky lines penalty
  if (violationsCount > 1) {
    riskScore += violationsCount * 8;
    reasons.push(`Multiple line discount violations detected (${violationsCount} policy exceptions)`);
  }

  // 3. Gross Margin Health Check
  const margin = parseFloat(grossMarginPct) || 0;
  if (margin < 15.0) {
    riskScore += 35;
    requiredApprovalLevel = 'FINANCE';
    reasons.push(`Severely eroded gross margin (${margin.toFixed(1)}% < 15.0% threshold)`);
  } else if (margin < 25.0) {
    riskScore += 20;
    if (requiredApprovalLevel === 'NONE') requiredApprovalLevel = 'SALES_MANAGER';
    reasons.push(`Sub-target gross margin (${margin.toFixed(1)}% < 25.0% target)`);
  } else if (margin < 30.0) {
    riskScore += 10;
    reasons.push(`Gross margin (${margin.toFixed(1)}%) is below standard healthy benchmark (30.0%)`);
  }

  // 4. Deal Volume Exposure
  const total = parseFloat(totalAmount) || 0;
  if (total > 1000000) {
    riskScore += 12;
    reasons.push('High exposure contract: deal value exceeds ₹10,00,000 threshold');
  } else if (total > 500000) {
    riskScore += 6;
    reasons.push('Significant contract size: deal value exceeds ₹5,00,000 threshold');
  }

  // 5. Customer Tier Multiplier
  if (customerTier === 'BRONZE' && violationsCount > 0) {
    riskScore += 10;
    reasons.push('Bronze tier customer requesting non-standard pricing concessions');
  }

  // 6. Negotiation / Counter-Offer Factor
  if (isCounterOffer) {
    riskScore += 15;
    reasons.push('Customer counter-offer exceeds baseline quoted terms');
  }

  // Cap risk score between 5 and 99
  riskScore = Math.max(5, Math.min(99, riskScore));

  // Determine Risk Level
  let riskLevel = 'LOW';
  let approvalRequired = false;

  if (riskScore >= 75) {
    riskLevel = 'CRITICAL';
    approvalRequired = true;
    requiredApprovalLevel = requiredApprovalLevel === 'FINANCE' ? 'FINANCE' : 'SALES_MANAGER';
  } else if (riskScore >= 60) {
    riskLevel = 'HIGH';
    approvalRequired = true;
    if (requiredApprovalLevel === 'NONE') requiredApprovalLevel = 'SALES_MANAGER';
  } else if (riskScore >= 35 || violationsCount > 0) {
    riskLevel = 'MEDIUM';
    if (violationsCount > 0) {
      approvalRequired = true;
      if (requiredApprovalLevel === 'NONE') requiredApprovalLevel = 'SALES_MANAGER';
    }
  } else {
    riskLevel = 'LOW';
    approvalRequired = false;
    requiredApprovalLevel = 'NONE';
  }

  if (reasons.length === 0) {
    reasons.push('Quotation complies with all pricing governance standards and margins');
  }

  return {
    riskScore,
    riskLevel,
    approvalRequired,
    approvalLevel: requiredApprovalLevel,
    reasons
  };
}

/**
 * Deterministic Governance Evaluation Function
 * One Governance Engine powering Quotation Builder, Approval Queue, Admin Simulator, and Deal Health.
 */
function evaluateGovernance({ customerTier = 'Gold', category = 'Hardware', discount = 0, grossMargin = 30, dealValue = 0 }) {
  const tierLimits = { Bronze: 5, Silver: 10, Gold: 15, Enterprise: 20, Platinum: 20 };
  const categoryLimits = { Hardware: 15, Services: 10, Cloud: 12, Software: 15, Subscription: 10, Accessories: 20 };

  const tierCeiling = tierLimits[customerTier] ?? 15;
  const catCeiling = categoryLimits[category] ?? 15;
  const discountCeiling = Math.min(tierCeiling, catCeiling);

  const discountAllowed = discount <= discountCeiling;
  const marginFloor = 30;

  let riskScore = 15;
  if (!discountAllowed) riskScore += Math.round((discount - discountCeiling) * 4);
  if (grossMargin < 25) riskScore += 30;
  else if (grossMargin < 30) riskScore += 15;
  if (dealValue > 50000) riskScore += 10;
  riskScore = Math.min(99, Math.max(10, riskScore));

  const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
  const approvalRoute = [];
  if (!discountAllowed || riskScore >= 40) approvalRoute.push('SALES_MANAGER');
  if (grossMargin < 25 || riskScore >= 70 || discount > discountCeiling + 10) approvalRoute.push('FINANCE');

  const decision = approvalRoute.length > 0 ? 'REQUIRES_APPROVAL' : 'AUTO_APPROVED';

  return {
    discountAllowed,
    discountCeiling,
    requestedDiscount: discount,
    grossMargin,
    marginFloor,
    riskScore,
    riskLevel,
    decision,
    approvalRoute
  };
}

module.exports = { calculateRiskScore, evaluateGovernance };

