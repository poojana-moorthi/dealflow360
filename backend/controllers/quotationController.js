const Quotation = require('../models/Quotation');
const QuotationItem = require('../models/QuotationItem');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const PriceList = require('../models/PriceList');
const { calculateRiskScore } = require('../services/riskScoreEngine');
const { routeQuotationApproval } = require('../services/approvalEngine');
const { getRecommendationsForQuotation } = require('../services/upsellEngine');
const { evaluateDealHealth } = require('../services/dealHealthEngine');
const { logAudit } = require('../utils/auditLogger');

/**
 * Recalculate quotation line items, discounts, taxes, and margins
 */
async function calculateQuotationFinancials(customerTier, rawItems) {
  let subtotal = 0;
  let totalDiscount = 0;
  let totalCost = 0;
  const processedItems = [];

  for (const it of rawItems) {
    const product = await Product.findById(it.product_id);
    if (!product) continue;

    // Determine list price for tier
    const tierPrice = await PriceList.getProductPrice(it.product_id, customerTier);
    const unitPrice = parseFloat(it.unit_price) || tierPrice;
    const unitCost = parseFloat(product.cost);
    const quantity = parseInt(it.quantity, 10) || 1;
    const discountPct = parseFloat(it.discount_pct) || 0;

    const listLineTotal = unitPrice * quantity;
    const discountAmount = listLineTotal * (discountPct / 100);
    const lineTotal = listLineTotal - discountAmount;
    const lineCost = unitCost * quantity;
    const lineProfit = lineTotal - lineCost;
    const lineMarginPct = lineTotal > 0 ? ((lineProfit / lineTotal) * 100) : 0;

    subtotal += listLineTotal;
    totalDiscount += discountAmount;
    totalCost += lineCost;

    processedItems.push({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      sku: product.sku,
      unit: product.unit,
      quantity,
      unit_price: unitPrice,
      unit_cost: unitCost,
      discount_pct: discountPct,
      discount_amount: discountAmount,
      line_total: lineTotal,
      line_margin_pct: parseFloat(lineMarginPct.toFixed(2)),
      billing_type: product.billing_type,
      billing_frequency: it.billing_frequency || (product.billing_type === 'RECURRING' ? 'MONTHLY' : 'ONE_TIME'),
      risk_flag: false,
      risk_reason: null
    });
  }

  const discountedNet = subtotal - totalDiscount;
  const taxRate = 0.18; // Standard 18% GST / VAT
  const taxAmount = discountedNet * taxRate;
  const totalAmount = discountedNet + taxAmount;
  const grossProfit = discountedNet - totalCost;
  const grossMarginPct = discountedNet > 0 ? ((grossProfit / discountedNet) * 100) : 0;

  // Run dynamic blended risk evaluation
  const riskResult = await calculateRiskScore({
    customerTier,
    items: processedItems,
    grossMarginPct,
    totalAmount
  });

  // Flag individual items that triggered violations
  for (const item of processedItems) {
    const violationReason = riskResult.reasons.find(r => r.includes(item.product_name));
    if (violationReason) {
      item.risk_flag = true;
      item.risk_reason = violationReason;
    }
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    total_discount: parseFloat(totalDiscount.toFixed(2)),
    tax_amount: parseFloat(taxAmount.toFixed(2)),
    total_amount: parseFloat(totalAmount.toFixed(2)),
    total_cost: parseFloat(totalCost.toFixed(2)),
    gross_profit: parseFloat(grossProfit.toFixed(2)),
    gross_margin_pct: parseFloat(grossMarginPct.toFixed(2)),
    risk_score: riskResult.riskScore,
    risk_level: riskResult.riskLevel,
    approval_required: riskResult.approvalRequired,
    required_approval_level: riskResult.approvalLevel,
    risk_reasons: riskResult.reasons,
    items: processedItems
  };
}

async function getQuotations(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'CUSTOMER') {
      filter.customerId = req.user.customer_id;
    } else if (req.query.status) {
      filter.status = req.query.status;
    }
    const quotations = await Quotation.findAll(filter);
    res.json({
      success: true,
      message: 'Quotations retrieved',
      data: quotations
    });
  } catch (err) {
    next(err);
  }
}

async function getQuotationById(req, res, next) {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (req.user.role === 'CUSTOMER' && quotation.customer_id !== req.user.customer_id) {
      return res.status(403).json({ success: false, message: 'Forbidden: Access restricted to your own quotations' });
    }

    res.json({
      success: true,
      message: 'Quotation details retrieved',
      data: quotation
    });
  } catch (err) {
    next(err);
  }
}

