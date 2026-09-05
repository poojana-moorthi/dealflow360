const express = require('express');
const router = express.Router();
const portalController = require('../controllers/portalController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

// Customer Portal Authentication
router.post('/login', portalController.portalLogin);

// Customer Protected Routes
router.get('/quotations', authenticateToken, authorizeRoles('CUSTOMER'), portalController.getPortalQuotations);
router.get('/quotations/:id', authenticateToken, authorizeRoles('CUSTOMER'), portalController.getPortalQuotationDetail);
router.post('/quotations/:id/negotiate', authenticateToken, authorizeRoles('CUSTOMER'), portalController.submitNegotiation);
router.post('/quotations/:id/confirm', authenticateToken, authorizeRoles('CUSTOMER'), portalController.confirmQuotationByCustomer);

module.exports = router;
