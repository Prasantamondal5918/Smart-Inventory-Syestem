# Smart Inventory & Sales Management System

A production-ready cloud-based **Smart Inventory & Billing Platform** built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) for retail businesses such as supermarkets, grocery stores, pharmacies, electronics shops, and clothing stores.

---

## 🌟 Key Features

### 🔐 Authentication & Role-Based Authorization
- **Shop Owner Registration & Login**: Full shop setup, owner profile, main branch initialization, and JWT issuance.
- **Worker Accounts**: Owner can add, edit, activate/deactivate, or delete workers.
- **Role Control**: Strict backend JWT middleware (`protect` & `authorize('owner')`) and frontend route protection.

### 📦 Product & Inventory Management
- **Product Catalog**: Full CRUD with name, image upload (Multer), barcode, category, brand, purchase/selling price, tax %, unit, minimum stock threshold, and description.
- **Stock Management**: Restock log tracking with supplier, purchase date, invoice number, expiry date, and batch number.
- **Stock Status Logic**: Automatic status calculation (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`) and automatic notification triggers.

### 🛒 Real-Time POS (Point of Sale)
- **Interactive POS Interface**: Product grid, category filter pills, barcode scanner lookup modal, cart item quantity controls.
- **Secure Backend Validation**: Backend recalculates prices, taxes, discounts, and total payable amount.
- **Atomic Stock Deduction**: Automatically decreases stock, creates sale record, logs activity, and generates invoice.

### 📄 Professional Invoices & Reports
- **Invoice Generation**: Print-friendly invoice with shop details, logo, GSTIN, cashier info, line items breakdown, QR/barcode preview, and total calculations.
- **Analytics & Reports**: Real aggregated MongoDB data for revenue trends (Recharts), category breakdown, worker sales performance, net profit analysis, and CSV export.

### 🔔 Notifications & Audit Logs
- **Notifications**: Automated alerts for low stock, out of stock, worker logins, and large sales with unread badges.
- **Activity Logs**: Complete audit trail tracking login, logout, failed logins, stock additions, product modifications, and completed sales.

---

## 🏗 Project Structure

```text
smart-inventory-system/
│
├── frontend/                  # React.js + Vite Frontend
│   ├── public/                # Static assets & SVG favicon
│   ├── src/
│   │   ├── components/        # Common UI, POS & Invoice components
│   │   ├── layouts/           # DashboardLayout & AuthLayout
│   │   ├── pages/             # All React views (Dashboard, Products, POS, etc.)
│   │   ├── routes/            # AppRoutes with role protection
│   │   ├── store/             # Zustand stores (Auth, POS, Notifications)
│   │   ├── services/          # Axios interceptors & API helpers
│   │   ├── utils/             # Formatters & constants
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind CSS styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── backend/                   # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── controllers/       # Controller logic (Auth, Product, Stock, Sale, etc.)
│   │   ├── middleware/        # Auth, Role, Upload, Validation & Error handlers
│   │   ├── models/            # Mongoose Schema definitions (10 Models)
│   │   ├── routes/            # Express API Routes
│   │   ├── utils/             # Activity logger, notifications & Seed script
│   │   ├── validators/        # Express validators
│   │   └── app.js             # Express app setup
│   ├── uploads/               # Uploaded product images
│   ├── package.json
│   ├── server.js              # Server entry point
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🛠 Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React, Recharts, React Hook Form, Zustand, React Hot Toast, Axios, React Router DOM.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT (`jsonwebtoken`), bcryptjs, Multer, express-validator, CORS, dotenv.

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js**: v18+ or higher installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` OR MongoDB Atlas connection string.

### 2. Install Dependencies
Run from root directory:
```bash
npm run install-all
```
Or install individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Environment Variables

**Backend (`backend/.env`):**
```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_inventory
JWT_SECRET=super_secret_jwt_key_smart_inventory_2026_xyz
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:8000/api
```

### 4. Seed Development Database
Populate database with demo shop, owner account, worker accounts, sample products, suppliers, and sales history:
```bash
cd backend
npm run seed
```

### 5. Running the Application

**Run Backend Server:**
```bash
cd backend
npm run dev
```
*(Server will start on `http://localhost:8000`)*

**Run Frontend App:**
```bash
cd frontend
npm run dev
```
*(App will run on `http://localhost:5173`)*

---

## 🔑 Demo Credentials

After running `npm run seed`:

- **Shop Owner Account:**
  - **Email:** `owner@demo.com`
  - **Password:** `password123`
  - **Permissions:** Full access to Dashboard, Worker Management, Product CRUD, Stock, POS, Reports, Branches, Activity Logs, and Settings.

- **Worker / Cashier Account:**
  - **Email:** `worker1@demo.com`
  - **Password:** `password123`
  - **Permissions:** Dashboard, Product Catalog (View Only), Inventory, POS Terminal, Checkout & Invoice Generation, Sales History, Notifications. Owner-only pages are restricted.

---

## 🚀 Complete Application Flow

```text
REGISTER / LOGIN
     │
     ▼
DASHBOARD (Live aggregated MongoDB stats & charts)
     │
     ├──► ADD / EDIT PRODUCT (Image upload, barcode, tax %, min stock)
     │
     ├──► ADD STOCK (Supplier, purchase date, invoice #, expiry, batch)
     │
     ├──► POS TERMINAL (Search product, category pills, barcode scan, cart controls)
     │         │
     │         ▼
     │   CHECKOUT SALE ──► Backend recalculates totals & validates stock
     │         │
     │         ├──► Product stock automatically decremented
     │         ├──► Sale & Invoice generated (#INV-...)
     │         ├──► Audit Activity Log recorded
     │         └──► Low Stock / Large Sale Notification created if triggered
     │
     └──► REPORTS & SALES HISTORY (Profit analysis, CSV export, staff performance)
```

---

## 🛡 License
Distributed under the MIT License.
