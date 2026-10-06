import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Common / Protection
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleRoute from '../components/common/RoleRoute';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Dashboard & Feature Pages
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductAddEdit from '../pages/ProductAddEdit';
import ProductDetail from '../pages/ProductDetail';
import StockList from '../pages/StockList';
import StockAdd from '../pages/StockAdd';
import Suppliers from '../pages/Suppliers';
import Workers from '../pages/Workers';
import WorkerAddEdit from '../pages/WorkerAddEdit';
import POS from '../pages/POS';
import SalesHistory from '../pages/SalesHistory';
import InvoicePage from '../pages/InvoicePage';
import Reports from '../pages/Reports';
import Branches from '../pages/Branches';
import ActivityLogs from '../pages/ActivityLogs';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import SearchResults from '../pages/SearchResults';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Product Routes */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/products/add" element={<ProductAddEdit />} />
            <Route path="/products/edit/:id" element={<ProductAddEdit />} />
          </Route>

          {/* Stock / Inventory Routes */}
          <Route path="/stock" element={<StockList />} />
          <Route path="/stock/add" element={<StockAdd />} />

          {/* Suppliers */}
          <Route path="/suppliers" element={<Suppliers />} />

          {/* Worker Management (Owner Only) */}
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/workers" element={<Workers />} />
            <Route path="/workers/add" element={<WorkerAddEdit />} />
            <Route path="/workers/edit/:id" element={<WorkerAddEdit />} />
          </Route>

          {/* POS & Sales */}
          <Route path="/pos" element={<POS />} />
          <Route path="/sales" element={<SalesHistory />} />
          <Route path="/sales/:id" element={<InvoicePage />} />
          <Route path="/invoices/:id" element={<InvoicePage />} />

          {/* Owner Only Reports, Branches & Activity Logs */}
          <Route element={<RoleRoute allowedRoles={['owner']} />}>
            <Route path="/reports" element={<Reports />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
          </Route>

          {/* General Protected */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
