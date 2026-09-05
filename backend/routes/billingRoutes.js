const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/:quotationId', billingController.getBillingByQuotation);
router.post('/:quotationId/generate', authorizeRoles('ADMIN', 'FINANCE', 'SALES_REP'), billingController.generateBilling);
router.post('/proration/calculate', billingController.computeProration);

module.exports = router;
