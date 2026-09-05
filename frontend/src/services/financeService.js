import salesMockService from './salesMockService';

export const INITIAL_SUBSCRIPTIONS = [
  { id: 1, quotation_id: 1, customer_name: 'Acme Corp', plan_name: 'Care Plan 2yr', cycle: 'Monthly', amount: 46, next_bill: 'Sep 15, 2026', status: 'Active', created_at: '2026-08-15', auto_debit: true },
  { id: 2, quotation_id: 2, customer_name: 'Beta Industries', plan_name: 'Support SLA 24/7', cycle: 'Quarterly', amount: 900, next_bill: 'Nov 1, 2026', status: 'Active', created_at: '2026-08-01', auto_debit: true },
  { id: 3, quotation_id: 6, customer_name: 'Delta Logistics LLC', plan_name: 'Care Plan 1yr', cycle: 'Monthly', amount: 40, next_bill: '—', status: 'Paused', created_at: '2026-07-20', auto_debit: false },
  { id: 4, quotation_id: 4, customer_name: 'Zenith Health Systems', plan_name: 'Managed Security Suite (50 Seats)', cycle: 'Monthly', amount: 1250, next_bill: 'Sep 20, 2026', status: 'Active', created_at: '2026-08-20', auto_debit: true },
  { id: 5, quotation_id: 5, customer_name: 'Apex Global Capital', plan_name: 'Executive Enterprise SLA Dedicated', cycle: 'Monthly', amount: 3600, next_bill: 'Oct 1, 2026', status: 'Active', created_at: '2026-08-10', auto_debit: true },
  { id: 6, quotation_id: 8, customer_name: 'Pinnacle Manufacturing', plan_name: 'Legacy Cloud Backup Tier 1', cycle: 'Monthly', amount: 180, next_bill: '—', status: 'Cancelled', created_at: '2026-06-15', auto_debit: false },
  { id: 7, quotation_id: 9, customer_name: 'Horizon Energy Group', plan_name: 'Dedicated Cloud Architecture Retainer', cycle: 'Monthly', amount: 2500, next_bill: 'Sep 30, 2026', status: 'Active', created_at: '2026-08-28', auto_debit: true },
  { id: 8, quotation_id: 10, customer_name: 'Omni Retail Ventures', plan_name: 'Managed Endpoint Security Suite', cycle: 'Monthly', amount: 1250, next_bill: 'Oct 5, 2026', status: 'Active', created_at: '2026-08-25', auto_debit: true }
];

