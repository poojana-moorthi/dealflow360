import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import AppLayout, { PortalLayout } from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Dashboard
import SalesDashboard from '../pages/dashboard/SalesDashboard';
import FinanceDashboard from '../pages/finance/FinanceDashboard';

// Quotations
import QuotationList from '../pages/quotations/QuotationList';
import QuotationDetail from '../pages/quotations/QuotationDetail';
import QuotationBuilder from '../pages/quotations/QuotationBuilder';

// Approvals
import ApprovalQueue from '../pages/approvals/ApprovalQueue';
import ApprovalDetail from '../pages/approvals/ApprovalDetail';

// Fulfillment
import FulfillmentSplitView from '../pages/fulfillment/FulfillmentSplitView';

// Subscriptions & Billing
import SubscriptionList from '../pages/subscriptions/SubscriptionList';
import BillingDetail from '../pages/billing/BillingDetail';

// Negotiation
import CustomerNegotiation from '../pages/negotiation/CustomerNegotiation';

// Invoices
import InvoiceList from '../pages/invoices/InvoiceList';
import InvoiceDetail from '../pages/invoices/InvoiceDetail';

// Deal Health & Reports
import DealHealthDashboard from '../pages/dealHealth/DealHealthDashboard';
import ReportingDashboard from '../pages/reporting/ReportingDashboard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import ProductEditor from '../pages/admin/ProductEditor';
import DiscountRulesSetup from '../pages/admin/DiscountRulesSetup';
import AdminAuditLog from '../pages/admin/AdminAuditLog';

// Customer Portal Pages
import CustomerPortalLogin from '../pages/portal/CustomerPortalLogin';
import CustomerPortalDashboard from '../pages/portal/CustomerPortalDashboard';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Customer Portal Public Login */}
      <Route path="/portal/login" element={<CustomerPortalLogin />} />

      {/* Customer Portal Protected Workspace */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CustomerPortalDashboard />} />
        <Route path="negotiation/:id" element={<CustomerPortalDashboard />} />
      </Route>

      {/* Internal Protected Workspace */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER', 'FINANCE', 'OPERATIONS']}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="finance"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />

        {/* Quotations */}
        <Route
          path="quotations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
              <QuotationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
              <QuotationBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="quotations/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
              <QuotationDetail />
            </ProtectedRoute>
          }
        />

        {/* Approvals */}
        <Route
          path="approvals"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
              <ApprovalQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="approvals/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
              <ApprovalDetail />
            </ProtectedRoute>
          }
        />

        {/* Fulfillment */}
        <Route
          path="fulfillment"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS', 'SALES_MANAGER']}>
              <FulfillmentSplitView />
            </ProtectedRoute>
          }
        />
        <Route
          path="fulfillment/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'OPERATIONS', 'SALES_MANAGER']}>
              <FulfillmentSplitView />
            </ProtectedRoute>
          }
        />

        {/* Subscriptions */}
        <Route
          path="subscriptions"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <SubscriptionList />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="billing/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <BillingDetail />
            </ProtectedRoute>
          }
        />

        {/* Negotiation */}
        <Route
          path="negotiation/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_REP', 'SALES_MANAGER']}>
              <CustomerNegotiation />
            </ProtectedRoute>
          }
        />

        {/* Invoices */}
        <Route
          path="invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <InvoiceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="invoices/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />

        {/* Deal Health & Reporting */}
        <Route
          path="deal-health"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
              <DealHealthDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="reporting"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'FINANCE']}>
              <ReportingDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Console & Governance */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/products/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/products/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/discount-rules"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DiscountRulesSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-log"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAuditLog />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
