const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validateBody } = require('../middlewares/validationMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
