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
import ProductManagement from '../pages/admin/ProductManagement';
import DiscountRulesSetup from '../pages/admin/DiscountRulesSetup';

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
        <Route path="dashboard" element={<SalesDashboard />} />

        {/* Quotations */}
        <Route path="quotations" element={<QuotationList />} />
        <Route path="quotations/new" element={<QuotationBuilder />} />
        <Route path="quotations/:id" element={<QuotationDetail />} />

        {/* Approvals */}
        <Route path="approvals" element={<ApprovalQueue />} />
        <Route path="approvals/:id" element={<ApprovalDetail />} />

        {/* Fulfillment */}
        <Route path="fulfillment" element={<FulfillmentSplitView />} />
        <Route path="fulfillment/:id" element={<FulfillmentSplitView />} />

        {/* Subscriptions */}
        <Route path="subscriptions" element={<SubscriptionList />} />

        {/* Billing */}
        <Route path="billing/:id" element={<BillingDetail />} />

        {/* Negotiation */}
        <Route path="negotiation/:id" element={<CustomerNegotiation />} />

        {/* Invoices */}
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />

        {/* Deal Health & Reporting */}
        <Route path="deal-health" element={<DealHealthDashboard />} />
        <Route path="reporting" element={<ReportingDashboard />} />

        {/* Admin Setup */}
        <Route
          path="admin/products"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ProductManagement />
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
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
