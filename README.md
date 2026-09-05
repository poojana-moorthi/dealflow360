# DealFlow360 - Self-Governing B2B Sales Operations

DealFlow360 is an autonomous, production-grade B2B sales operations platform engineered with multi-tier discount governance, dynamic risk scoring, approval routing, multi-warehouse fulfillment allocation, hybrid one-time and subscription billing, customer portal negotiations with automatic re-approval, invoicing, payment settlement, deal health telemetry, and anomaly detection.

---

## 1. Project Overview & Business Purpose

DealFlow360 is not a simple CRUD tool. It acts as an autonomous sales operations engine that enforces commercial discipline while accelerating deal velocity:
- **Multi-Tier Discount Governance**: Evaluates line items against category and customer tier thresholds (Hardware, Services, Subscriptions across Bronze, Silver, Gold, Enterprise).
- **Blended Dynamic Risk Scoring**: Calculates real-time 0–100 risk score combining discount violations, margin degradation, deal volume, and counter-offer slippage.
- **Autonomous Approval Routing**: Directly generates and routes approval tickets to Sales Managers and Finance without manual sales rep intervention.
- **Intelligent Upsell/Cross-Sell Engine**: Recommends high-margin complementary add-ons with projected gross margin deltas.
- **Multi-Warehouse Fulfillment**: Allocates stock across regional hubs (Chennai, Bangalore, Mumbai, Hyderabad) minimizing shipments, and manages backorders.
- **Hybrid One-Time + Recurring Billing**: Generates immediate capital invoices alongside forward recurring SaaS subscription schedules.
- **Customer Negotiation Portal**: Separate customer workspace where counter-offers automatically trigger backend recalculations and autonomous re-approval routing.
- **Deal Health & Anomaly Radar**: Scans for stalled deals, discount spikes, and margin erosion.

---

## 2. High-Level Architecture & Layer Separation

```
React Frontend (Vite)
       ↓ (Axios REST APIs)
Node.js + Express Backend
       ↓ (Services / Business Logic Engines)
MySQL Relational Database (dealflow360)
```

### Critical Layer Separation Rule
- `frontend/`: Presentation, navigation, form state, and API communication. **Never directly connects to MySQL.**
- `backend/`: Source of truth for pricing, discount governance, risk calculation, approvals, fulfillment allocation, and billing.
- `database/`: Schema DDL, migrations, and realistic seed data under `database/schema/`, `database/migrations/`, and `database/seeds/`.

---

## 3. Future Stitch UI Integration Guide

> [!IMPORTANT]
> **Zero Backend & Zero Database Changes**:
> When a Stitch-generated UI is provided, **ONLY** replace or refactor `frontend/`.
> - Do NOT modify `backend/` controllers, routes, engines, or models.
> - Do NOT modify `database/` schemas, migrations, or tables.
> - All frontend API communication is encapsulated in `frontend/src/services/`.
> - Future Stitch UI components simply consume the existing REST API services.

### Mapping Stitch UI to DealFlow360
1. **Login & Auth**: Bind Stitch Login to `authService.login()` at `/login`.
2. **Dashboard**: Connect Stitch Dashboard to `dashboardService.getSummary()` and `/dashboard`.
3. **Quotation Builder**: Bind Stitch builder controls to `quotationService.create()` and `recalculatePreview()`.
4. **Approval Queue**: Connect review actions to `approvalService.approve()`, `reject()`, and `revision()`.
5. **Fulfillment Split**: Bind warehouse widgets to `fulfillmentService.getPlan()` and `override()`.
6. **Customer Portal**: Bind client views to `portalService` at `/portal/login` and `/portal/dashboard`.

---

## 4. Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Axios, Tailwind CSS, Lucide Icons, Context API.
- **Backend**: Node.js, Express.js, JWT (jsonwebtoken), bcryptjs, CORS, dotenv.
- **Database**: MySQL 8.0+ (InnoDB, UTF8MB4, Decimal precision for financials).

---

## 5. Folder Structure

```
dealflow360/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/styles/main.css
│   │   ├── components/
│   │   │   ├── common/         # Button, Input, Select, Modal, Card, Badge, Table, Loader, Toast
│   │   │   ├── layout/         # Sidebar, TopBar, Breadcrumb, AppLayout, PortalLayout
│   │   │   ├── dashboard/      # MetricsSummary, DealHealthAlertCard, StalledDealsTable
│   │   │   ├── quotations/     # QuotationLineItems, MarginIndicator, RiskScoreCard, UpsellPanel
│   │   │   ├── approvals/      # ApprovalStatus, ApprovalTimeline, ApprovalAuditTrail
│   │   │   ├── fulfillment/    # WarehouseSplitWidget, StockStatusBadge
│   │   │   ├── billing/        # BillingScheduleTable, ProrationPreview
│   │   │   └── portal/         # PortalHeader, NegotiationChat, CounterOfferForm
│   │   ├── context/            # AuthContext, QuoteContext, CustomerPortalContext
│   │   ├── hooks/              # useAuth, useQuoteBuilder, useMarginCalculator, useUpsell
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Signup, ForgotPassword
│   │   │   ├── dashboard/      # SalesDashboard
│   │   │   ├── quotations/     # QuotationList, QuotationDetail, QuotationBuilder
│   │   │   ├── approvals/      # ApprovalQueue, ApprovalDetail
│   │   │   ├── fulfillment/    # FulfillmentSplitView
│   │   │   ├── subscriptions/  # SubscriptionList
│   │   │   ├── billing/        # BillingDetail
│   │   │   ├── negotiation/    # CustomerNegotiation
│   │   │   ├── invoices/       # InvoiceList, InvoiceDetail
│   │   │   ├── dealHealth/     # DealHealthDashboard
│   │   │   ├── reporting/      # ReportingDashboard
│   │   │   ├── admin/          # ProductManagement, DiscountRulesSetup
│   │   │   └── portal/         # CustomerPortalLogin, CustomerPortalDashboard
│   │   ├── routes/             # AppRoutes, ProtectedRoute
│   │   ├── services/           # Centralized Axios API service layer
│   │   ├── utils/              # formatters (INR currency, dates), constants
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/                 # db.js, jwt.js, constants.js
│   ├── controllers/            # auth, customer, product, quotation, approval, fulfillment, billing, invoice, portal, dashboard, report
│   ├── middlewares/            # authMiddleware, rbacMiddleware, validationMiddleware, errorHandler
│   ├── models/                 # User, Customer, Product, Quotation, Approval, Subscription, Invoice, Payment, etc.
│   ├── services/               # riskScoreEngine, approvalEngine, upsellEngine, fulfillmentEngine, billingEngine, negotiationEngine, anomalyEngine, dealHealthEngine
│   ├── routes/                 # REST Express routes
│   ├── utils/                  # logger, auditLogger, pdfGenerator, emailService
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── database/
│   ├── schema/schema.sql       # 23 relational tables with foreign keys and indexes
│   ├── migrations/             # 001 to 016 individual DDL migrations
│   ├── seeds/                  # users, customers, products, price_lists, discount_rules, warehouses, inventory, quotations, subscriptions, invoices
│   └── runSeed.js              # Automated database setup & seeder runner
│
├── .gitignore
├── README.md
└── package.json
```

