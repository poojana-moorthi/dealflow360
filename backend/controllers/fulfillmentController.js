const { calculateFulfillmentAllocation, saveFulfillmentPlan, applyManualOverride } = require('../services/fulfillmentEngine');
const FulfillmentAllocation = require('../models/FulfillmentAllocation');
const Quotation = require('../models/Quotation');
const { evaluateDealHealth } = require('../services/dealHealthEngine');

const { query } = require('../config/db');

async function getFulfillmentOverview(req, res, next) {
  try {
    const stock = await query(`
      SELECT 
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        p.name AS product_name,
        p.sku,
        i.quantity AS in_stock,
        i.reserved_quantity AS reserved,
        GREATEST(0, i.quantity - i.reserved_quantity) AS available
      FROM inventory i
      JOIN warehouses w ON i.warehouse_id = w.id
      JOIN products p ON i.product_id = p.id
      WHERE w.is_active = TRUE
      ORDER BY w.priority ASC, p.name ASC
    `);

    const orders = await query(`
      SELECT 
        q.id,
        q.quotation_number,
        c.company_name,
        q.status,
        q.total_amount,
        q.created_at
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      ORDER BY q.id DESC
      LIMIT 20
    `);

    const defaultQuoteId = orders.length > 0 ? orders[0].id : 1;
    let recommendedPlan = null;
    let savedAllocations = [];
    try {
      savedAllocations = await FulfillmentAllocation.findByQuotationId(defaultQuoteId);
      recommendedPlan = await calculateFulfillmentAllocation(defaultQuoteId);
    } catch (e) {
      console.warn('Could not compute default plan:', e.message);
    }

    res.json({
      success: true,
      message: 'Fulfillment overview and live stock retrieved',
      data: {
        stock,
        orders,
        defaultQuoteId,
        savedAllocations,
        recommendedPlan
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getFulfillmentPlan(req, res, next) {
  try {
    const quotationId = req.params.quotationId || '1';
    const existing = await FulfillmentAllocation.findByQuotationId(quotationId);
    const calculated = await calculateFulfillmentAllocation(quotationId);

    const stock = await query(`
      SELECT 
        w.name AS warehouse_name,
        w.code AS warehouse_code,
        p.name AS product_name,
        p.sku,
        i.quantity AS in_stock,
        i.reserved_quantity AS reserved,
        GREATEST(0, i.quantity - i.reserved_quantity) AS available
      FROM inventory i
      JOIN warehouses w ON i.warehouse_id = w.id
      JOIN products p ON i.product_id = p.id
      WHERE w.is_active = TRUE
      ORDER BY w.priority ASC, p.name ASC
    `);

    res.json({
      success: true,
      message: 'Fulfillment allocation retrieved',
      data: {
        quotationId,
        savedAllocations: existing,
        recommendedPlan: calculated,
        stock
      }
    });
  } catch (err) {
    next(err);
  }
}

async function allocateFulfillment(req, res, next) {
  try {
    const { quotationId } = req.params;
    const calculated = await calculateFulfillmentAllocation(quotationId);
    const saved = await saveFulfillmentPlan(quotationId, calculated.allocations);

    await Quotation.updateStatus(quotationId, 'FULFILLING');
    await evaluateDealHealth(quotationId);

    res.json({
      success: true,
      message: 'Warehouse fulfillment split committed successfully',
      data: {
        allocations: saved,
        summary: {
          shipmentCount: calculated.shipmentCount,
          shippingCost: calculated.shippingCost,
          totalBackorders: calculated.totalBackorders
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function overrideAllocation(req, res, next) {
  try {
    const { quotationId } = req.params;
    const { overrides, reason } = req.body;

    if (!overrides || !Array.isArray(overrides)) {
      return res.status(400).json({ success: false, message: 'Overrides array is required' });
    }

    const updated = await applyManualOverride({
      quotationId,
      user: req.user,
      overrides,
      reason: reason || 'Operations priority manual reassignment'
    });

    await evaluateDealHealth(quotationId);

    res.json({
      success: true,
      message: 'Manual warehouse override recorded and applied with audit trail',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFulfillmentOverview,
  getFulfillmentPlan,
  allocateFulfillment,
  overrideAllocation
};
