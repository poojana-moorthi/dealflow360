const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.use(authenticateToken);

router.get('/', approvalController.getApprovals);
router.get('/:id', approvalController.getApprovalById);
router.get('/quotation/:quotationId/audits', approvalController.getApprovalAudits);
router.post('/:id/approve', authorizeRoles('ADMIN', 'SALES_MANAGER', 'FINANCE'), approvalController.approveQuotation);
router.post('/:id/reject', authorizeRoles('ADMIN', 'SALES_MANAGER', 'FINANCE'), approvalController.rejectQuotation);
router.post('/:id/revision', authorizeRoles('ADMIN', 'SALES_MANAGER', 'FINANCE'), approvalController.requestRevision);

module.exports = router;
