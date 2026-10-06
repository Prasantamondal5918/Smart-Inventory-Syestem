import React, { useState, useEffect } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import { BarChart3, Download, DollarSign, TrendingUp, Percent, Package, Users, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await API.get(`/reports/summary?${queryParams.toString()}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to calculate reports summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/reports/export', '_blank');
  };

  if (loading) return <LoadingSpinner label="Running MongoDB Aggregation Pipelines..." />;
  if (error) return <ErrorState title="Report Generation Error" message={error} onRetry={fetchReports} />;

  const { summary, categoryBreakdown, workerPerformance, mostSelling, leastSelling, paymentMethods } = data;

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Intelligence & Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">Real profit analytics, category breakdown & cashier performance</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap items-center gap-4 text-xs text-slate-300">
        <span className="font-semibold text-white">Filter Report Period:</span>
        <div className="flex items-center space-x-2">
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-indigo-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(summary.totalRevenue)}
          subtext={`${summary.totalUnitsSold} total units sold`}
          icon={DollarSign}
          color="indigo"
        />
        <StatCard
          title="Cost of Goods Sold"
          value={formatCurrency(summary.totalCost)}
          subtext="Purchase price cost"
          icon={Package}
          color="amber"
        />
        <StatCard
          title="Calculated Net Profit"
          value={formatCurrency(summary.netProfit)}
          subtext="Revenue - Cost"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Sales Tax Collected"
          value={formatCurrency(summary.totalTax)}
          subtext="Tax liabilities"
          icon={Percent}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-white text-base mb-1">Category-wise Revenue</h3>
          <p className="text-xs text-slate-400 mb-4">Total sales generated per product category</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="categoryName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Bar dataKey="totalRevenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Performance Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-white text-base mb-1">Worker Sales Performance</h3>
          <p className="text-xs text-slate-400 mb-4">Total revenue handled by staff members</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="workerName" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                  formatter={(val) => [formatCurrency(val), 'Sales']}
                />
                <Bar dataKey="totalSales" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most & Least Selling Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Selling */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-white text-base mb-3">Most Selling Products</h3>
          <div className="space-y-2.5">
            {mostSelling.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div>
                  <h5 className="text-xs font-bold text-white">{p.productName}</h5>
                  <p className="text-[11px] text-slate-400">{p.totalQuantity} units sold</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-400 block">{formatCurrency(p.totalRevenue)}</span>
                  <span className="text-[10px] text-indigo-400">Profit: {formatCurrency(p.profit)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Selling */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-white text-base mb-3">Least Selling Products</h3>
          <div className="space-y-2.5">
            {leastSelling.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div>
                  <h5 className="text-xs font-bold text-white">{p.productName}</h5>
                  <p className="text-[11px] text-slate-400">{p.totalQuantity} units sold</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-300 block">{formatCurrency(p.totalRevenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
