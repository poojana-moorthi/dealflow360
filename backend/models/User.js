const { query } = require('../config/db');

class User {
  static async findById(id) {
    const rows = await query('SELECT id, name, email, role, customer_id, phone, is_active, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findByIdentifier(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();

    // 1. Direct exact email match
    let rows = await query('SELECT * FROM users WHERE LOWER(email) = ?', [clean]);
    if (rows.length > 0) return rows[0];

    // 2. Direct exact role match (e.g. 'ADMIN', 'SALES_REP', 'FINANCE', etc.)
    const roleNormalized = clean.toUpperCase().replace(/[\s-]+/g, '_');
    rows = await query('SELECT * FROM users WHERE UPPER(role) = ?', [roleNormalized]);
    if (rows.length > 0) return rows[0];

    // 3. Username / ID without domain (e.g. 'admin', 'sales_rep', 'finance', 'operations', 'customer1', 'customer2', 'customer3')
    rows = await query('SELECT * FROM users WHERE LOWER(email) = ?', [`${clean}@dealflow360.com`]);
    if (rows.length > 0) return rows[0];

    // 4. Aliases
    if (clean === 'manager' || clean === 'salesmanager') {
      rows = await query("SELECT * FROM users WHERE role = 'SALES_MANAGER'");
      if (rows.length > 0) return rows[0];
    }
    if (clean === 'rep' || clean === 'sales' || clean === 'salesrep') {
      rows = await query("SELECT * FROM users WHERE role = 'SALES_REP'");
      if (rows.length > 0) return rows[0];
    }
    if (clean === 'sathish@dealflow360.com' || clean === 'sathish') {
      rows = await query("SELECT * FROM users WHERE id = 2");
      if (rows.length > 0) return rows[0];
    }
    if (clean === 'customer@acme.com' || clean === 'customer') {
      rows = await query("SELECT * FROM users WHERE id = 6");
      if (rows.length > 0) return rows[0];
    }

    // 5. Customer name / number pattern (e.g. 'customer 1', 'customer 2')
    rows = await query('SELECT * FROM users WHERE LOWER(name) = ?', [clean]);
    if (rows.length > 0) return rows[0];

    return null;
  }

  static async updatePassword(id, passwordHash) {
    return await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
  }

  static async create({ name, email, passwordHash, role, customerId = null, phone = null }) {
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role, customer_id, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, customerId, phone]
    );
    return result.insertId;
  }

  static async listAll() {
    return await query('SELECT id, name, email, role, customer_id, phone, is_active, created_at FROM users ORDER BY id ASC');
  }
}

module.exports = User;