export const INITIAL_INVOICES = [
  {
    id: 1,
    invoice_number: 'INV-1042',
    quotation_id: 1,
    customer_name: 'Acme Corp',
    total_amount: 2730,
    paid_amount: 0,
    status: 'UNPAID',
    issue_date: '2026-08-26',
    due_date: '2026-09-10',
    billing_terms: 'Net 15',
    items: [
      { description: 'Laptop Pro 14 (x2)', amount: 2280 },
      { description: 'Onsite Deployment & Setup (x1)', amount: 450 }
    ],
    payments: []
  },
  {
    id: 2,
    invoice_number: 'INV-1043',
    quotation_id: 1,
    customer_name: 'Acme Corp',
    total_amount: 46,
    paid_amount: 46,
    status: 'PAID',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    billing_terms: 'Immediate (Auto-debit)',
    items: [
      { description: 'Care Plan 2yr - Recurring Monthly', amount: 46 }
    ],
    payments: [
      { date: '2026-09-01', amount: 46, method: 'Credit Card (Stripe Autopay)', ref: 'CH-99201' }
    ]
  },
  {
    id: 3,
    invoice_number: 'INV-1038',
    quotation_id: 2,
    customer_name: 'Nova Technologies',
    total_amount: 9750,
    paid_amount: 9750,
    status: 'PAID',
    issue_date: '2026-08-15',
    due_date: '2026-08-30',
    billing_terms: 'Net 15',
    items: [
      { description: 'Thunderbolt Docking Station (x25)', amount: 7000 },
      { description: 'Executive Architecture Consulting', amount: 2750 }
    ],
    payments: [
      { date: '2026-08-28', amount: 9750, method: 'Bank Wire Transfer', ref: 'WIRE-88310' }
    ]
  },
  {
    id: 4,
    invoice_number: 'INV-1044',
    quotation_id: 6,
    customer_name: 'Delta Logistics LLC',
    total_amount: 32400,
    paid_amount: 0,
    status: 'OVERDUE',
    issue_date: '2026-07-31',
    due_date: '2026-08-15',
    billing_terms: 'Net 15',
    items: [
      { description: 'Enterprise Workstation Z8 (x6)', amount: 27000 },
      { description: 'Onsite Deployment & Integration', amount: 5400 }
    ],
    payments: []
  },
  {
    id: 5,
    invoice_number: 'INV-1045',
    quotation_id: 4,
    customer_name: 'Zenith Health Systems',
    total_amount: 64500,
    paid_amount: 30000,
    status: 'PARTIALLY_PAID',
    issue_date: '2026-08-25',
    due_date: '2026-09-25',
    billing_terms: 'Net 30',
    items: [
      { description: 'Server Rackmount Node 2U (x8)', amount: 54400 },
      { description: 'Data Migration & Pipeline Integration', amount: 10100 }
    ],
    payments: [
      { date: '2026-08-30', amount: 30000, method: 'ACH Transfer', ref: 'ACH-44102' }
    ]
  },
  {
    id: 6,
    invoice_number: 'INV-1046',
    quotation_id: 5,
    customer_name: 'Apex Global Capital',
    total_amount: 185000,
    paid_amount: 185000,
    status: 'PAID',
    issue_date: '2026-09-01',
    due_date: '2026-09-15',
    billing_terms: 'Net 15',
    items: [
      { description: 'Enterprise Workstation Z8 Bundle (x35)', amount: 157500 },
      { description: 'Annual Training Pack & White-Glove SLA', amount: 27500 }
    ],
    payments: [
      { date: '2026-09-01', amount: 185000, method: 'Bank Wire Transfer', ref: 'WIRE-99302' }
    ]
  },
  {
    id: 7,
    invoice_number: 'INV-1047',
    quotation_id: 3,
    customer_name: 'TechCorp International',
    total_amount: 45000,
    paid_amount: 0,
    status: 'UNPAID',
    issue_date: '2026-09-03',
    due_date: '2026-09-18',
    billing_terms: 'Net 15',
    items: [
      { description: 'Ultra-Wide 34\" Curved Monitor (x40)', amount: 34000 },
      { description: 'Thunderbolt Docking Station (x40)', amount: 11000 }
    ],
    payments: []
  }
];

export const INITIAL_CREDIT_NOTES = [
  {
    id: 1,
    credit_note_number: 'CN-2026-001',
    invoice_number: 'INV-1042',
    customer_name: 'Acme Corp',
    amount: 450,
    issue_date: '2026-09-02',
    reason: 'Deployment SLA Service Credit Adjustment',
    status: 'RECONCILED',
    reconciled_at: '2026-09-03',
    reconciled_by: 'David Miller (Finance)'
  },
  {
    id: 2,
    credit_note_number: 'CN-2026-002',
    invoice_number: 'INV-1045',
    customer_name: 'Zenith Health Systems',
    amount: 2500,
    issue_date: '2026-09-04',
    reason: 'Hardware Shipment Batch Lead-Time Concession',
    status: 'PENDING',
    reconciled_at: null,
    reconciled_by: null
  },
  {
    id: 3,
    credit_note_number: 'CN-2026-003',
    invoice_number: 'INV-1047',
    customer_name: 'TechCorp International',
    amount: 1800,
    issue_date: '2026-09-05',
    reason: 'Quarterly Volume Rebate Credit',
    status: 'PENDING',
    reconciled_at: null,
    reconciled_by: null
  }
];

