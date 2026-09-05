const { query } = require('../config/db');

class DealHealth {
  static async findAll() {
    return await query(
      `SELECT dh.*, q.quotation_number, q.total_amount, q.status as quotation_status,
              c.company_name as customer_name, u.name as sales_rep_name
       FROM deal_health dh
       JOIN quotations q ON dh.quotation_id = q.id
       JOIN customers c ON q.customer_id = c.id
       JOIN users u ON q.user_id = u.id
       ORDER BY dh.health_score ASC`
    );
  }

  static async findByQuotationId(quotationId) {
    const rows = await query('SELECT * FROM deal_health WHERE quotation_id = ?', [quotationId]);
    return rows[0] || null;
  }

  static async upsert(quotationId, data) {
    const { health_score, status, quotation_age_days = 0, approval_delay_hours = 0, discount_risk_level = 'LOW', fulfillment_risk_level = 'LOW', payment_status = 'CURRENT', reasons = [] } = data;
    await query(
      `INSERT INTO deal_health (quotation_id, health_score, status, quotation_age_days, approval_delay_hours, discount_risk_level, fulfillment_risk_level, payment_status, reasons_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         health_score = VALUES(health_score),
         status = VALUES(status),
         quotation_age_days = VALUES(quotation_age_days),
         approval_delay_hours = VALUES(approval_delay_hours),
         discount_risk_level = VALUES(discount_risk_level),
         fulfillment_risk_level = VALUES(fulfillment_risk_level),
         payment_status = VALUES(payment_status),
         reasons_json = VALUES(reasons_json)`,
      [quotationId, health_score, status, quotation_age_days, approval_delay_hours, discount_risk_level, fulfillment_risk_level, payment_status, JSON.stringify(reasons)]
    );
  }
}

module.exports = DealHealth;
