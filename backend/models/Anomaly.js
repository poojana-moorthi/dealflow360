const { query } = require('../config/db');

class Anomaly {
  static async findAll() {
    return await query(
      `SELECT a.*, q.quotation_number, q.total_amount, c.company_name as customer_name, u.name as sales_rep_name
       FROM anomalies a
       JOIN quotations q ON a.quotation_id = q.id
       JOIN customers c ON q.customer_id = c.id
       JOIN users u ON q.user_id = u.id
       WHERE a.resolved = FALSE
       ORDER BY a.detected_at DESC`
    );
  }

  static async create({ quotation_id, anomaly_type, severity = 'MEDIUM', description }) {
    const result = await query(
      `INSERT INTO anomalies (quotation_id, anomaly_type, severity, description)
       VALUES (?, ?, ?, ?)`,
      [quotation_id, anomaly_type, severity, description]
    );
    return result.insertId;
  }

  static async resolve(id) {
    await query('UPDATE anomalies SET resolved = TRUE, resolved_at = NOW() WHERE id = ?', [id]);
  }
}

module.exports = Anomaly;
