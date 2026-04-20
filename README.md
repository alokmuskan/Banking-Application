# NexusBank - Comprehensive Capstone Documentation

Welcome to the **NexusBank Management System**, an advanced, full-stack, real-world banking simulation designed as an elite capstone project. This application handles everything from Role-Based Access Control (RBAC) and realistic database schemas to cryptographic payment gateway integrations via Razorpay, real-time Recharts analytics, and PDF Bank Ledger exports.

---

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Axios, React Router, Recharts (Analytics), jsPDF & SheetJS (Exports).
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt (Security).
- **Database**: MySQL 8.0, managed via strict `mysql2` driver with Foreign Key constraints.
- **Payment Gateway**: Razorpay Test Simulator (Cryptographic signature verification).

---

## 📂 Complete Folder Structure

Below is a detailed, minute-by-minute map of the application's entire architecture:

```text
d:\User\Banking Application\
│
├── backend\                     # Node.js Express Server Environment
│   ├── .env                     # Environment Variables (DB Passwords, JWT Secrets, Razorpay API Keys)
│   ├── index.js                 # Core Server Entry File (Mounts Middlewares, CORS, and all API Routes)
│   ├── package.json             # Backend dependencies (express, cors, mysql2, razorpay, jsonwebtoken, bcrypt)
│   │
│   ├── config\                  
│   │   └── db.js                # MySQL Connection Pool setup (Ensures connections don't block)
│   │
│   └── routes\                  # API Endpoint Controllers (Separation of Concerns)
│       ├── admin.js             # RBAC Protected logic (Approving Pending Accounts/Cards/Loans)
│       ├── api.js               # General Logic (Customer Reg., Transactions, Analytics padding math)
│       ├── auth.js              # Cryptographic Login, JWT generation, and User <-> Customer Profile auto-linking
│       ├── fd.js                # Fixed Deposits compound interest logic and database injection
│       ├── payments.js          # Secure Razorpay Order Generation & Signature Verification
│       ├── products.js          # Route mapping for requesting Loans and Virtual Cards
│       └── support.js           # Support ticketing and Bell Notification system logic
│
├── frontend\                    # React.js UI Environment (Built on Vite)
│   ├── index.html               # Main HTML mount (Also injects the Razorpay Web SDK)
│   ├── vite.config.js           # Lightweight React compiler config
│   │
│   └── src\                     # Core Source Code
│       ├── App.jsx              # React Router Map (Secures paths with `<PrivateRoute>`)
│       ├── main.jsx             # React Virtual DOM entry point
│       │
│       ├── context\             # Global React State Management
│       │   ├── AuthContext.jsx  # Manages the active JWT user session context globally
│       │   └── ToastContext.jsx # Renders beautiful sliding failure/success popups anywhere
│       │
│       ├── components\          # Reusable UI Blocks
│       │   ├── Layout.jsx       # The master UI wrapper (Sidebar, Top Notification Bar, Profile Menu)
│       │   └── PrivateRoute.jsx # Structural firewall (Forces Login; blocks Customers from Admin pages)
│       │
│       ├── styles\              # Pure Vanilla CSS Design System (Glassmorphism aesthetics)
│       │   ├── Dashboard.css    # Layout logic for Area/Pie charts
│       │   ├── global.css       # Core color tokens, resets, default typography
│       │   ├── Layout.css       # Navlink styling, sidebar responsiveness
│       │   └── Pages.css        # Unified flex/grid layouts used by all sub-pages
│       │
│       └── pages\               # Individual Application Screens
│           ├── AccountPage.jsx      # UI for opening standard Savings/Checking accounts
│           ├── ApprovalsPage.jsx    # ADMIN ONLY: Reject or Approve pending customer requests
│           ├── AuthPage.jsx         # Sign Up / Log In form intercept
│           ├── CardsPage.jsx        # Dual-View: Form to request a card vs Admin terminal to issue cards
│           ├── CustomerPage.jsx     # Complex 20-field KYC registration form mathematically tied to backend
│           ├── Dashboard.jsx        # Dual-View: Recharts Data Vis (AreaCashflow/PieDistribution) vs Admin Global Stats
│           ├── FixedDepositPage.jsx # FDs: Calculates compound interest securely and deducts principal
│           ├── LoansPage.jsx        # EMI calculator & origination workflow
│           ├── StatementPage.jsx    # Complete Transaction Ledger featuring `jsPDF` PDF generation
│           ├── SupportPage.jsx      # Ticket submission and Real-time branch locations
│           └── TransactionPage.jsx  # Financial Hub (Razorpay Intercept for deposits, Payee registry)
│
└── sql\                         # Database Definition Files
    ├── schema.sql               # Architecture of all 12 highly relational Tables + Seed Data
    └── views_triggers.sql       # (Optional) Pre-compiled SQL views/triggers for advanced DB states
```

---

## 🚀 Key Architectural Details

### 1. Dual-View Roles (RBAC)
The frontend utilizes a "Dual-View" architecture. If a user logs in as a `Customer`, their Dashboard renders complex mathematical visual charts (`Recharts`). If a `Teller` or `Admin` logs in, they are blocked from touching personal funds and instead see a Global view of total system wealth, active branches, and pending security approvals.

### 2. "Production-Grade" Payment Gateways
The system refuses "magic database deposits." Users must interact with the `Razorpay Sandbox`. The frontend queries the backend for an Order ID (`routes/payments.js`), injects the web SDK, and awaits the user's mock card payment. It finishes with a highly secure Cryptographic HMAC SHA256 Signature verification before writing to the database.

### 3. Advanced Dashboard Analytics
The React Application features a mathematically smoothed Cashflow AreaChart. Even if a user has only transacted entirely in November, the backend algorithms proactively pad the database query with surrounding months composed of zeroes, completely preventing UI breaks and ensuring beautiful visual lines.

### 4. PDF Bank Statement Ecosystem
Eliminating the need for a backend Python/Java generator, the application parses the live React state into `jsPDF` vectors. Complex user transaction tables are rendered natively in the browser into a high-fidelity PDF, preserving bank branding and preventing heavy backend network loads.

---

## ⚡ Deployment & Startup Guide

### Step 1: Database Initialization
1. Open MySQL Workbench.
2. Open `sql/schema.sql` and run the entire file. This automatically creates the `BankingMS` database, builds all 12 tables, enforces strict foreign key relationships, and inserts the 4 physical Bank Branches to populate dropdowns.

### Step 2: Backend (Node.js) Server
1. Navigate into `cd backend`.
2. Ensure you have run `npm install` once.
3. Your local `.env` file must strictly contain your valid Razorpay sandbox (`rzp_test...`) keys.
4. Run `npm start` (or `node index.js`). Will explicitly boot on Port 5000.

### Step 3: Frontend (React/Vite) Server
1. Navigate into `cd frontend`.
2. Ensure you have run `npm install` once.
3. Run `npm run dev`. Will boot instantly on Port 5173.
4. Open `http://localhost:5173`. We highly recommend generating an admin at signup, creating a customer profile, exploring the dual-view dashboards, and then depositing test funds through Razorpay!
