const { query } = require('../config/db');

class Warehouse {
  static async findAll() {
    return await query('SELECT * FROM warehouses WHERE is_active = TRUE ORDER BY priority ASC');
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM warehouses WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

class Inventory {
  static async getProductStock(productId) {
    return await query(
      `SELECT i.*, w.name as warehouse_name, w.code as warehouse_code, w.location, w.priority
       FROM inventory i
       JOIN warehouses w ON i.warehouse_id = w.id
       WHERE i.product_id = ? AND w.is_active = TRUE
       ORDER BY w.priority ASC`,
      [productId]
    );
  }

  static async updateStock(productId, warehouseId, quantity) {
    await query(
      'UPDATE inventory SET quantity = ? WHERE product_id = ? AND warehouse_id = ?',
      [quantity, productId, warehouseId]
    );
  }
}

module.exports = { Warehouse, Inventory };
