import {
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_APPROVALS,
  INITIAL_AUDIT_EVENTS,
  INITIAL_DISCOUNT_RULES,
  INITIAL_ANOMALIES
} from './salesMockData.js';

class SalesMockService {
  constructor() {
    this.customers = [...INITIAL_CUSTOMERS];
    this.products = [...INITIAL_PRODUCTS];
    this.quotations = [...INITIAL_QUOTATIONS];
    this.approvals = [...INITIAL_APPROVALS];
    this.auditEvents = [...INITIAL_AUDIT_EVENTS];
    this.discountRules = { ...INITIAL_DISCOUNT_RULES };
    this.anomalies = [...INITIAL_ANOMALIES];
    this.currentPersona = {
      role: 'SALES_REP',
      name: 'Alex Morgan',
      title: 'Senior Enterprise Account Executive',
      email: 'sales_rep@dealflow360.com'
    };
  }

  // Persona Management
  setPersona(role) {
    const map = {
      SALES_REP: { role: 'SALES_REP', name: 'Alex Morgan', title: 'Senior Enterprise Account Executive', email: 'sales_rep@dealflow360.com' },
      SALES_MANAGER: { role: 'SALES_MANAGER', name: 'Sarah Connor', title: 'Regional Sales Director', email: 'sales_manager@dealflow360.com' },
      FINANCE: { role: 'FINANCE', name: 'David Miller', title: 'VP of Commercial Finance', email: 'finance@dealflow360.com' },
      ADMIN: { role: 'ADMIN', name: 'System Administrator', title: 'Operations Admin', email: 'admin@dealflow360.com' }
    };
    this.currentPersona = map[role] || map.SALES_REP;
    return this.currentPersona;
  }

  getPersona() {
    return this.currentPersona;
  }

  // Calculations: Pricing, Discounts, Margin, Risk Score
  calculatePricing(items, customerTier = 'Gold') {
    let subtotal = 0;
    let totalDiscountAmount = 0;
    let totalCost = 0;
    let worstViolation = 0;
    let hasViolation = false;

    const tierLimit = this.discountRules.tier_ceilings[customerTier] || 15;

    const calculatedItems = items.map(item => {
      const p = this.products.find(prod => prod.id === parseInt(item.product_id, 10)) || item;
      const qty = parseInt(item.quantity, 10) || 1;
      const unitPrice = parseFloat(item.unit_price || p.unit_price || 0);
      const unitCost = parseFloat(item.unit_cost || p.unit_cost || unitPrice * 0.7);
      const discountPct = parseFloat(item.discount_pct || 0);

      // Line discount ceiling is min(tierLimit, categoryLimit)
      const categoryLimit = this.discountRules.category_ceilings[p.category || 'Hardware'] || 15;
      const allowedDiscount = Math.min(tierLimit, categoryLimit);

      const lineGross = qty * unitPrice;
      const lineDiscountAmount = lineGross * (discountPct / 100);
      const lineFinal = lineGross - lineDiscountAmount;
      const lineTotalCost = qty * unitCost;
      const lineProfit = lineFinal - lineTotalCost;
      const lineMarginPct = lineFinal > 0 ? (lineProfit / lineFinal) * 100 : 0;

      const violation = discountPct > allowedDiscount;
      const overPt = violation ? Math.round(discountPct - allowedDiscount) : 0;

      if (violation && overPt > worstViolation) {
        worstViolation = overPt;
      }
      if (violation) hasViolation = true;

      subtotal += lineGross;
      totalDiscountAmount += lineDiscountAmount;
      totalCost += lineTotalCost;

      return {
        ...item,
        product_name: p.name || item.product_name,
        sku: p.sku || item.sku,
        category: p.category || item.category,
        quantity: qty,
        unit_price: unitPrice,
        unit_cost: unitCost,
        discount_pct: discountPct,
        discount_amount: lineDiscountAmount,
        final_price: lineFinal,
        margin_pct: Math.round(lineMarginPct * 10) / 10,
        allowed_discount: allowedDiscount,
        violation,
        over_pt: overPt
      };
    });

    const finalTotal = subtotal - totalDiscountAmount;
    const tax = finalTotal * 0.0825; // 8.25% standard commercial tax
    const grandTotal = finalTotal + tax;
    const overallProfit = finalTotal - totalCost;
    const grossMarginPct = finalTotal > 0 ? Math.round((overallProfit / finalTotal) * 1000) / 10 : 0;
    const overallDiscountPct = subtotal > 0 ? Math.round((totalDiscountAmount / subtotal) * 1000) / 10 : 0;

    // AI Risk Score Calculation (0-100)
    let discountRisk = 0;
    if (worstViolation > 0) {
      discountRisk = Math.min(40, 15 + worstViolation * 3);
    } else if (overallDiscountPct > 10) {
      discountRisk = 10;
    }

    let marginRisk = 0;
    if (grossMarginPct < 25) {
      marginRisk = 25;
    } else if (grossMarginPct < 30) {
      marginRisk = 15;
    } else {
      marginRisk = 5;
    }

    let dealSizeRisk = 0;
    if (finalTotal > 100000) dealSizeRisk = 15;
    else if (finalTotal > 50000) dealSizeRisk = 10;
    else dealSizeRisk = 5;

    const inactivityRisk = 12; // Standard base factor
    const totalRiskScore = Math.min(100, discountRisk + marginRisk + dealSizeRisk + inactivityRisk);

    let riskLevel = 'LOW RISK';
    if (totalRiskScore >= 70) riskLevel = 'HIGH RISK';
    else if (totalRiskScore >= 40) riskLevel = 'MEDIUM RISK';

    // Governance level determination
    let approvalRequired = false;
    let requiredApprovalLevel = 'SALES_REP';

    if (hasViolation || grossMarginPct < 25 || totalRiskScore >= 70) {
      approvalRequired = true;
      if (totalRiskScore >= 70 || worstViolation > 5 || grossMarginPct < 25) {
        requiredApprovalLevel = 'FINANCE';
      } else {
        requiredApprovalLevel = 'SALES_MANAGER';
      }
    }

    return {
      subtotal: Math.round(subtotal),
      discount_amount: Math.round(totalDiscountAmount),
      final_total: Math.round(finalTotal),
      tax_amount: Math.round(tax),
      grand_total: Math.round(grandTotal),
      gross_margin_pct: grossMarginPct,
      overall_discount_pct: overallDiscountPct,
      worst_violation: worstViolation,
      has_violation: hasViolation,
      items: calculatedItems,
      risk_score: totalRiskScore,
      risk_level: riskLevel,
      risk_breakdown: {
        discount_risk: discountRisk,
        margin_risk: marginRisk,
        deal_size_risk: dealSizeRisk,
        inactivity_risk: inactivityRisk,
        total: totalRiskScore
      },
      approval_required: approvalRequired,
      required_approval_level: requiredApprovalLevel
    };
  }

