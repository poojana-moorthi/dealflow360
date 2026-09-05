const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', quotationController.getQuotations);
router.get('/:id', quotationController.getQuotationById);
router.post('/', authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER'), quotationController.createQuotation);
router.put('/:id', authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER'), quotationController.updateQuotation);
router.post('/:id/recalculate', quotationController.recalculatePreview);
router.post('/:id/confirm', quotationController.confirmQuotation);
router.post('/:id/upsell', quotationController.getUpsellSuggestions);

module.exports = router;
