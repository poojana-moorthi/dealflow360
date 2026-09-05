import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Building } from 'lucide-react';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('dealflow360_portal_user');
    navigate('/portal/login');
  };

  const portalUser = user || (() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow360_portal_user')) || { name: 'Johnathan Acme', email: 'customer1@dealflow360.com' };
    } catch (e) {
      return { name: 'Johnathan Acme', email: 'customer1@dealflow360.com' };
    }
  })();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#1565C0] flex items-center justify-center text-white font-bold text-base">
            360
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">DealFlow360 Customer Portal</h1>
            <p className="text-[10px] text-slate-500">Secure Procurement Negotiation & Order Acceptance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">{portalUser.name || 'Johnathan Acme'}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">{portalUser.companyName || 'Acme Corporation'}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md border border-red-200 transition flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 lg:p-10 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>/</span>}
          {item.link ? (
            <a href={item.link} className="hover:text-blue-600 transition">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-800 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export default AppLayout;
