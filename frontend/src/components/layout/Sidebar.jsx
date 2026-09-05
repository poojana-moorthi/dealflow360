import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Package,
  Repeat,
  Receipt,
  HeartPulse,
  BarChart3,
  Sliders,
  Settings,
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'SALES_REP';

  const navItems = [
    { label: 'Sales Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS'] },
    { label: 'Quotations', path: '/quotations', icon: FileText, roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
    { label: 'Approval Queue', path: '/approvals', icon: CheckCircle2, roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Fulfillment & Stock', path: '/fulfillment/1', icon: Package, roles: ['ADMIN', 'OPERATIONS', 'SALES_MANAGER'] },
    { label: 'Subscriptions', path: '/subscriptions', icon: Repeat, roles: ['ADMIN', 'FINANCE', 'SALES_REP'] },
    { label: 'Invoices & Payments', path: '/invoices', icon: Receipt, roles: ['ADMIN', 'FINANCE', 'SALES_REP'] },
    { label: 'Deal Health & Risk', path: '/deal-health', icon: HeartPulse, roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Executive Reports', path: '/reporting', icon: BarChart3, roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Products & Pricing', path: '/admin/products', icon: Settings, roles: ['ADMIN'] },
    { label: 'Discount Rules', path: '/admin/discount-rules', icon: Sliders, roles: ['ADMIN'] }
  ];

  const allowedNav = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1565C0] flex items-center justify-center text-white font-bold text-lg shadow-sm">
          360
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">DealFlow360</h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight">Autonomous Sales Ops</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Enterprise Operations
        </div>
        {allowedNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-xs font-medium rounded-md transition-colors gap-3 ${
                  isActive
                    ? 'bg-[#1565C0] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Role / Current User Badge */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-white truncate">{user?.name}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-900/60 text-blue-200 border border-blue-700/50 uppercase">
            {role}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">v1.0-live</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
