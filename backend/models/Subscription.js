const { query } = require('../config/db');

class Subscription {
  static async findAll({ customerId } = {}) {
    let sql = `
      SELECT s.*, c.company_name as customer_name, p.name as product_name, p.sku, q.quotation_number
      FROM subscriptions s
      JOIN customers c ON s.customer_id = c.id
      JOIN products p ON s.product_id = p.id
      JOIN quotations q ON s.quotation_id = q.id
      WHERE 1=1
    `;
    const params = [];
    if (customerId) {
      sql += ' AND s.customer_id = ?';
      params.push(customerId);
    }
    sql += ' ORDER BY s.created_at DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    const rows = await query(
      `SELECT s.*, c.company_name as customer_name, p.name as product_name, p.sku, q.quotation_number
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN products p ON s.product_id = p.id
       JOIN quotations q ON s.quotation_id = q.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const {
      subscription_number, customer_id, quotation_id, product_id,
      plan_name, frequency, unit_price, quantity, subtotal,
      start_date, next_billing_date, end_date = null, status = 'ACTIVE'
    } = data;

    const result = await query(
      `INSERT INTO subscriptions (
        subscription_number, customer_id, quotation_id, product_id,
        plan_name, frequency, unit_price, quantity, subtotal,
        start_date, next_billing_date, end_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subscription_number, customer_id, quotation_id, product_id,
        plan_name, frequency, unit_price, quantity, subtotal,
        start_date, next_billing_date, end_date, status
      ]
    );
    return result.insertId;
  }

  static async updateStatus(id, status) {
    await query('UPDATE subscriptions SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }
}

module.exports = Subscription;
