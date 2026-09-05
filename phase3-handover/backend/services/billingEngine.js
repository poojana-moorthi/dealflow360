const Subscription = require('../models/Subscription');
const BillingSchedule = require('../models/BillingSchedule');
const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

/**
 * DealFlow360 Hybrid Billing & Subscription Engine
 * Separates ONE_TIME vs RECURRING line items, creates subscriptions,
 * generates forward billing schedules, and computes mid-cycle proration.
 */
async function generateBillingForQuotation(quotationId, user) {
  const quote = await Quotation.findById(quotationId);
  if (!quote) throw new Error('Quotation not found');

  const oneTimeItems = [];
  const recurringItems = [];

  for (const item of quote.items) {
    if (item.billing_type === 'RECURRING') {
      recurringItems.push(item);
    } else {
      oneTimeItems.push(item);
    }
  }

  const result = {
    quotationId,
    invoice: null,
    subscriptions: [],
    schedules: []
  };

  // 1. Generate Invoice for One-Time Items (or full initial charge)
  if (oneTimeItems.length > 0 || quote.total_amount > 0) {
    const oneTimeSubtotal = oneTimeItems.reduce((acc, it) => acc + parseFloat(it.line_total), 0);
    const oneTimeDiscount = oneTimeItems.reduce((acc, it) => acc + parseFloat(it.discount_amount), 0);
    const taxRate = 0.18;
    const oneTimeTax = oneTimeSubtotal * taxRate;
    const oneTimeTotal = oneTimeSubtotal + oneTimeTax;

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    const invoiceId = await Invoice.create({
      invoice_number: invoiceNumber,
      customer_id: quote.customer_id,
      quotation_id: quote.id,
      invoice_date: invoiceDate,
      due_date: dueDate,
      subtotal: oneTimeSubtotal,
      discount: oneTimeDiscount,
      tax: oneTimeTax,
      total: oneTimeTotal,
      status: 'SENT',
      payment_status: 'UNPAID'
    });

    for (const it of oneTimeItems) {
      await Invoice.addItem({
        invoice_id: invoiceId,
        product_id: it.product_id,
        description: `${it.product_name} (${it.sku})`,
        quantity: it.quantity,
        unit_price: it.unit_price,
        line_total: it.line_total,
        billing_type: 'ONE_TIME'
      });
    }

    result.invoice = await Invoice.findById(invoiceId);

    await logAudit({
      user_id: user?.id || quote.user_id,
      role: user?.role || 'SYSTEM',
      action: 'INVOICE_CREATED',
      entity: 'INVOICE',
      entity_id: invoiceId,
      reason: `Invoice generated for quotation ${quote.quotation_number}`
    });
  }

  // 2. Generate Subscriptions & Forward Schedules for Recurring Items
  for (const rec of recurringItems) {
    const subNumber = `SUB-${Date.now().toString().slice(-6)}`;
    const frequency = rec.billing_frequency === 'ONE_TIME' ? 'MONTHLY' : rec.billing_frequency;
    const startDate = new Date().toISOString().split('T')[0];

    // Compute next billing date (30 days for monthly, 90 for quarterly, 365 for yearly)
    const intervalDays = frequency === 'YEARLY' ? 365 : (frequency === 'QUARTERLY' ? 90 : 30);
    const nextDate = new Date(Date.now() + intervalDays * 86400000).toISOString().split('T')[0];

    const subId = await Subscription.create({
      subscription_number: subNumber,
      customer_id: quote.customer_id,
      quotation_id: quote.id,
      product_id: rec.product_id,
      plan_name: rec.product_name,
      frequency,
      unit_price: rec.unit_price,
      quantity: rec.quantity,
      subtotal: rec.line_total,
      start_date: startDate,
      next_billing_date: nextDate,
      status: 'ACTIVE'
    });

    // Create initial 3 cycles of forward billing schedules
    for (let cycle = 1; cycle <= 3; cycle++) {
      const scheduleDate = new Date(Date.now() + (cycle - 1) * intervalDays * 86400000).toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + ((cycle - 1) * intervalDays + 15) * 86400000).toISOString().split('T')[0];

      const schedId = await BillingSchedule.create({
        subscription_id: subId,
        quotation_id: quote.id,
        schedule_date: scheduleDate,
        due_date: dueDate,
        amount: rec.line_total,
        status: cycle === 1 ? 'INVOICED' : 'SCHEDULED'
      });
      result.schedules.push({ id: schedId, scheduleDate, amount: rec.line_total, status: cycle === 1 ? 'INVOICED' : 'SCHEDULED' });
    }

    result.subscriptions.push(await Subscription.findById(subId));
  }

  return result;
}

/**
 * Mid-cycle proration calculator
 * Calculates prorated adjustments when quantity or plan price changes mid-period.
 */
function calculateProration({ totalDaysInCycle = 30, remainingDays, oldQty, newQty, oldPrice, newPrice }) {
  const daysFraction = Math.max(0, Math.min(1, remainingDays / totalDaysInCycle));
  const oldCycleValue = oldQty * oldPrice;
  const newCycleValue = newQty * newPrice;

  const unusedCredit = oldCycleValue * daysFraction;
  const newCharge = newCycleValue * daysFraction;
  const netDelta = newCharge - unusedCredit;

  return {
    totalDaysInCycle,
    remainingDays,
    daysFraction: parseFloat(daysFraction.toFixed(4)),
    unusedCredit: parseFloat(unusedCredit.toFixed(2)),
    newCharge: parseFloat(newCharge.toFixed(2)),
    netAdjustment: parseFloat(netDelta.toFixed(2)),
    actionType: netDelta > 0 ? 'ADDITIONAL_CHARGE' : (netDelta < 0 ? 'CREDIT' : 'NO_CHANGE')
  };
}

module.exports = {
  generateBillingForQuotation,
  calculateProration
};
