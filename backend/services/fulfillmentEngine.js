const { query } = require('../config/db');
const FulfillmentAllocation = require('../models/FulfillmentAllocation');
const { logAudit } = require('../utils/auditLogger');

/**
 * DealFlow360 Multi-Warehouse Fulfillment Engine
 * Evaluates stock availability by warehouse priority, computes optimal split,
 * detects stock shortages / backorders, and estimates shipments.
 */
async function calculateFulfillmentAllocation(quotationId) {
  // 1. Get quotation items requiring physical fulfillment (Hardware / deliverable items)
  const items = await query(
    `SELECT qi.*, p.name as product_name, p.sku, p.category
     FROM quotation_items qi
     JOIN products p ON qi.product_id = p.id
     WHERE qi.quotation_id = ? AND p.category = 'Hardware'`,
    [quotationId]
  );

  const warehouses = await query('SELECT * FROM warehouses WHERE is_active = TRUE ORDER BY priority ASC');
  const allocations = [];
  const warehouseShipmentSet = new Set();
  let totalBackorders = 0;

  for (const item of items) {
    let remainingNeeded = item.quantity;
    const requiredQty = item.quantity;

    // Query inventory across warehouses in priority order
    const inventoryRows = await query(
      `SELECT i.*, w.name as warehouse_name, w.code as warehouse_code, w.priority
       FROM inventory i
       JOIN warehouses w ON i.warehouse_id = w.id
       WHERE i.product_id = ? AND w.is_active = TRUE
       ORDER BY w.priority ASC`,
      [item.product_id]
    );

    let allocatedForProduct = 0;

    for (const inv of inventoryRows) {
      if (remainingNeeded <= 0) break;

      const available = Math.max(0, inv.quantity - inv.reserved_quantity);
      if (available > 0) {
        const toTake = Math.min(available, remainingNeeded);
        allocations.push({
          quotation_id: quotationId,
          product_id: item.product_id,
          product_name: item.product_name,
          sku: item.sku,
          warehouse_id: inv.warehouse_id,
          warehouse_name: inv.warehouse_name,
          warehouse_code: inv.warehouse_code,
          quantity: toTake,
          available_stock: available,
          required_quantity: requiredQty,
          backorder_quantity: 0
        });

        warehouseShipmentSet.add(inv.warehouse_id);
        remainingNeeded -= toTake;
        allocatedForProduct += toTake;
      }
    }

    // If still deficit, record backorder
    if (remainingNeeded > 0) {
      totalBackorders += remainingNeeded;
      allocations.push({
        quotation_id: quotationId,
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        warehouse_id: warehouses[0]?.id || 1,
        warehouse_name: `${warehouses[0]?.name || 'Primary'} (Backorder)`,
        warehouse_code: warehouses[0]?.code || 'BACKORDER',
        quantity: 0,
        available_stock: 0,
        required_quantity: requiredQty,
        backorder_quantity: remainingNeeded
      });
    }
  }

  const shipmentCount = warehouseShipmentSet.size;
  const shippingCost = shipmentCount * 2500; // Flat ₹2,500 logistics fee per source warehouse

  return {
    quotationId,
    allocations,
    shipmentCount,
    shippingCost,
    totalBackorders,
    hasShortage: totalBackorders > 0,
    status: totalBackorders > 0 ? 'PARTIALLY_AVAILABLE' : 'FULFILLABLE'
  };
}

/**
 * Save / Commit automatic fulfillment allocation to database
 */
async function saveFulfillmentPlan(quotationId, allocationsPlan) {
  const formatted = allocationsPlan.map(a => ({
    product_id: a.product_id,
    warehouse_id: a.warehouse_id,
    quantity: a.quantity,
    backorder_quantity: a.backorder_quantity || 0,
    is_override: false,
    status: a.backorder_quantity > 0 ? 'CANCELLED' : 'ALLOCATED'
  }));

  return await FulfillmentAllocation.saveAllocations(quotationId, formatted);
}

/**
 * Apply operations user manual override
 */
async function applyManualOverride({ quotationId, user, overrides, reason }) {
  const existing = await FulfillmentAllocation.findByQuotationId(quotationId);

  const formatted = overrides.map(ov => ({
    product_id: ov.product_id,
    warehouse_id: ov.warehouse_id,
    quantity: ov.quantity,
    backorder_quantity: ov.backorder_quantity || 0,
    is_override: true,
    override_by: user.id,
    override_reason: reason,
    status: 'ALLOCATED'
  }));

  const updated = await FulfillmentAllocation.saveAllocations(quotationId, formatted);

  await logAudit({
    user_id: user.id,
    role: user.role,
    action: 'WAREHOUSE_OVERRIDE',
    entity: 'FULFILLMENT',
    entity_id: quotationId,
    reason,
    metadata: {
      original: existing,
      overridden: formatted
    }
  });

  return updated;
}

module.exports = {
  calculateFulfillmentAllocation,
  saveFulfillmentPlan,
  applyManualOverride
};