  // Dashboard Summary Metrics
  getDashboardSummary() {
    const wonQuotations = this.quotations.filter(q => q.status === 'WON' || q.status === 'CONFIRMED');
    const wonRevenue = wonQuotations.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 245000;

    const activeStages = ['DRAFT', 'PENDING APPROVAL', 'NEGOTIATION'];
    const activeDeals = this.quotations.filter(q => activeStages.includes(q.status));
    const pipelineValue = activeDeals.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 680000;

    const avgMargin = Math.round((this.quotations.reduce((acc, q) => acc + (q.gross_margin_pct || 30), 0) / this.quotations.length) * 10) / 10 || 32.4;

    const pendingApprovalsList = this.approvals.filter(a => a.status === 'PENDING');
    const highRiskApprovals = pendingApprovalsList.filter(a => a.risk_score >= 70);

    const criticalDeals = this.quotations.filter(q => q.health_score < 40);
    const atRiskDeals = this.quotations.filter(q => q.health_score >= 40 && q.health_score < 60);

    return {
      metrics: {
        wonRevenue: wonRevenue,
        wonDealsCount: wonQuotations.length || 18,
        wonGrowthPct: 12.4,
        pipelineValue: pipelineValue,
        activeDealsCount: activeDeals.length || 24,
        avgGrossMargin: avgMargin,
        targetMargin: 30.0,
        pendingApprovals: pendingApprovalsList.length || 7,
        highRiskApprovals: highRiskApprovals.length || 3,
        atRiskDeals: atRiskDeals.length + criticalDeals.length || 4,
        criticalDeals: criticalDeals.length || 2
      },
      dealHealthCounts: {
        healthy: this.quotations.filter(q => q.health_score >= 80).length || 12,
        watch: this.quotations.filter(q => q.health_score >= 60 && q.health_score < 80).length || 5,
        atRisk: this.quotations.filter(q => q.health_score >= 40 && q.health_score < 60).length || 4,
        critical: this.quotations.filter(q => q.health_score < 40).length || 2
      },
      anomalies: this.anomalies,
      pendingApprovals: pendingApprovalsList,
      recentQuotations: this.quotations.slice(0, 8),
      auditLogs: this.auditEvents.slice(0, 10)
    };
  }

