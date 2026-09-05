const { query } = require('../config/db');
const DealHealth = require('../models/DealHealth');
const Anomaly = require('../models/Anomaly');
const { scanAndDetectAnomalies } = require('../services/anomalyEngine');

async function getDashboardSummary(req, res, next) {
  try {
    // 1. Total Pipeline and Revenue
    const [revenueStats] = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'CONFIRMED' OR status = 'COMPLETED' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(total_amount), 0) as pipeline_value,
        COUNT(*) as total_quotations,
        COUNT(CASE WHEN status = 'CONFIRMED' OR status = 'COMPLETED' THEN 1 END) as won_deals,
        COUNT(CASE WHEN status = 'PENDING_APPROVAL' OR status = 'RE_APPROVAL_REQUIRED' THEN 1 END) as pending_approvals,
        COALESCE(AVG(gross_margin_pct), 0) as avg_gross_margin
      FROM quotations
    `);

    // 2. Risk & At-Risk Deals
    const [riskStats] = await query(`
      SELECT
        COUNT(CASE WHEN risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) as high_risk_deals,
        COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as critical_deals
      FROM quotations
    `);

    // 3. Recent Quotations
    const recentQuotations = await query(`
      SELECT q.id, q.quotation_number, q.status, q.total_amount, q.gross_margin_pct,
             q.risk_score, q.risk_level, q.created_at,
             c.company_name as customer_name, u.name as sales_rep_name
      FROM quotations q
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      ORDER BY q.updated_at DESC
      LIMIT 5
    `);

    // 4. Pending Approvals queue
    const pendingApprovals = await query(`
      SELECT a.id, a.quotation_id, a.assigned_to_role, a.status, a.reason, a.created_at,
             q.quotation_number, q.total_amount, q.risk_score, q.risk_level,
             c.company_name as customer_name, u.name as sales_rep_name
      FROM approvals a
      JOIN quotations q ON a.quotation_id = q.id
      JOIN customers c ON q.customer_id = c.id
      JOIN users u ON q.user_id = u.id
      WHERE a.status = 'PENDING'
      ORDER BY a.created_at ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      message: 'Dashboard summary retrieved',
      data: {
        metrics: {
          totalRevenue: parseFloat(revenueStats.total_revenue),
          pipelineValue: parseFloat(revenueStats.pipeline_value),
          totalQuotations: parseInt(revenueStats.total_quotations, 10),
          wonDeals: parseInt(revenueStats.won_deals, 10),
          pendingApprovals: parseInt(revenueStats.pending_approvals, 10),
          avgGrossMargin: parseFloat(parseFloat(revenueStats.avg_gross_margin).toFixed(2)),
          highRiskDeals: parseInt(riskStats.high_risk_deals, 10),
          criticalDeals: parseInt(riskStats.critical_deals, 10)
        },
        recentQuotations,
        pendingApprovals
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getDealHealthDashboard(req, res, next) {
  try {
    const deals = await DealHealth.findAll();
    const anomalies = await Anomaly.findAll();

    const counts = {
      healthy: deals.filter(d => d.status === 'HEALTHY').length,
      watch: deals.filter(d => d.status === 'WATCH').length,
      at_risk: deals.filter(d => d.status === 'AT_RISK').length,
      critical: deals.filter(d => d.status === 'CRITICAL').length
    };

    res.json({
      success: true,
      message: 'Deal health metrics retrieved',
      data: {
        counts,
        deals,
        anomalies
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getAnomalies(req, res, next) {
  try {
    // Proactively scan for new anomalies
    await scanAndDetectAnomalies();
    const anomalies = await Anomaly.findAll();
    res.json({
      success: true,
      message: 'Detected anomalies retrieved',
      data: anomalies
    });
  } catch (err) {
    next(err);
  }
}

async function getRecentActivity(req, res, next) {
  try {
    const logs = await query(`
      SELECT al.*, u.name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `);
    res.json({
      success: true,
      message: 'Recent audit activity retrieved',
      data: logs
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardSummary,
  getDealHealthDashboard,
  getAnomalies,
  getRecentActivity
};
