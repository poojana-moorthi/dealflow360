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
  ExternalLink,
  UserCheck,
  ChevronDown
} from 'lucide-react';

export function TopBar() {
  const { user, logout, login } = useAuth();
  const { persona, setPersona } = useSales();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const currentRole = persona?.role || user?.role || 'SALES_REP';

  const demoAccounts = [
    { role: 'SALES_REP', label: 'Sales Rep', email: 'sales_rep@dealflow360.com' },
    { role: 'SALES_MANAGER', label: 'Sales Manager', email: 'sales_manager@dealflow360.com' },
    { role: 'FINANCE', label: 'Finance', email: 'finance@dealflow360.com' },
    { role: 'ADMIN', label: 'Admin', email: 'admin@dealflow360.com' }
  ];

  const handleQuickSwitch = async (roleKey) => {
    setPersona(roleKey);
    const target = demoAccounts.find(d => d.role === roleKey);
    if (target && login) {
      try {
        await login(target.email, 'Password123!');
      } catch (err) {
        // Fallback for mock mode without crashing
      }
    }
  };

  const navTabs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Quotations', path: '/quotations' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Fulfillment', path: '/fulfillment/1' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Invoices', path: '/invoices' },
    { label: 'Deal Health', path: '/deal-health' },
    { label: 'Reports', path: '/reporting' },
    { label: 'Product', path: '/admin/products' }
  ];

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
        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-blue-800/80 px-2.5 py-1 rounded-md border border-blue-500/70 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-blue-200" />
            <span className="text-[11px] font-semibold text-blue-200 hidden sm:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => handleQuickSwitch(e.target.value)}
              className="text-xs bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {demoAccounts.map(acc => (
                <option key={acc.role} value={acc.role} className="text-slate-900 bg-white">
                  {acc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Portal Link */}
          <a
            href="/portal/login"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 px-2.5 py-1 rounded-md border border-blue-400/50 transition shadow-2xs"
          >
            <span>Customer Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {/* Current User Role Pill */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-blue-400/40 text-xs">
            <span className="font-semibold text-blue-100">{user?.name}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-white text-[#1565C0] rounded shadow-2xs">
              {currentRole}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            title="Logout"
            className="p-1.5 text-blue-200 hover:text-white rounded hover:bg-blue-700 transition"
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
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default TopBar;
