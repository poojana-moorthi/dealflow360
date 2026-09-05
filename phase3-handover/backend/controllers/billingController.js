const { generateBillingForQuotation, calculateProration } = require('../services/billingEngine');
const BillingSchedule = require('../models/BillingSchedule');
const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');

async function getBillingByQuotation(req, res, next) {
  try {
    const { quotationId } = req.params;
    const quote = await Quotation.findById(quotationId);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const schedules = await BillingSchedule.findByQuotationId(quotationId);
    const invoices = await Invoice.findAll({ customerId: quote.customer_id });
    const quoteInvoices = invoices.filter(i => i.quotation_id === parseInt(quotationId, 10));

    res.json({
      success: true,
      message: 'Billing information retrieved',
      data: {
        quotation: quote,
        invoices: quoteInvoices,
        schedules
      }
    });
  } catch (err) {
    next(err);
  }
}

async function generateBilling(req, res, next) {
  try {
    const { quotationId } = req.params;
    const result = await generateBillingForQuotation(quotationId, req.user);

    res.status(201).json({
      success: true,
      message: 'Hybrid one-time invoice and subscription schedule generated',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function computeProration(req, res, next) {
  try {
    const { totalDaysInCycle, remainingDays, oldQty, newQty, oldPrice, newPrice } = req.body;
    const proration = calculateProration({
      totalDaysInCycle: parseInt(totalDaysInCycle || 30, 10),
      remainingDays: parseInt(remainingDays || 15, 10),
      oldQty: parseInt(oldQty || 1, 10),
      newQty: parseInt(newQty || 1, 10),
      oldPrice: parseFloat(oldPrice || 0),
      newPrice: parseFloat(newPrice || 0)
    });

    res.json({
      success: true,
      message: 'Proration calculation completed',
      data: proration
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getBillingByQuotation,
  generateBilling,
  computeProration
};
