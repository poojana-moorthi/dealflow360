const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', productController.getProducts);
router.get('/discount-rules', productController.getDiscountRules);
router.put('/discount-rules/:id', authorizeRoles('ADMIN'), productController.updateDiscountRule);
router.get('/tier-pricing/:tier', productController.getTierPricing);
router.get('/:id', productController.getProductById);
router.post('/', authorizeRoles('ADMIN'), productController.createProduct);
router.put('/:id', authorizeRoles('ADMIN'), productController.updateProduct);
router.delete('/:id', authorizeRoles('ADMIN'), productController.deleteProduct);

module.exports = router;
