const { query } = require('../config/db');

class DiscountRule {
  static async findAll() {
    return await query('SELECT * FROM discount_rules ORDER BY customer_tier, product_category');
  }

  static async getRule(tier, category) {
    const rows = await query(
      'SELECT * FROM discount_rules WHERE customer_tier = ? AND product_category = ?',
      [tier, category]
    );
    return rows[0] || null;
  }

  static async updateRule(id, max_discount_pct, required_approval_level) {
    await query(
      'UPDATE discount_rules SET max_discount_pct = ?, required_approval_level = ? WHERE id = ?',
      [max_discount_pct, required_approval_level, id]
    );
    const rows = await query('SELECT * FROM discount_rules WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = DiscountRule;
