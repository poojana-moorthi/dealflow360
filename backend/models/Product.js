const { query } = require('../config/db');

class Product {
  static async findAll({ activeOnly = false } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM products WHERE is_active = TRUE ORDER BY name ASC'
      : 'SELECT * FROM products ORDER BY name ASC';
    return await query(sql);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { name, sku, category, description, unit, price, cost, tax_rate, billing_type } = data;
    const result = await query(
      `INSERT INTO products (name, sku, category, description, unit, price, cost, tax_rate, billing_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, category, description, unit || 'Unit', price, cost, tax_rate || 18.0, billing_type || 'ONE_TIME']
    );
    return result.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, val] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(val);
    }
    values.push(id);
    await query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  static async delete(id) {
    return await query('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
  }
}

module.exports = Product;