class FinanceService {
  constructor() {
    this.subscriptions = [...INITIAL_SUBSCRIPTIONS];
    this.invoices = [...INITIAL_INVOICES];
    this.creditNotes = [...INITIAL_CREDIT_NOTES];
  }

  getOverview() {
    const paidInvoices = this.invoices.filter(i => i.status === 'PAID');
    const netCollected = paidInvoices.reduce((sum, i) => sum + (i.paid_amount || i.total_amount || 0), 0) + 40250; // Historical baseline

    const unpaidInvoices = this.invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID');
    const totalAR = unpaidInvoices.reduce((sum, i) => sum + ((i.total_amount || 0) - (i.paid_amount || 0)), 0);

    const activeSubs = this.subscriptions.filter(s => s.status === 'Active');
    const mrr = activeSubs.reduce((sum, s) => {
      if (s.cycle === 'Monthly') return sum + s.amount;
      if (s.cycle === 'Quarterly') return sum + Math.round(s.amount / 3);
      if (s.cycle === 'Yearly') return sum + Math.round(s.amount / 12);
      return sum + s.amount;
    }, 0) + 28000; // Baseline portfolio MRR

    // Pending finance approvals from sales service
    const pendingFinanceApprovals = salesMockService.approvals.filter(
      a => a.status === 'PENDING' && (a.required_role === 'FINANCE' || a.risk_score >= 70 || a.margin_pct < 25)
    );

    return {
      netCollected: netCollected || 284500,
      totalAR: totalAR || 48200,
      mrr: mrr || 38400,
      dso: 28.4,
      pendingApprovalsCount: pendingFinanceApprovals.length,
      pendingApprovals: pendingFinanceApprovals,
      arAging: {
        current: 32100, // 0-30 days
        medium: 11400,  // 31-60 days
        overdue: 4700   // 60+ days
      },
      subscriptionMetrics: {
        active: 18,
        paused: 2,
        cancelled: 3
      }
    };
  }

  getSubscriptions(filters = {}) {
    let list = [...this.subscriptions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(s =>
        s.customer_name.toLowerCase().includes(q) ||
        s.plan_name.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(s => s.status === filters.status);
    }
    return list;
  }

  updateSubscriptionStatus(id, newStatus, reason = '') {
    const idx = this.subscriptions.findIndex(s => s.id === parseInt(id, 10));
    if (idx === -1) return null;

    const oldStatus = this.subscriptions[idx].status;
    this.subscriptions[idx].status = newStatus;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    salesMockService.auditEvents.unshift({
      id: salesMockService.auditEvents.length + 1,
      time: nowStr,
      action: `Subscription status updated: ${newStatus}`,
      user: salesMockService.currentPersona?.name || 'Finance Lead',
      detail: `Subscription #${id} (${this.subscriptions[idx].plan_name}) changed from ${oldStatus} to ${newStatus}. ${reason ? 'Reason: ' + reason : ''}`
    });

    return this.subscriptions[idx];
  }

  getInvoices(filters = {}) {
    let list = [...this.invoices];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(i =>
        i.invoice_number.toLowerCase().includes(q) ||
        i.customer_name.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(i => i.status === filters.status);
    }
    return list;
  }

  getInvoiceById(id) {
    return this.invoices.find(i => i.id === parseInt(id, 10)) || null;
  }

  recordPayment({ invoiceId, amount, method = 'Bank Wire', ref = '', notes = '' }) {
    const idx = this.invoices.findIndex(i => i.id === parseInt(invoiceId, 10));
    if (idx === -1) return null;

    const inv = this.invoices[idx];
    const payAmount = parseFloat(amount) || 0;
    const currentPaid = inv.paid_amount || 0;
    const newPaid = currentPaid + payAmount;

    inv.paid_amount = newPaid;
    if (newPaid >= inv.total_amount) {
      inv.status = 'PAID';
    } else if (newPaid > 0) {
      inv.status = 'PARTIALLY_PAID';
    }

    const paymentRecord = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: payAmount,
      method,
      ref: ref || `PAY-${Date.now().toString().slice(-6)}`,
      notes
    };

    if (!inv.payments) inv.payments = [];
    inv.payments.unshift(paymentRecord);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    salesMockService.auditEvents.unshift({
      id: salesMockService.auditEvents.length + 1,
      quote_id: inv.quotation_id,
      time: nowStr,
      action: 'Payment Reconciled',
      user: salesMockService.currentPersona?.name || 'David Miller (VP Finance)',
      detail: `Payment of $${payAmount.toLocaleString()} recorded on ${inv.invoice_number} via ${method}. Remaining balance: $${Math.max(0, inv.total_amount - newPaid).toLocaleString()}`
    });

    return inv;
  }