---

## 6. Demo Accounts & Credentials

All demo accounts share the password: **`Password123!`**

| Persona | Email | Role | Accessible Features |
|---|---|---|---|
| **Sales Rep** | `sathish@dealflow360.com` | `SALES_REP` | Quotation Builder, Catalogue, Upsell Engine, Negotiations |
| **Sales Manager** | `manager@dealflow360.com` | `SALES_MANAGER` | Governance Approval Queue, Quotation Review, Reports |
| **Finance** | `finance@dealflow360.com` | `FINANCE` | Escalated Approvals, Invoicing, Payment Settlements |
| **Operations** | `operations@dealflow360.com` | `OPERATIONS` | Multi-Warehouse Stock Splits, Backorders, Manual Overrides |
| **System Admin** | `admin@dealflow360.com` | `ADMIN` | Full System Access, Product Master, Discount Matrix |
| **Customer Partner**| `customer@acme.com` | `CUSTOMER` | Customer Portal, Proposal Review, Counter-Offers, Confirm |

*(Note: In the internal app header, an instant **"Switch Role"** dropdown allows switching personas with 1 click!)*

---

## 7. Complete End-to-End Demo Scenario

1. **Login as Sales Rep**: Log in as `sathish@dealflow360.com`.
2. **Open Dashboard**: View real-time pipeline, gross margin gauge, and deal health radar.
3. **Open Quotation `DF360-1001`**: Under Quotations, select quote `DF360-1001` (Acme Corporation).
4. **Inspect Policy Exception**:
   - 5x Laptop Pro (Hardware): 12% discount (Allowed: 15% - Compliant).
   - 1x Setup Service (Services): **18% discount** (Allowed: 10% - **8% Breach!**).
   - 1x Cloud Support (Subscriptions): 0% discount.
5. **Dynamic Risk Score**: Blended risk engine calculates a score of **78/100 (HIGH)** with policy violation explanation.
6. **Confirm & Route**: Click "Confirm Quotation" -> Autonomous approval ticket is routed to **SALES_MANAGER**.
7. **Manager Approval**: Switch role to `manager@dealflow360.com`, open **Approval Queue**, review margin impact, and click **Approve Quotation**.
8. **Fulfillment Split**: Click **Warehouse Split** -> Autonomous engine satisfies 5 Laptop Pros by splitting:
   - Chennai Main Warehouse: **3 units**
   - Bangalore Warehouse: **2 units**
   - Total shipments: 2, Logistics fee: ₹5,000.
9. **Hybrid Billing**: Open **Billing & Subscriptions** -> Billing engine generates:
   - Immediate Capital Invoice for one-time hardware & services.
   - Forward Monthly Subscription Billing Schedules for Cloud Support.
10. **Customer Portal Counter-Offer**:
    - Log into Customer Portal at `/portal/login` with `customer@acme.com`.
    - Submit a counter-offer of **₹7,80,000** (higher discount).
    - Backend recalculates risk -> Automatically marks quotation **`RE_APPROVAL_REQUIRED`** and creates a re-approval ticket without manual sales rep intervention!
11. **Manager Re-Approval**: Manager approves the revised counter-offer.
12. **Customer Confirms**: Customer accepts and clicks **"Accept & Execute Order"**.
13. **Invoice & Payment Settlement**:
    - Open Invoices (`/invoices`), select invoice `INV-1042`.
    - Click **"Record Settlement Payment"** and enter ₹1,56,940 via RTGS.
    - Invoice status automatically turns to **PAID**!
14. **Deal Health & Reports**: Deal health updates to **HEALTHY** and Executive Reports reflect updated revenue.

---

## 8. Setup & Running the Application Locally

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ service running on port 3306

### Step 1: Database Setup
1. Configure credentials in `backend/.env` (default is root with password `1234`).
2. Run database initialisation & seeding:
```bash
node database/runSeed.js
```
*(Creates database `dealflow360`, executes `schema.sql`, migrations, and seeds demo data).*

### Step 2: Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health check at `http://localhost:5000/api/health`).*

### Step 3: Start Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

### Step 4: Run Everything Concurrently
From the root directory:
```bash
npm run dev
```
