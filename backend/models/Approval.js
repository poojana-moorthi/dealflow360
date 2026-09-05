const { query } = require('../config/db');

class Approval {
  static async findAll({ status, role } = {}) {
    let sql = `
      SELECT a.*, q.quotation_number, q.total_amount, q.risk_score, q.risk_level,
             q.total_discount, q.gross_margin_pct,
             c.company_name as customer_name, c.tier as customer_tier,
             u.name as sales_rep_name, rev.name as reviewer_name
      FROM approvals a
      JOIN quotations q ON a.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      LEFT JOIN users rev ON a.reviewer_id = rev.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (role) {
      sql += ' AND a.assigned_to_role = ?';
      params.push(role);
    }
    sql += ' ORDER BY a.created_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const rows = await query(
      `SELECT a.*, q.quotation_number, q.total_amount, q.risk_score, q.risk_level,
              q.total_discount, q.gross_margin_pct, q.risk_reasons,
              c.company_name as customer_name, c.tier as customer_tier,
              u.name as sales_rep_name, rev.name as reviewer_name
       FROM approvals a
       JOIN quotations q ON a.quotation_id = q.id
       JOIN customers c ON q.customer_id = c.id
       JOIN users u ON q.user_id = u.id
       LEFT JOIN users rev ON a.reviewer_id = rev.id
       WHERE a.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    const approval = rows[0];
    if (typeof approval.risk_reasons === 'string') {
      try { approval.risk_reasons = JSON.parse(approval.risk_reasons); } catch (e) {}
    }
    return approval;
  }

  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT a.*, rev.name as reviewer_name
       FROM approvals a
       LEFT JOIN users rev ON a.reviewer_id = rev.id
       WHERE a.quotation_id = ?
       ORDER BY a.id DESC`,
      [quotationId]
    );
  }

  static async create({ quotation_id, assigned_to_role, reason = null }) {
    const result = await query(
      `INSERT INTO approvals (quotation_id, assigned_to_role, status, reason)
       VALUES (?, ?, 'PENDING', ?)`,
      [quotation_id, assigned_to_role, reason]
    );
    return result.insertId;
  }

  static async updateStatus(id, status, reviewer_id, notes = '') {
    await query(
      `UPDATE approvals
       SET status = ?, reviewer_id = ?, notes = ?, action_timestamp = NOW()
       WHERE id = ?`,
      [status, reviewer_id, notes, id]
    );
    return this.findById(id);
  }
}

module.exports = Approval;
