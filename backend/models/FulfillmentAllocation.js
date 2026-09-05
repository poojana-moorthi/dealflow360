const { query } = require('../config/db');

class FulfillmentAllocation {
  static async findByQuotationId(quotationId) {
    return await query(
      `SELECT fa.*, p.name as product_name, p.sku, w.name as warehouse_name, w.code as warehouse_code,
              u.name as override_by_name
       FROM fulfillment_allocations fa
       JOIN products p ON fa.product_id = p.id
       JOIN warehouses w ON fa.warehouse_id = w.id
       LEFT JOIN users u ON fa.override_by = u.id
       WHERE fa.quotation_id = ?
       ORDER BY p.name ASC, w.priority ASC`,
      [quotationId]
    );
  }

  static async saveAllocations(quotationId, allocations) {
    await query('DELETE FROM fulfillment_allocations WHERE quotation_id = ?', [quotationId]);
    for (const item of allocations) {
      await query(
        `INSERT INTO fulfillment_allocations (
          quotation_id, product_id, warehouse_id, quantity, backorder_quantity,
          is_override, override_by, override_reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId, item.product_id, item.warehouse_id, item.quantity,
          item.backorder_quantity || 0, item.is_override ? 1 : 0,
          item.override_by || null, item.override_reason || null,
          item.status || 'ALLOCATED'
        ]
      );
    }
    return this.findByQuotationId(quotationId);
  }
}

module.exports = FulfillmentAllocation;
