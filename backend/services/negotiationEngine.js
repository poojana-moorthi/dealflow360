const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const Negotiation = require('../models/Negotiation');
const { calculateRiskScore } = require('./riskScoreEngine');
const { routeQuotationApproval } = require('./approvalEngine');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/emailService');

/**
 * DealFlow360 Customer Portal Negotiation Engine
 * Evaluates customer counter-offers, recalculates financial metrics,
 * determines policy breaches, and triggers autonomous re-approval workflows.
 */
async function processCounterOffer({ quotationId, user, counterPrice, counterDiscountPct, comment, lineChanges = [] }) {
  const quote = await Quotation.findById(quotationId);
  if (!quote) throw new Error('Quotation not found');

  // Record negotiation comment / counter-offer
  const negId = await Negotiation.create({
    quotation_id: quotationId,
    user_id: user.id,
    role: user.role || 'CUSTOMER',
    message_type: 'COUNTER_OFFER',
    counter_price: counterPrice,
    counter_discount_pct: counterDiscountPct,
    comment,
    line_changes_json: lineChanges
  });

  await logAudit({
    user_id: user.id,
    role: user.role,
    action: 'COUNTER_OFFER',
    entity: 'QUOTATION',
    entity_id: quotationId,
    reason: comment,
    metadata: { counterPrice, counterDiscountPct, lineChanges }
  });

  // Recalculate quotation with counter terms
  let newTotal = parseFloat(counterPrice) || quote.total_amount;
  let items = [...quote.items];

  // If counter discount percentage was provided, apply to items
  if (counterDiscountPct && counterDiscountPct > 0) {
    const discountFactor = parseFloat(counterDiscountPct) / 100;
    let newSubtotal = 0;
    let newTotalDiscount = 0;

    items = items.map(item => {
      const listTotal = parseFloat(item.unit_price) * item.quantity;
      const discountAmount = listTotal * discountFactor;
      const lineTotal = listTotal - discountAmount;
      const lineCost = parseFloat(item.unit_cost) * item.quantity;
      const lineMargin = lineTotal > 0 ? (((lineTotal - lineCost) / lineTotal) * 100) : 0;

      newSubtotal += listTotal;
      newTotalDiscount += discountAmount;

      return {
        ...item,
        discount_pct: parseFloat(counterDiscountPct),
        discount_amount: discountAmount,
        line_total: lineTotal,
        line_margin_pct: lineMargin
      };
    });

    const taxAmount = (newSubtotal - newTotalDiscount) * 0.18;
    newTotal = (newSubtotal - newTotalDiscount) + taxAmount;
  }

  const totalCost = items.reduce((acc, it) => acc + (parseFloat(it.unit_cost) * it.quantity), 0);
  const revenueBeforeTax = newTotal / 1.18;
  const grossProfit = revenueBeforeTax - totalCost;
  const grossMarginPct = revenueBeforeTax > 0 ? ((grossProfit / revenueBeforeTax) * 100) : 0;

  // Run dynamic risk assessment with counter-offer flag
  const riskResult = await calculateRiskScore({
    customerTier: quote.customer_tier,
    items,
    grossMarginPct,
    totalAmount: newTotal,
    isCounterOffer: true
  });

  // Update quotation record
  await Quotation.update(quotationId, {
    total_amount: newTotal,
    gross_profit: grossProfit,
    gross_margin_pct: grossMarginPct,
    risk_score: riskResult.riskScore,
    risk_level: riskResult.riskLevel,
    approval_required: riskResult.approvalRequired,
    required_approval_level: riskResult.approvalLevel,
    risk_reasons: riskResult.reasons
  });

  const updatedQuote = await Quotation.findById(quotationId);

  // If risk requires governance approval, autonomously trigger re-approval routing
  let approvalInfo = null;
  if (riskResult.approvalRequired) {
    approvalInfo = await routeQuotationApproval({
      quotation: updatedQuote,
      user,
      isReApproval: true
    });
  } else {
    await Quotation.updateStatus(quotationId, 'NEGOTIATION');
  }

  await sendNotification({
    role: 'SALES_REP',
    title: `Counter-Offer from ${quote.customer_name}`,
    message: `${quote.customer_name} submitted counter-offer of ₹${newTotal.toLocaleString('en-IN')}. Re-approval required: ${riskResult.approvalRequired ? 'YES' : 'NO'}.`,
    link: `/quotations/${quotationId}`
  });

  return {
    negotiationId: negId,
    updatedQuotation: updatedQuote,
    riskResult,
    approvalInfo
  };
}

module.exports = { processCounterOffer };
