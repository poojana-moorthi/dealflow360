const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER'), customerController.createCustomer);
router.put('/:id', authorizeRoles('ADMIN', 'SALES_REP', 'SALES_MANAGER'), customerController.updateCustomer);

module.exports = router;
