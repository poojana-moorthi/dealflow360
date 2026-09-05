const { query } = require('../config/db');

class Negotiation {
  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT n.*, u.name as user_name
       FROM negotiations n
       JOIN users u ON n.user_id = u.id
       WHERE n.quotation_id = ?
       ORDER BY n.created_at ASC`,
      [quotationId]
    );
  }

  static async create(data) {
    const { quotation_id, user_id, role, message_type, counter_price, counter_discount_pct, comment, line_changes_json = null } = data;
    const result = await query(
      `INSERT INTO negotiations (
        quotation_id, user_id, role, message_type,
        counter_price, counter_discount_pct, comment, line_changes_json, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        quotation_id, user_id, role, message_type,
        counter_price || null, counter_discount_pct || null,
        comment, line_changes_json ? JSON.stringify(line_changes_json) : null
      ]
    );
    return result.insertId;
  }
}

module.exports = Negotiation;
