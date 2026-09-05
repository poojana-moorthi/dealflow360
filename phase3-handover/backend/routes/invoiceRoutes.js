const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', authorizeRoles('ADMIN', 'FINANCE'), invoiceController.createInvoice);
router.post('/:id/payments', authorizeRoles('ADMIN', 'FINANCE', 'CUSTOMER'), invoiceController.recordPayment);

module.exports = router;
