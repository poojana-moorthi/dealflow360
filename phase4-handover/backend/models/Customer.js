const { query } = require('../config/db');

class Customer {
  static async findAll() {
    return await query('SELECT * FROM customers ORDER BY company_name ASC');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM customers WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { company_name, contact_name, email, phone, tier, address, city, state, country } = data;
    const result = await query(
      `INSERT INTO customers (company_name, contact_name, email, phone, tier, address, city, state, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name || 'Enterprise Client',
        contact_name || 'Customer Partner',
        email || 'customer@dealflow360.com',
        phone || '+91 9876543210',
        tier || 'BRONZE',
        address || 'Corporate Headquarters',
        city || 'Austin',
        state || 'Texas',
        country || 'United States'
      ]
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
    await query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }
}

module.exports = Customer;
