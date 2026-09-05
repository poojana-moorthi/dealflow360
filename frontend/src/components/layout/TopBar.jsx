import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSales } from '../../context/SalesContext';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Package,
  Repeat,
  Receipt,
  HeartPulse,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';

export function TopBar() {
  const { user, logout } = useAuth();
  const { persona } = useSales();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const currentRole = user?.role || persona?.role || 'SALES_REP';

  const allNavTabs = [
    { label: currentRole === 'FINANCE' ? 'Finance Ops' : 'Dashboard', path: currentRole === 'FINANCE' ? '/finance' : '/dashboard', roles: ['SALES_MANAGER', 'FINANCE', 'OPERATIONS'] },
    { label: 'Quotations', path: '/quotations', roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
    { label: 'Customer Responses', path: '/negotiations', roles: ['ADMIN', 'SALES_REP', 'SALES_MANAGER'] },
    { label: 'Approvals', path: '/approvals', roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Discount Rules', path: '/admin/discount-rules', roles: ['ADMIN', 'SALES_MANAGER'] },
    { label: 'Subscriptions', path: '/subscriptions', roles: ['ADMIN', 'FINANCE'] },
    { label: 'Invoices', path: '/invoices', roles: ['ADMIN', 'FINANCE'] },
    { label: 'Deal Health', path: '/deal-health', roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Reports', path: '/reporting', roles: ['ADMIN', 'SALES_MANAGER', 'FINANCE'] },
    { label: 'Product', path: '/admin/products', roles: ['ADMIN'] }
  ];

  const navTabs = allNavTabs.filter(tab => tab.roles.includes(currentRole));

  return (
    <header className="bg-[#1565C0] text-white shadow-md z-30 shrink-0">
      {/* Primary Brand & Role Switcher Bar */}
      <div className="px-6 py-2.5 flex items-center justify-between border-b border-blue-600/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-white text-[#1565C0] flex items-center justify-center font-extrabold text-base shadow-xs">
            360
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">DealFlow360</span>
              <span className="hidden md:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-700 text-blue-100 border border-blue-500">
                Self-Governing Sales Ops
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Persona Selector, User Tag, External Portal */}
        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* Current User Role Pill */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-blue-100">{user?.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-white text-[#1565C0] rounded shadow-2xs">
              {currentRole}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
            className="p-1.5 text-blue-200 hover:text-white rounded hover:bg-blue-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Navigation Tabs Bar (Exact Match with Diagram) */}
      <div className="px-6 flex items-center gap-1.5 overflow-x-auto text-xs pt-1.5 bg-[#0D47A1]">
        {navTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-t-lg font-bold transition-all whitespace-nowrap border-t border-x ${
                isActive
                  ? 'bg-white text-[#1565C0] border-white shadow-xs'
                  : 'text-blue-100 border-transparent hover:text-white hover:bg-blue-800/80'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}

        {/* Admin Menu Dropdown */}
        {currentRole === 'ADMIN' && (
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="px-3 py-1.5 rounded-md font-semibold text-blue-100 hover:text-white hover:bg-blue-800 flex items-center gap-1 transition"
            >
              <span>Admin Setup</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showAdminMenu && (
              <div
                className="absolute left-0 mt-1 w-44 bg-white text-slate-800 rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs"
                onMouseLeave={() => setShowAdminMenu(false)}
              >
                <NavLink
                  to="/admin"
                  onClick={() => setShowAdminMenu(false)}
                  className="block px-3 py-2 hover:bg-blue-50 font-medium text-slate-700 hover:text-blue-700"
                >
                  Admin Console
                </NavLink>
                <NavLink
                  to="/admin/products"
                  onClick={() => setShowAdminMenu(false)}
                  className="block px-3 py-2 hover:bg-blue-50 font-medium text-slate-700 hover:text-blue-700"
                >
                  Product Catalogue
                </NavLink>
                <NavLink
                  to="/admin/discount-rules"
                  onClick={() => setShowAdminMenu(false)}
                  className="block px-3 py-2 hover:bg-blue-50 font-medium text-slate-700 hover:text-blue-700"
                >
                  Discount Matrix
                </NavLink>
                <NavLink
                  to="/admin/audit-log"
                  onClick={() => setShowAdminMenu(false)}
                  className="block px-3 py-2 hover:bg-blue-50 font-medium text-slate-700 hover:text-blue-700"
                >
                  Governance Audit Log
                </NavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