  // Create Quotation
  createQuotation(data) {
    const customer = this.customers.find(c => c.id === parseInt(data.customer_id, 10)) || this.customers[0];
    const quoteNum = `Q-${100 + this.quotations.length + 1}`;
    const pricing = this.calculatePricing(data.items, customer.tier);

    const isPending = data.submit_for_approval || (pricing.approval_required && data.status !== 'DRAFT');
    const initialStatus = isPending ? 'PENDING APPROVAL' : (data.status || 'DRAFT');

    const newQuote = {
      id: this.quotations.length + 1,
      quotation_number: quoteNum,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_tier: customer.tier,
      total_amount: pricing.grand_total,
      subtotal: pricing.subtotal,
      discount_amount: pricing.discount_amount,
      tax_amount: pricing.tax_amount,
      gross_margin_pct: pricing.gross_margin_pct,
      discount_pct: pricing.overall_discount_pct,
      discount_limit: customer.max_discount || 15,
      stage: initialStatus,
      status: initialStatus,
      health_score: pricing.risk_score >= 70 ? 58 : 88,
      health_status: pricing.risk_score >= 70 ? 'AT RISK' : 'HEALTHY',
      risk_score: pricing.risk_score,
      risk_level: pricing.risk_level,
      approval_required: pricing.approval_required,
      required_approval_level: pricing.required_approval_level,
      owner: this.currentPersona.name,
      created_at: new Date().toISOString(),
      last_activity: 'Just now',
      notes: data.notes || '',
      items: pricing.items,
      risk_breakdown: pricing.risk_breakdown,
      recommendations: pricing.has_violation ? [
        {
          id: `rec-${Date.now()}`,
          title: 'Discount Ceiling Optimization',
          description: `Reduce maximum line discount to ${customer.max_discount}% to protect margin and clear governance automatically.`,
          target_discount: customer.max_discount,
          savings: Math.round(pricing.discount_amount * 0.35)
        }
      ] : []
    };

    this.quotations.unshift(newQuote);

    // If approval required and submitted, add to approvals queue
    if (isPending) {
      const newApproval = {
        id: this.approvals.length + 1,
        quotation_id: newQuote.id,
        quotation_number: newQuote.quotation_number,
        customer_name: newQuote.customer_name,
        value: newQuote.total_amount,
        discount_pct: newQuote.discount_pct,
        margin_pct: newQuote.gross_margin_pct,
        risk_score: newQuote.risk_score,
        risk_level: newQuote.risk_level,
        reason: pricing.has_violation
          ? `Discount exceeds limit (+${pricing.worst_violation}pt)`
          : 'High blended risk score',
        required_role: pricing.required_approval_level,
        stage: pricing.required_approval_level === 'FINANCE' ? 'Finance Review' : 'Sales Manager Review',
        status: 'PENDING',
        requested_by: this.currentPersona.name,
        created_at: new Date().toISOString()
      };
      this.approvals.unshift(newApproval);
    }

    // Log Audit Event
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.auditEvents.unshift({
      id: this.auditEvents.length + 1,
      quote_id: newQuote.id,
      time: nowStr,
      action: isPending ? `Quotation submitted for ${pricing.required_approval_level} approval` : 'Quotation draft saved',
      user: this.currentPersona.name,
      detail: `Total value: $${pricing.grand_total.toLocaleString()} | Margin: ${pricing.gross_margin_pct}% | Risk: ${pricing.risk_score}`
    });

    return newQuote;
  }

  // Update Quotation
  updateQuotation(id, updates) {
    const idx = this.quotations.findIndex(q => q.id === parseInt(id, 10));
    if (idx === -1) return null;

    this.quotations[idx] = { ...this.quotations[idx], ...updates, last_activity: 'Just now' };

    // Also update matching approval status if approved or rejected
    if (updates.status === 'APPROVED' || updates.status === 'REJECTED') {
      const appIdx = this.approvals.findIndex(a => a.quotation_id === parseInt(id, 10));
      if (appIdx !== -1) {
        this.approvals[appIdx].status = updates.status;
        this.approvals[appIdx].stage = updates.status === 'APPROVED' ? 'Approved' : 'Rejected';
      }
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.auditEvents.unshift({
      id: this.auditEvents.length + 1,
      quote_id: parseInt(id, 10),
      time: nowStr,
      action: `Quotation status updated to ${updates.status}`,
      user: this.currentPersona.name,
      detail: updates.notes || `Status transitioned by ${this.currentPersona.role}`
    });

    return this.quotations[idx];
  }

  // Approve / Reject in queue
  resolveApproval(approvalId, decision, reason = '') {
    const app = this.approvals.find(a => a.id === parseInt(approvalId, 10));
    if (!app) return null;

    const newStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    app.status = newStatus;
    app.stage = newStatus === 'APPROVED' ? 'Approved' : 'Rejected';

    // Update quote
    this.updateQuotation(app.quotation_id, {
      status: newStatus,
      stage: newStatus,
      approval_required: false
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.auditEvents.unshift({
      id: this.auditEvents.length + 1,
      quote_id: app.quotation_id,
      time: nowStr,
      action: `Quotation ${decision.toLowerCase()}d by ${this.currentPersona.role}`,
      user: this.currentPersona.name,
      detail: reason || `${decision} recorded with compliance audit log`
    });

    return app;
  }
}

export const salesMockService = new SalesMockService();
export default salesMockService;
