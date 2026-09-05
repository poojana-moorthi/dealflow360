const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const { evaluateDealHealth } = require('../services/dealHealthEngine');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/emailService');

async function getInvoices(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user.customer_id;
    }
    const invoices = await Invoice.findAll(filter);
    res.json({
      success: true,
      message: 'Invoices retrieved',
      data: invoices
    });
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (req.user.role === 'CUSTOMER' && invoice.customer_id !== req.user.customer_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access restricted to your own invoice' });
    }

    res.json({
      success: true,
      message: 'Invoice detail retrieved',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
}

async function createInvoice(req, res, next) {
  try {
    const id = await Invoice.create(req.body);
    const invoice = await Invoice.findById(id);
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const invoiceId = req.params.id;
    const { amount, payment_date, payment_method, transaction_reference, notes } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payId = await Payment.create({
      invoice_id: invoiceId,
      amount: parseFloat(amount),
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      payment_method: payment_method || 'BANK_TRANSFER',
      transaction_reference: transaction_reference || `TXN-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Invoice payment settled'
    });

    const updatedInvoice = await Invoice.updatePaymentStatus(invoiceId, amount);
    if (invoice.quotation_id) {
      await evaluateDealHealth(invoice.quotation_id);
    }

    await logAudit({
      user_id: req.user.id,
      role: req.user.role,
      action: 'PAYMENT_RECORDED',
      entity: 'INVOICE',
      entity_id: invoiceId,
      reason: `Payment of ₹${parseFloat(amount).toLocaleString('en-IN')} received. Invoice status now: ${updatedInvoice.status}`,
      metadata: { transaction_reference, payment_method, amount }
    });

    await sendNotification({
      role: 'FINANCE',
      title: `Payment Received for ${invoice.invoice_number}`,
      message: `Invoice ${invoice.invoice_number} received payment of ₹${parseFloat(amount).toLocaleString('en-IN')}. Current status: ${updatedInvoice.status}.`,
      link: `/invoices/${invoiceId}`
    });

    res.status(201).json({
      success: true,
      message: `Payment recorded successfully. Invoice status: ${updatedInvoice.status}`,
      data: {
        paymentId: payId,
        invoice: updatedInvoice
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  recordPayment
};
