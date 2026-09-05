const Approval = require('../models/Approval');
const ApprovalAudit = require('../models/ApprovalAudit');
const Quotation = require('../models/Quotation');
const { processReviewAction } = require('../services/approvalEngine');
const { evaluateDealHealth } = require('../services/dealHealthEngine');

async function getApprovals(req, res, next) {
  try {
    const { status, role } = req.query;
    const approvals = await Approval.findAll({ status, role });
    res.json({
      success: true,
      message: 'Approvals retrieved',
      data: approvals
    });
  } catch (err) {
    next(err);
  }
}

async function getApprovalById(req, res, next) {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval record not found' });
    }

    const quotation = await Quotation.findById(approval.quotation_id);
    const audits = await ApprovalAudit.findByQuotationId(approval.quotation_id);

    res.json({
      success: true,
      message: 'Approval detail retrieved',
      data: {
        approval,
        quotation,
        audits
      }
    });
  } catch (err) {
    next(err);
  }
}

async function approveQuotation(req, res, next) {
  try {
    const { notes } = req.body;
    const result = await processReviewAction({
      approvalId: req.params.id,
      user: req.user,
      action: 'APPROVE',
      notes
    });

    const approval = await Approval.findById(req.params.id);
    await evaluateDealHealth(approval.quotation_id);

    res.json({
      success: true,
      message: 'Quotation approved successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function rejectQuotation(req, res, next) {
  try {
    const { notes } = req.body;
    const result = await processReviewAction({
      approvalId: req.params.id,
      user: req.user,
      action: 'REJECT',
      notes
    });

    const approval = await Approval.findById(req.params.id);
    await evaluateDealHealth(approval.quotation_id);

    res.json({
      success: true,
      message: 'Quotation rejected',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function requestRevision(req, res, next) {
  try {
    const { notes } = req.body;
    const result = await processReviewAction({
      approvalId: req.params.id,
      user: req.user,
      action: 'REVISION_REQUIRED',
      notes
    });

    const approval = await Approval.findById(req.params.id);
    await evaluateDealHealth(approval.quotation_id);

    res.json({
      success: true,
      message: 'Revision requested from sales rep',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function getApprovalAudits(req, res, next) {
  try {
    const audits = await ApprovalAudit.findByQuotationId(req.params.quotationId);
    res.json({
      success: true,
      message: 'Approval audit trail retrieved',
      data: audits
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getApprovals,
  getApprovalById,
  approveQuotation,
  rejectQuotation,
  requestRevision,
  getApprovalAudits
};
