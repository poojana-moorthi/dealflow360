const Approval = require('../models/Approval');
const ApprovalAudit = require('../models/ApprovalAudit');
const Quotation = require('../models/Quotation');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/emailService');

/**
 * DealFlow360 Approval Engine
 * Manages autonomous governance routing, ticket creation, reviewer actions,
 * and immutable audit tracking.
 */
async function routeQuotationApproval({ quotation, user, isReApproval = false }) {
  if (!quotation.approval_required) {
    await Quotation.updateStatus(quotation.id, 'APPROVED');
    await logAudit({
      user_id: user.id,
      role: user.role,
      action: 'QUOTE_AUTO_APPROVED',
      entity: 'QUOTATION',
      entity_id: quotation.id,
      reason: 'No governance violations; auto-approved'
    });
    return { status: 'APPROVED', approvalCreated: false };
  }

  const assignedRole = quotation.required_approval_level === 'FINANCE' ? 'FINANCE' : 'SALES_MANAGER';
  const newStatus = isReApproval ? 'RE_APPROVAL_REQUIRED' : 'PENDING_APPROVAL';

  await Quotation.updateStatus(quotation.id, newStatus);

  const approvalId = await Approval.create({
    quotation_id: quotation.id,
    assigned_to_role: assignedRole,
    reason: isReApproval
      ? 'Automatic re-approval triggered by customer counter-offer exceeding discount limits'
      : `Discount governance violation (Risk Score: ${quotation.risk_score})`
  });

  await ApprovalAudit.create({
    approval_id: approvalId,
    quotation_id: quotation.id,
    user_id: user.id,
    action: isReApproval ? 'REAPPROVAL_CREATED' : 'APPROVAL_CREATED',
    old_value: quotation.status,
    new_value: newStatus,
    reason: quotation.risk_reasons ? JSON.stringify(quotation.risk_reasons) : 'Policy exception'
  });

  await logAudit({
    user_id: user.id,
    role: user.role,
    action: isReApproval ? 'REAPPROVAL_CREATED' : 'APPROVAL_CREATED',
    entity: 'QUOTATION',
    entity_id: quotation.id,
    reason: `Routing to ${assignedRole} due to risk score ${quotation.risk_score}`
  });

  await sendNotification({
    role: assignedRole,
    title: `${isReApproval ? 'Re-Approval' : 'Approval'} Required: ${quotation.quotation_number}`,
    message: `Quotation ${quotation.quotation_number} requires review. Risk score: ${quotation.risk_score}.`,
    link: `/approvals/${approvalId}`
  });

  return {
    status: newStatus,
    approvalId,
    assignedRole,
    approvalCreated: true
  };
}

async function processReviewAction({ approvalId, user, action, notes = '' }) {
  const approval = await Approval.findById(approvalId);
  if (!approval) throw new Error('Approval record not found');

  let newQuoteStatus = 'DRAFT';
  let approvalStatus = 'PENDING';

  if (action === 'APPROVE') {
    approvalStatus = 'APPROVED';
    newQuoteStatus = 'APPROVED';
  } else if (action === 'REJECT') {
    approvalStatus = 'REJECTED';
    newQuoteStatus = 'REJECTED';
  } else if (action === 'REVISION_REQUIRED') {
    approvalStatus = 'REVISION_REQUIRED';
    newQuoteStatus = 'REVISION_REQUIRED';
  } else {
    throw new Error(`Invalid approval action: ${action}`);
  }

  await Approval.updateStatus(approvalId, approvalStatus, user.id, notes);
  await Quotation.updateStatus(approval.quotation_id, newQuoteStatus);

  await ApprovalAudit.create({
    approval_id: approvalId,
    quotation_id: approval.quotation_id,
    user_id: user.id,
    action: `APPROVAL_${approvalStatus}`,
    old_value: approval.status,
    new_value: approvalStatus,
    reason: notes
  });

  await logAudit({
    user_id: user.id,
    role: user.role,
    action: `APPROVAL_${approvalStatus}`,
    entity: 'APPROVAL',
    entity_id: approvalId,
    reason: notes,
    metadata: { quotation_id: approval.quotation_id, quote_number: approval.quotation_number }
  });

  await sendNotification({
    userId: null,
    role: 'SALES_REP',
    title: `Quotation ${approval.quotation_number} ${approvalStatus}`,
    message: `${user.name} marked approval as ${approvalStatus}. Note: ${notes || 'None'}`,
    link: `/quotations/${approval.quotation_id}`
  });

  return {
    approvalId,
    approvalStatus,
    quotationStatus: newQuoteStatus
  };
}

module.exports = {
  routeQuotationApproval,
  processReviewAction
};
