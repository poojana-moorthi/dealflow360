const { query } = require('../config/db');

class PriceList {
  static async findByTier(tier) {
    return await query(
      `SELECT pl.*, p.name as product_name, p.sku, p.category, p.billing_type
       FROM price_lists pl
       JOIN products p ON pl.product_id = p.id
       WHERE pl.customer_tier = ? AND pl.is_active = TRUE`,
      [tier]
    );
  }

  static async getProductPrice(productId, tier) {
    const rows = await query(
      `SELECT price FROM price_lists WHERE product_id = ? AND customer_tier = ? AND is_active = TRUE`,
      [productId, tier]
    );
    if (rows.length > 0) return parseFloat(rows[0].price);

    // Fallback to base product price
    const prods = await query('SELECT price FROM products WHERE id = ?', [productId]);
    return prods.length > 0 ? parseFloat(prods[0].price) : 0;
  }
}

module.exports = PriceList;