async function createQuotation(req, res, next) {
  try {
    const { customer_id, items = [], notes = '', valid_until } = req.body;
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const calculated = await calculateQuotationFinancials(customer.tier, items);
    const quotationNumber = `DF360-${Date.now().toString().slice(-4)}`;

    const quoteId = await Quotation.create({
      quotation_number: quotationNumber,
      customer_id,
      user_id: req.user.id,
      status: 'DRAFT',
      subtotal: calculated.subtotal,
      total_discount: calculated.total_discount,
      tax_amount: calculated.tax_amount,
      total_amount: calculated.total_amount,
      total_cost: calculated.total_cost,
      gross_profit: calculated.gross_profit,
      gross_margin_pct: calculated.gross_margin_pct,
      risk_score: calculated.risk_score,
      risk_level: calculated.risk_level,
      approval_required: calculated.approval_required,
      required_approval_level: calculated.required_approval_level,
      risk_reasons: calculated.risk_reasons,
      notes,
      valid_until: valid_until || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });

    await QuotationItem.replaceItems(quoteId, calculated.items);
    await evaluateDealHealth(quoteId);

    await logAudit({
      user_id: req.user.id,
      role: req.user.role,
      action: 'QUOTE_CREATED',
      entity: 'QUOTATION',
      entity_id: quoteId,
      reason: `Quotation ${quotationNumber} created with risk score ${calculated.risk_score}`
    });

    const finalQuote = await Quotation.findById(quoteId);
    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: finalQuote
    });
  } catch (err) {
    next(err);
  }
}

async function updateQuotation(req, res, next) {
  try {
    const quoteId = req.params.id;
    const existing = await Quotation.findById(quoteId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const { items = existing.items, notes, valid_until, customer_id = existing.customer_id } = req.body;
    const customer = await Customer.findById(customer_id);

    const calculated = await calculateQuotationFinancials(customer.tier, items);

    await Quotation.update(quoteId, {
      subtotal: calculated.subtotal,
      total_discount: calculated.total_discount,
      tax_amount: calculated.tax_amount,
      total_amount: calculated.total_amount,
      total_cost: calculated.total_cost,
      gross_profit: calculated.gross_profit,
      gross_margin_pct: calculated.gross_margin_pct,
      risk_score: calculated.risk_score,
      risk_level: calculated.risk_level,
      approval_required: calculated.approval_required,
      required_approval_level: calculated.required_approval_level,
      risk_reasons: calculated.risk_reasons,
      notes: notes !== undefined ? notes : existing.notes,
      valid_until: valid_until || existing.valid_until
    });

    await QuotationItem.replaceItems(quoteId, calculated.items);
    await evaluateDealHealth(quoteId);

    await logAudit({
      user_id: req.user.id,
      role: req.user.role,
      action: 'QUOTE_UPDATED',
      entity: 'QUOTATION',
      entity_id: quoteId,
      reason: 'Quotation items or discounts modified'
    });

    const updated = await Quotation.findById(quoteId);
    res.json({
      success: true,
      message: 'Quotation updated successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

async function recalculatePreview(req, res, next) {
  try {
    const { customer_id, items = [] } = req.body;
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const calculated = await calculateQuotationFinancials(customer.tier, items);
    res.json({
      success: true,
      message: 'Calculation preview completed',
      data: calculated
    });
  } catch (err) {
    next(err);
  }
}

async function confirmQuotation(req, res, next) {
  try {
    const quoteId = req.params.id;
    const quotation = await Quotation.findById(quoteId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // Step: Route via approval engine if governance check requires it
    const routeResult = await routeQuotationApproval({
      quotation,
      user: req.user,
      isReApproval: false
    });

    await evaluateDealHealth(quoteId);

    const updatedQuote = await Quotation.findById(quoteId);
    res.json({
      success: true,
      message: routeResult.approvalCreated
        ? `Governance violation detected: Quotation routed for ${routeResult.assignedRole} approval`
        : 'Quotation confirmed and approved successfully',
      data: {
        quotation: updatedQuote,
        routeResult
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getUpsellSuggestions(req, res, next) {
  try {
    const quoteId = req.params.id;
    const quotation = await Quotation.findById(quoteId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    const recommendations = await getRecommendationsForQuotation({
      quotation,
      items: quotation.items
    });

    res.json({
      success: true,
      message: 'Recommendations generated',
      data: recommendations
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  recalculatePreview,
  confirmQuotation,
  getUpsellSuggestions
};
