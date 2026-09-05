const { query, getConnection } = require('../config/db');

class Quotation {
  static async findAll({ customerId, userId, status } = {}) {
    let sql = `
      SELECT q.*, c.company_name as customer_name, c.tier as customer_tier, u.name as sales_rep_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (customerId) {
      sql += ' AND q.customer_id = ?';
      params.push(customerId);
    }
    if (userId) {
      sql += ' AND q.user_id = ?';
      params.push(userId);
    }
    if (status) {
      sql += ' AND q.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY q.updated_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const quotes = await query(
      `SELECT q.*, c.company_name as customer_name, c.contact_name, c.email as customer_email,
              c.phone as customer_phone, c.tier as customer_tier, c.address as customer_address,
              c.city as customer_city, c.state as customer_state, u.name as sales_rep_name, u.email as sales_rep_email
       FROM quotations q
       JOIN customers c ON q.customer_id = c.id
       JOIN users u ON q.user_id = u.id
       WHERE q.id = ?`,
      [id]
    );
    if (quotes.length === 0) return null;

    const quote = quotes[0];
    const items = await query(
      `SELECT qi.*, p.name as product_name, p.sku, p.category, p.description, p.unit
       FROM quotation_items qi
       JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = ?
       ORDER BY qi.id ASC`,
      [id]
    );

    quote.items = items;
    if (typeof quote.risk_reasons === 'string') {
      try { quote.risk_reasons = JSON.parse(quote.risk_reasons); } catch (e) {}
    }
    return quote;
  }

  static async create(data) {
    const {
      quotation_number, customer_id, user_id, status = 'DRAFT',
      subtotal = 0, total_discount = 0, tax_amount = 0, total_amount = 0, total_cost = 0,
      gross_profit = 0, gross_margin_pct = 0, risk_score = 0, risk_level = 'LOW',
      approval_required = false, required_approval_level = 'NONE',
      risk_reasons = [], notes = '', valid_until = null
    } = data;

    const result = await query(
      `INSERT INTO quotations (
        quotation_number, customer_id, user_id, status,
        subtotal, total_discount, tax_amount, total_amount, total_cost,
        gross_profit, gross_margin_pct, risk_score, risk_level,
        approval_required, required_approval_level, risk_reasons, notes, valid_until
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation_number, customer_id, user_id, status,
        subtotal, total_discount, tax_amount, total_amount, total_cost,
        gross_profit, gross_margin_pct, risk_score, risk_level,
        approval_required, required_approval_level,
        JSON.stringify(risk_reasons), notes, valid_until
      ]
    );

    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      if (key === 'risk_reasons' && typeof val === 'object') {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(val));
      } else {
        fields.push(`${key} = ?`);
        values.push(val);
      }
    }
    values.push(id);
    await query(`UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async updateStatus(id, status) {
    await query('UPDATE quotations SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }
}

module.exports = Quotation;
