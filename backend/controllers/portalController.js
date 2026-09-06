const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Quotation = require('../models/Quotation');
const Negotiation = require('../models/Negotiation');
const { generateToken } = require('../config/jwt');
const { processCounterOffer } = require('../services/negotiationEngine');
const { generateBillingForQuotation } = require('../services/billingEngine');
const { evaluateDealHealth } = require('../services/dealHealthEngine');
const { logAudit } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/emailService');

async function portalLogin(req, res, next) {
  try {
    const { email, identifier, password } = req.body;
    const searchKey = (email || identifier || '').trim();
    const user = await User.findByIdentifier(searchKey);

    if (!user || user.role !== 'CUSTOMER') {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials or account does not have portal access'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid customer credentials'
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Resolve company name
    let companyName = 'Acme Corporation';
    if (user.customer_id) {
      try {
        const { query } = require('../config/db');
        const custRows = await query('SELECT company_name FROM customers WHERE id = ?', [user.customer_id]);
        if (custRows && custRows.length > 0 && custRows[0].company_name) {
          companyName = custRows[0].company_name;
        }
      } catch (custErr) {
        // Use default
      }
    }

    await logAudit({
      user_id: user.id,
      role: user.role,
      action: 'LOGIN',
      entity: 'PORTAL',
      entity_id: user.customer_id,
      reason: 'Customer portal login'
    });

    res.json({
      success: true,
      message: 'Customer authenticated',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          customerId: user.customer_id,
          companyName: companyName
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getPortalQuotations(req, res, next) {
  try {
    const customerId = req.user.customer_id;
    const quotes = await Quotation.findAll({ customerId });
    res.json({
      success: true,
      message: 'Customer quotations retrieved',
      data: quotes
    });
  } catch (err) {
    next(err);
  }
}

async function getPortalQuotationDetail(req, res, next) {
  try {
    const quote = await Quotation.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (req.user.customer_id && quote.customer_id && quote.customer_id !== req.user.customer_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access restricted' });
    }

    const negotiations = await Negotiation.findByQuotationId(req.params.id);

    // Filter out internal sensitive fields (e.g. unit cost and internal profit margin)
    const sanitizedItems = quote.items.map(it => ({
      id: it.id,
      product_id: it.product_id,
      product_name: it.product_name,
      sku: it.sku,
      category: it.category,
      quantity: it.quantity,
      unit_price: it.unit_price,
      discount_pct: it.discount_pct,
      line_total: it.line_total,
      billing_type: it.billing_type,
      billing_frequency: it.billing_frequency
    }));

    res.json({
      success: true,
      message: 'Quotation details retrieved',
      data: {
        id: quote.id,
        quotation_number: quote.quotation_number,
        customer_name: quote.customer_name,
        sales_rep_name: quote.sales_rep_name,
        sales_rep_email: quote.sales_rep_email,
        status: quote.status,
        subtotal: quote.subtotal,
        total_discount: quote.total_discount,
        tax_amount: quote.tax_amount,
        total_amount: quote.total_amount,
        valid_until: quote.valid_until,
        items: sanitizedItems,
        negotiations
      }
    });
  } catch (err) {
    next(err);
  }
}

async function submitNegotiation(req, res, next) {
  try {
    const quotationId = req.params.id;
    const { counterPrice, counterDiscountPct, comment, lineChanges } = req.body;

    const result = await processCounterOffer({
      quotationId,
      user: req.user,
      counterPrice,
      counterDiscountPct,
      comment: comment || 'Customer submitted counter-offer',
      lineChanges
    });

    await evaluateDealHealth(quotationId);

    res.json({
      success: true,
      message: result.approvalInfo?.approvalCreated
        ? 'Counter offer submitted. Price requires management re-approval.'
        : 'Counter offer submitted to sales representative.',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function confirmQuotationByCustomer(req, res, next) {
  try {
    const quoteId = req.params.id;
    const quote = await Quotation.findById(quoteId);
    if (!quote || quote.customer_id !== req.user.customer_id) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    await Quotation.updateStatus(quoteId, 'CONFIRMED');

    // Automatically trigger hybrid billing engine upon customer confirmation!
    const billingResult = await generateBillingForQuotation(quoteId, req.user);
    await evaluateDealHealth(quoteId);

    await logAudit({
      user_id: req.user.id,
      role: req.user.role,
      action: 'QUOTE_CONFIRMED_BY_CUSTOMER',
      entity: 'QUOTATION',
      entity_id: quoteId,
      reason: 'Customer accepted terms and confirmed order through portal'
    });

    await sendNotification({
      role: 'SALES_REP',
      title: `Order Confirmed: ${quote.quotation_number}`,
      message: `${quote.customer_name} has officially accepted and confirmed quotation ${quote.quotation_number}.`,
      link: `/quotations/${quoteId}`
    });

    res.json({
      success: true,
      message: 'Quotation confirmed! Invoice and billing schedule generated.',
      data: {
        quotationId: quoteId,
        status: 'CONFIRMED',
        billingResult
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  portalLogin,
  getPortalQuotations,
  getPortalQuotationDetail,
  submitNegotiation,
  confirmQuotationByCustomer
};
