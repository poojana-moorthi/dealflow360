const { query } = require('../config/db');

class QuotationItem {
  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT qi.*, p.name as product_name, p.sku, p.category, p.description
       FROM quotation_items qi
       JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = ?
       ORDER BY qi.id ASC`,
      [quotationId]
    );
  }

  static async replaceItems(quotationId, items) {
    // Delete existing items
    await query('DELETE FROM quotation_items WHERE quotation_id = ?', [quotationId]);

    if (!items || items.length === 0) return [];

    for (const item of items) {
      await query(
        `INSERT INTO quotation_items (
          quotation_id, product_id, quantity, unit_price, unit_cost,
          discount_pct, discount_amount, line_total, line_margin_pct,
          billing_type, billing_frequency, risk_flag, risk_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.unit_cost || 0,
          item.discount_pct || 0,
          item.discount_amount || 0,
          item.line_total,
          item.line_margin_pct || 0,
          item.billing_type || 'ONE_TIME',
          item.billing_frequency || 'ONE_TIME',
          item.risk_flag ? 1 : 0,
          item.risk_reason || null
        ]
      );
    }

    return this.findByQuotationId(quotationId);
  }
}

module.exports = QuotationItem;
