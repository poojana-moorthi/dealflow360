# DealFlow360 - Self-Governing B2B Sales Operations

## Phase 1: Authentication & User Governance (Login & Signup)

### Team Instructions to Run on Any Computer:

#### 1. Prerequisites:
- **Node.js** (v18+)
- **MySQL Server** running locally

---

#### 2. Database Setup (One-time):
Import the schema and seed scripts into MySQL:
1. `database/schema/schema.sql` (Creates `dealflow360` DB and tables)
2. `database/seeds/customers.sql` (Seeds demo customer organizations)
3. `database/seeds/users.sql` (Seeds demo user accounts with password `Password123!`)

---

#### 3. Backend Setup:
```bash
cd backend
# 1. Copy environment template
# Windows: copy .env.example .env
# Linux/Mac: cp .env.example .env
# Edit .env with your local MySQL password: DB_PASSWORD=your_password

# 2. Install dependencies & run
npm install
node server.js
```
- API runs at: **http://localhost:5000**
- Health check: **http://localhost:5000/api/health**

---

#### 4. Frontend Setup:
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Application opens at: **http://localhost:5173/login**

---

### Demo Accounts for Testing (Password: `Password123!`):
- **Sales Representative**: `sales_rep@dealflow360.com`
- **Sales Manager**: `sales_manager@dealflow360.com`
- **Finance**: `finance@dealflow360.com`
- **Admin**: `admin@dealflow360.com`
- **Customer**: `customer1@dealflow360.com`