  calculateProration({ totalDaysInCycle = 30, remainingDays = 14, oldQty = 1, newQty = 2, unitPrice = 18000 }) {
    const totalDays = parseInt(totalDaysInCycle, 10) || 30;
    const remaining = parseInt(remainingDays, 10) || 14;
    const oldQ = parseInt(oldQty, 10) || 1;
    const newQ = parseInt(newQty, 10) || 2;
    const price = parseFloat(unitPrice) || 18000;

    const dailyRate = (price * oldQ) / totalDays;
    const unusedCredit = Math.round(dailyRate * remaining);

    const newDailyRate = (price * newQ) / totalDays;
    const newPeriodCost = Math.round(newDailyRate * remaining);

    const netAdjustment = newPeriodCost - unusedCredit;

    return {
      totalDaysInCycle: totalDays,
      remainingDays: remaining,
      oldQty: oldQ,
      newQty: newQ,
      unitPrice: price,
      dailyRate: Math.round(dailyRate * 100) / 100,
      unusedCredit,
      newPeriodCost,
      netAdjustmentDue: netAdjustment,
      effectiveDate: 'Immediately (Today)',
      nextCycleRenewal: 'Standard Cycle Reset'
    };
  }

  getCreditNotes() {
    return this.creditNotes;
  }

  issueCreditNote({ invoice_number, customer_name, amount, reason }) {
    const newNote = {
      id: this.creditNotes.length + 1,
      credit_note_number: `CN-2026-00${this.creditNotes.length + 1}`,
      invoice_number: invoice_number || 'INV-1042',
      customer_name: customer_name || 'Acme Corp',
      amount: parseFloat(amount) || 0,
      issue_date: new Date().toISOString().slice(0, 10),
      reason: reason || 'Commercial Credit Adjustment',
      status: 'PENDING',
      reconciled_at: null,
      reconciled_by: null
    };
    this.creditNotes.unshift(newNote);
    return newNote;
  }

  reconcileCreditNote(creditNoteId) {
    const note = this.creditNotes.find(c => c.id === parseInt(creditNoteId, 10));
    if (!note) return null;
    note.status = 'RECONCILED';
    note.reconciled_at = new Date().toISOString().slice(0, 10);
    note.reconciled_by = salesMockService.currentPersona?.name || 'David Miller (Finance)';
    
    // Also adjust invoice balance
    const inv = this.invoices.find(i => i.invoice_number === note.invoice_number);
    if (inv) {
      inv.paid_amount = Math.min(inv.total_amount, (inv.paid_amount || 0) + note.amount);
      if (inv.paid_amount >= inv.total_amount) {
        inv.status = 'PAID';
      } else if (inv.paid_amount > 0) {
        inv.status = 'PARTIALLY_PAID';
      }
    }
    return note;
  }
}

export const financeService = new FinanceService();
export default financeService;
