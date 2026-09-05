const { query } = require('../config/db');
const Anomaly = require('../models/Anomaly');

/**
 * DealFlow360 Anomaly Detection Engine
 * Scans quotations and transactions for governance outliers, price gaming,
 * approval delays, and operational friction.
 */
async function scanAndDetectAnomalies() {
  const detected = [];

  // 1. Detect Stalled Deals (> 7 days without transition)
  const stalledQuotes = await query(
    `SELECT id, quotation_number, status, DATEDIFF(NOW(), updated_at) as idle_days
     FROM quotations
     WHERE status IN ('DRAFT', 'PENDING_APPROVAL', 'RE_APPROVAL_REQUIRED', 'SENT')
       AND DATEDIFF(NOW(), updated_at) >= 7`
  );

  for (const q of stalledQuotes) {
    const existing = await query(
      `SELECT id FROM anomalies WHERE quotation_id = ? AND anomaly_type = 'STALLED_DEAL' AND resolved = FALSE`,
      [q.id]
    );
    if (existing.length === 0) {
      await Anomaly.create({
        quotation_id: q.id,
        anomaly_type: 'STALLED_DEAL',
        severity: q.idle_days > 14 ? 'HIGH' : 'MEDIUM',
        description: `Quotation ${q.quotation_number} has remained in '${q.status}' for ${q.idle_days} consecutive days without movement.`
      });
      detected.push(`STALLED_DEAL: ${q.quotation_number}`);
    }
  }

  // 2. Detect Unusual Discounts (> 15% discount on services or subscriptions)
  const discountViolations = await query(
    `SELECT qi.quotation_id, q.quotation_number, p.name as product_name, p.category, qi.discount_pct
     FROM quotation_items qi
     JOIN quotations q ON qi.quotation_id = q.id
     JOIN products p ON qi.product_id = p.id
     WHERE qi.discount_pct >= 18.00`
  );

  for (const dv of discountViolations) {
    const existing = await query(
      `SELECT id FROM anomalies WHERE quotation_id = ? AND anomaly_type = 'UNUSUAL_DISCOUNT' AND resolved = FALSE`,
      [dv.quotation_id]
    );
    if (existing.length === 0) {
      await Anomaly.create({
        quotation_id: dv.quotation_id,
        anomaly_type: 'UNUSUAL_DISCOUNT',
        severity: 'HIGH',
        description: `Unusual discount spike: ${dv.discount_pct}% applied on ${dv.product_name} (${dv.category}) in quote ${dv.quotation_number}.`
      });
      detected.push(`UNUSUAL_DISCOUNT: ${dv.quotation_number}`);
    }
  }

  // 3. Detect Margin Erosion (< 15% margin on confirmed or high-value quotes)
  const erodedQuotes = await query(
    `SELECT id, quotation_number, gross_margin_pct, total_amount
     FROM quotations
     WHERE gross_margin_pct < 15.0 AND total_amount > 200000`
  );

  for (const eq of erodedQuotes) {
    const existing = await query(
      `SELECT id FROM anomalies WHERE quotation_id = ? AND anomaly_type = 'MARGIN_EROSION' AND resolved = FALSE`,
      [eq.id]
    );
    if (existing.length === 0) {
      await Anomaly.create({
        quotation_id: eq.id,
        anomaly_type: 'MARGIN_EROSION',
        severity: 'CRITICAL',
        description: `Critical margin collapse: Quote ${eq.quotation_number} margin is only ${eq.gross_margin_pct}% on value ₹${parseFloat(eq.total_amount).toLocaleString('en-IN')}.`
      });
      detected.push(`MARGIN_EROSION: ${eq.quotation_number}`);
    }
  }

  return detected;
}

module.exports = { scanAndDetectAnomalies };
