import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
          <a
            href="/dashboard"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200"
          >
            ← Back to Internal App
          </a>
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
