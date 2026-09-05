const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'));

router.get('/sales', reportController.getSalesReport);
router.get('/margins', reportController.getMarginReport);
router.get('/approvals', reportController.getApprovalReport);
router.get('/fulfillment', reportController.getFulfillmentReport);
router.get('/subscriptions', reportController.getSubscriptionReport);
router.get('/export', reportController.exportReport);

module.exports = router;
