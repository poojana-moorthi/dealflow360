const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

// Internal users only (CUSTOMER cannot access internal dashboards)
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'));

router.get('/summary', dashboardController.getDashboardSummary);
router.get('/health', dashboardController.getDealHealthDashboard);
router.get('/anomalies', dashboardController.getAnomalies);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
