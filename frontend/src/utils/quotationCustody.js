/**
 * Quotation Custody & Customer Contact Resolver
 * DealFlow360 Autonomous Sales Operations
 */

export function getCustomerEmail(customerId, customerName) {
  if (customerId === 1 || (customerName && customerName.toLowerCase().includes('acme'))) {
    return 'customer1@dealflow360.com';
  }
  if (customerId === 2 || (customerName && customerName.toLowerCase().includes('nova'))) {
    return 'customer2@dealflow360.com';
  }
  if (customerId === 3 || (customerName && customerName.toLowerCase().includes('techcorp'))) {
    return 'customer3@dealflow360.com';
  }
  if (customerId === 4 || (customerName && customerName.toLowerCase().includes('delta'))) {
    return 'customer4@dealflow360.com';
  }
  if (customerId === 5 || (customerName && customerName.toLowerCase().includes('zenith'))) {
    return 'customer5@dealflow360.com';
  }
  return `customer${customerId || 1}@dealflow360.com`;
}

export function getQuotationCustody(quote) {
  if (!quote) return {
    label: 'Unknown',
    hands: 'System',
    reviewer: 'System Admin',
    color: 'slate',
    description: 'Status unavailable'
  };

  const status = quote.status || quote.stage || 'DRAFT';
  const level = quote.required_approval_level;

  if (status === 'APPROVED' || status === 'WON') {
    return {
      statusKey: 'APPROVED',
      label: 'Approved • In Customer Hands',
      hands: 'Customer (Procurement)',
      reviewer: 'Approved by Governance — Published to Customer',
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Quotation has full executive approval and is now in the customer\'s hands ready for 1-click execution.'
    };
  }

  if (status === 'CONFIRMED') {
    return {
      statusKey: 'CONFIRMED',
      label: 'Confirmed • In Operations Hands',
      hands: 'Operations & Logistics',
      reviewer: 'Warehouse Dispatch Team',
      color: 'emerald',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description: 'Commercial contract accepted and signed by customer. Initial invoice generated and warehouse fulfillment underway.'
    };
  }

  if (status === 'PENDING APPROVAL' || status === 'PENDING_APPROVAL') {
    if (level === 'FINANCE') {
      return {
        statusKey: 'PENDING_FINANCE',
        label: 'In Hands of: Finance Lead',
        hands: 'Finance Executive Review',
        reviewer: 'Marcus Vance / David Miller (VP of Commercial Finance)',
        color: 'purple',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Under review by Commercial Finance because discount or margin exceeds standard managerial ceiling.'
      };
    }
    return {
      statusKey: 'PENDING_MANAGER',
      label: 'In Hands of: Sales Manager',
      hands: 'Sales Management Review',
      reviewer: 'Sarah Connor (Regional Sales Director)',
      color: 'amber',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'Under review by Regional Sales Manager due to tier ceiling exception.'
    };
  }

  if (status === 'NEGOTIATION') {
    return {
      statusKey: 'NEGOTIATION',
      label: 'In Hands of: Sales Rep (Customer Negotiation)',
      hands: 'Sales Representative',
      reviewer: quote.sales_rep_name || quote.owner || 'Alex Morgan (Account Executive)',
      color: 'blue',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'Customer has submitted counter-terms or line-level questions. Awaiting Sales Rep review and reply.'
    };
  }

  if (status === 'REJECTED') {
    return {
      statusKey: 'REJECTED',
      label: 'Rejected • In Sales Rep Hands',
      hands: 'Sales Representative',
      reviewer: 'Returned by Governance Reviewer',
      color: 'rose',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      description: 'Returned by manager or finance with required pricing or margin modifications.'
    };
  }

  return {
    statusKey: 'DRAFT',
    label: 'Draft • In Sales Rep Hands',
    hands: 'Sales Representative',
    reviewer: quote.sales_rep_name || quote.owner || 'Alex Morgan (Account Executive)',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Draft proposal actively being prepared and priced by Sales Representative.'
  };
}
