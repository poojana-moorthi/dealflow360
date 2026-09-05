const Quotation = require('../models/Quotation');
const DealHealth = require('../models/DealHealth');
const { query } = require('../config/db');

/**
 * DealFlow360 Deal Health Evaluation Engine
 * Monitors lifecycle velocity, approval latency, governance friction,
 * inventory backorders, and payment compliance.
 */
async function evaluateDealHealth(quotationId) {
  const quote = await Quotation.findById(quotationId);
  if (!quote) return null;

  let score = 100;
  const reasons = [];

  // 1. Age factor
  const createdDate = new Date(quote.created_at);
  const now = new Date();
  const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

  if (ageInDays > 14 && quote.status !== 'COMPLETED') {
    score -= 25;
    reasons.push(`Deal aging: Active for ${ageInDays} days without closing`);
  } else if (ageInDays > 7 && quote.status !== 'COMPLETED') {
    score -= 10;
    reasons.push(`Deal aging: Open for ${ageInDays} days`);
  }

  // 2. Approval delay
  if (quote.status === 'PENDING_APPROVAL' || quote.status === 'RE_APPROVAL_REQUIRED') {
    const approvals = await query(
      'SELECT created_at FROM approvals WHERE quotation_id = ? AND status = "PENDING" ORDER BY id DESC LIMIT 1',
      [quotationId]
    );
    let delayHours = 0;
    if (approvals.length > 0) {
      delayHours = Math.floor((now - new Date(approvals[0].created_at)) / (1000 * 60 * 60));
      if (delayHours > 48) {
        score -= 25;
        reasons.push(`Approval stall: Awaiting management review for ${delayHours} hours`);
      } else if (delayHours > 24) {
        score -= 15;
        reasons.push(`Approval latency: Pending review for ${delayHours} hours`);
      }
    }
  }

  // 3. Discount & Margin risk
  if (quote.risk_score >= 75) {
    score -= 30;
    reasons.push(`Governance friction: Critical risk score (${quote.risk_score}/100)`);
  } else if (quote.risk_score >= 50) {
    score -= 15;
    reasons.push(`Governance review: Elevated risk score (${quote.risk_score}/100)`);
  }

  // 4. Fulfillment / Stock Shortage Risk
  const shortages = await query(
    'SELECT SUM(backorder_quantity) as total_backorder FROM fulfillment_allocations WHERE quotation_id = ?',
    [quotationId]
  );
  let fulfillmentRisk = 'LOW';
  if (shortages[0]?.total_backorder > 0) {
    fulfillmentRisk = 'HIGH';
    score -= 20;
    reasons.push(`Fulfillment bottleneck: ${shortages[0].total_backorder} units on backorder`);
  }

  // 5. Payment status
  const invoices = await query(
    'SELECT status, payment_status, due_date FROM invoices WHERE quotation_id = ?',
    [quotationId]
  );
  let paymentStatus = 'NOT_INVOICED';
  if (invoices.length > 0) {
    const inv = invoices[0];
    paymentStatus = inv.payment_status;
    if (inv.status === 'OVERDUE' || (inv.payment_status === 'UNPAID' && new Date(inv.due_date) < now)) {
      score -= 25;
      reasons.push('Payment delinquency: Associated invoice is overdue');
    }
  }

  score = Math.max(0, Math.min(100, score));

  let status = 'HEALTHY';
  if (score < 40) {
    status = 'CRITICAL';
  } else if (score < 65) {
    status = 'AT_RISK';
  } else if (score < 85) {
    status = 'WATCH';
  }

  if (reasons.length === 0) {
    reasons.push('Quotation velocity is healthy; progressing through operational stages smoothly');
  }

  await DealHealth.upsert(quotationId, {
    health_score: score,
    status,
    quotation_age_days: ageInDays,
    approval_delay_hours: 0,
    discount_risk_level: quote.risk_level,
    fulfillment_risk_level: fulfillmentRisk,
    payment_status: paymentStatus,
    reasons
  });

  return {
    quotationId,
    healthScore: score,
    status,
    reasons
  };
}

module.exports = { evaluateDealHealth };
