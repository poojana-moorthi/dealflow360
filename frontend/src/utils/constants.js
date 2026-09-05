export const ROLES = {
  ADMIN: 'ADMIN',
  SALES_REP: 'SALES_REP',
  SALES_MANAGER: 'SALES_MANAGER',
  FINANCE: 'FINANCE',
  OPERATIONS: 'OPERATIONS',
  CUSTOMER: 'CUSTOMER'
};

export const RISK_LEVEL_COLORS = {
  LOW: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
};

export const HEALTH_STATUS_COLORS = {
  HEALTHY: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  WATCH: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  AT_RISK: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  CRITICAL: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
};
