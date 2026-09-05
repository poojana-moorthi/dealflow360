const express = require('express');
const router = express.Router();
const fulfillmentController = require('../controllers/fulfillmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', fulfillmentController.getFulfillmentOverview);
router.get('/:quotationId', fulfillmentController.getFulfillmentPlan);
router.post('/:quotationId/allocate', authorizeRoles('ADMIN', 'OPERATIONS', 'SALES_REP', 'SALES_MANAGER', 'FINANCE'), fulfillmentController.allocateFulfillment);
router.post('/:quotationId/override', authorizeRoles('ADMIN', 'OPERATIONS', 'SALES_REP', 'SALES_MANAGER', 'FINANCE'), fulfillmentController.overrideAllocation);

module.exports = router;
