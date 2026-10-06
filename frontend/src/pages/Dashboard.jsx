import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  AlertOctagon,
  ShoppingCart,
  PlusCircle,
  Boxes,
  FileSpreadsheet,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner label="Aggregating live store metrics..." />;
  if (error) return <ErrorState title="Dashboard Loading Failed" message={error} onRetry={fetchDashboardData} />;

  const { summaryCards, salesChart, recentSales, topSellingProducts, recentActivities, lowStockProductsList } = data;

  return (
    <div className="space-y-6">
      {/* Header section & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Business Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time inventory metrics & aggregated revenue pipeline</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/pos"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open POS</span>
          </Link>
          <Link
            to="/products/add"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/stock/add"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Add Stock</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Today's Sales"
          value={formatCurrency(summaryCards.todaySales)}
          subtext={`${summaryCards.todaySalesCount} transactions today`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(summaryCards.monthlySales)}
          subtext="Current month total"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Total Products"
          value={summaryCards.totalProducts}
          subtext="Catalog items"
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Low Stock Alert"
          value={summaryCards.lowStockCount}
          subtext="Requires reordering"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={summaryCards.outOfStockCount}
          subtext="0 stock remaining"
          icon={AlertOctagon}
          color="rose"
        />
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">7-Day Revenue Trend</h3>
              <p className="text-xs text-slate-400">Aggregated daily sales totals</p>
            </div>
            <Badge variant="info">Live Mongo Aggregation</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dayName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products List (1 column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">Top Selling Items</h3>
            <Link to="/reports" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {topSellingProducts.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No sales recorded yet</p>
            ) : (
              topSellingProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white truncate max-w-[130px]">{prod.productName}</h5>
                      <p className="text-[11px] text-slate-400">{prod.totalSold} units sold</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-400">{formatCurrency(prod.totalRevenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-base">Recent Sales</h3>
            <Link to="/sales" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Sales History
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <th className="py-2">Invoice</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Payment</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold font-mono text-indigo-300">{sale.invoiceNo}</td>
                    <td className="py-2.5 text-slate-300">{sale.customer?.name || 'Walk-in'}</td>
                    <td className="py-2.5">
                      <Badge variant="purple">{sale.paymentMethod.toUpperCase()}</Badge>
                    </td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-400">{formatCurrency(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Low Stock Attention</h3>
            </div>
            <Link to="/stock" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage Stock
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockProductsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">All inventory stock levels healthy!</p>
            ) : (
              lowStockProductsList.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl">
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.productName}</h5>
                    <p className="text-[11px] text-slate-400">Minimum threshold: {item.minimumStock} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="warning">{item.stock} {item.unit} left</Badge>
                    <Link
                      to="/stock/add"
                      className="block text-[10px] text-indigo-400 font-semibold hover:underline mt-1"
                    >
                      + Restock Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
