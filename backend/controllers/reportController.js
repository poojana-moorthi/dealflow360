const { query } = require('../config/db');
const { generatePdfSummary } = require('../utils/pdfGenerator');

async function getSalesReport(req, res, next) {
  try {
    const { period, salesRepId, category } = req.query;

    let sql = `
      SELECT q.id, q.quotation_number, q.created_at, q.status, q.subtotal,
             q.total_discount, q.total_amount, q.gross_margin_pct,
             c.company_name as customer_name, c.tier as customer_tier,
             u.name as sales_rep_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (salesRepId) {
      sql += ' AND q.user_id = ?';
      params.push(salesRepId);
    }
    if (period === 'today') {
      sql += ' AND DATE(q.created_at) = CURRENT_DATE';
    } else if (period === 'this_week') {
      sql += ' AND YEARWEEK(q.created_at, 1) = YEARWEEK(CURRENT_DATE, 1)';
    } else if (period === 'this_month') {
      sql += ' AND MONTH(q.created_at) = MONTH(CURRENT_DATE) AND YEAR(q.created_at) = YEAR(CURRENT_DATE)';
    }

    sql += ' ORDER BY q.created_at DESC';
    const rows = await query(sql, params);

    const totalRevenue = rows.reduce((acc, r) => acc + (r.status === 'CONFIRMED' || r.status === 'COMPLETED' ? parseFloat(r.total_amount) : 0), 0);
    const totalPipeline = rows.reduce((acc, r) => acc + parseFloat(r.total_amount), 0);
    const avgDiscountPct = rows.length > 0
      ? (rows.reduce((acc, r) => acc + (parseFloat(r.total_discount) / (parseFloat(r.subtotal) || 1) * 100), 0) / rows.length).toFixed(2)
      : 0;

    res.json({
      success: true,
      message: 'Sales report retrieved',
      data: {
        summary: {
          totalRevenue,
          totalPipeline,
          totalDeals: rows.length,
          avgDiscountPct: parseFloat(avgDiscountPct)
        },
        records: rows
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMarginReport(req, res, next) {
  try {
    const rows = await query(`
      SELECT p.category,
             COUNT(qi.id) as line_count,
             COALESCE(SUM(qi.line_total), 0) as total_revenue,
             COALESCE(SUM(qi.unit_cost * qi.quantity), 0) as total_cost,
             COALESCE(AVG(qi.line_margin_pct), 0) as avg_margin_pct
      FROM quotation_items qi
      JOIN products p ON qi.product_id = p.id
      GROUP BY p.category
    `);

    res.json({
      success: true,
      message: 'Margin analysis report retrieved',
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

async function getApprovalReport(req, res, next) {
  try {
    const rows = await query(`
      SELECT a.status,
             COUNT(*) as count,
             a.assigned_to_role,
             COALESCE(AVG(q.risk_score), 0) as avg_risk_score
      FROM approvals a
      JOIN quotations q ON a.quotation_id = q.id
      GROUP BY a.status, a.assigned_to_role
    `);

    res.json({
      success: true,
      message: 'Approval performance report retrieved',
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

async function getFulfillmentReport(req, res, next) {
  try {
    const warehouseStock = await query(`
      SELECT w.name as warehouse_name, w.code, w.location,
             COALESCE(SUM(i.quantity), 0) as total_stock,
             COALESCE(SUM(i.reserved_quantity), 0) as reserved_stock
      FROM warehouses w
      LEFT JOIN inventory i ON w.id = i.warehouse_id
      GROUP BY w.id
    `);

    const allocationStats = await query(`
      SELECT status, COUNT(*) as count, SUM(quantity) as total_qty, SUM(backorder_quantity) as backorder_qty
      FROM fulfillment_allocations
      GROUP BY status
    `);

    res.json({
      success: true,
      message: 'Fulfillment operations report retrieved',
      data: {
        warehouseStock,
        allocationStats
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionReport(req, res, next) {
  try {
    const rows = await query(`
      SELECT frequency,
             status,
             COUNT(*) as active_sub_count,
             COALESCE(SUM(subtotal), 0) as recurring_mrr
      FROM subscriptions
      GROUP BY frequency, status
    `);

    res.json({
      success: true,
      message: 'Subscription ARR/MRR report retrieved',
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

async function exportReport(req, res, next) {
  try {
    const { type = 'sales', format = 'pdf' } = req.query;
    const records = await query('SELECT quotation_number, total_amount, status, created_at FROM quotations LIMIT 25');
    const result = generatePdfSummary({
      title: `DealFlow360_${type.toUpperCase()}_REPORT`,
      data: records,
      headers: ['Quotation Number', 'Total Amount', 'Status', 'Date']
    });

    res.json({
      success: true,
      message: `Export prepared for format: ${format.toUpperCase()}`,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSalesReport,
  getMarginReport,
  getApprovalReport,
  getFulfillmentReport,
  getSubscriptionReport,
  exportReport
};
