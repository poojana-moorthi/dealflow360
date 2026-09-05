const { query } = require('../config/db');

class ApprovalAudit {
  static async create({ approval_id = null, quotation_id, user_id, action, old_value = null, new_value = null, reason = null }) {
    const result = await query(
      `INSERT INTO approval_audits (approval_id, quotation_id, user_id, action, old_value, new_value, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [approval_id, quotation_id, user_id, action, old_value, new_value, reason]
    );
    return result.insertId;
  }

  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT aa.*, u.name as user_name, u.role as user_role
       FROM approval_audits aa
       JOIN users u ON aa.user_id = u.id
       WHERE aa.quotation_id = ?
       ORDER BY aa.created_at DESC`,
      [quotationId]
    );
  }
}

module.exports = ApprovalAudit;
