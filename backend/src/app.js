const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const stockRoutes = require('./routes/stock.routes');
const salesRoutes = require('./routes/sales.routes');
const workerRoutes = require('./routes/worker.routes');
const supplierRoutes = require('./routes/supplier.routes');
const branchRoutes = require('./routes/branch.routes');
const reportRoutes = require('./routes/report.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const searchRoutes = require('./routes/search.routes');
const customerRoutes = require('./routes/customer.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middlewares
// CLIENT_URL may contain a comma-separated list of allowed frontend origins.
// Keep the deployed Netlify site available even when Render has not yet been
// configured with the CLIENT_URL environment variable.
const allowedOrigins = new Set([
  'http://localhost:5173',
  'https://serene-malasada-889556.netlify.app',
  ...(process.env.CLIENT_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.use(cors({
  origin(origin, callback) {
    // Requests from tools and same-origin clients may not include an Origin.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Inventory API is running smoothly',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity-logs', activityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ai', aiRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    data: null,
  });
});

// Centralized Error Middleware
app.use(errorHandler);

module.exports = app;
