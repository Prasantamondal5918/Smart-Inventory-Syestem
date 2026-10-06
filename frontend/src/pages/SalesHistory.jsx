import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import InvoiceView from '../components/invoice/InvoiceView';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Receipt, Search, Eye, Printer, Calendar, User, CreditCard } from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedSale, setSelectedSale] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(paymentMethod && { paymentMethod }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const res = await API.get(`/sales?${queryParams.toString()}`);
      setSales(res.data.sales);
      setTotalPages(res.data.pagination.pages);
      setTotalItems(res.data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch sales history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, paymentMethod, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSales();
  };

  const handleViewInvoice = async (saleId) => {
    try {
      const res = await API.get(`/sales/${saleId}`);
      setSelectedSale(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales & Invoice History</h1>
          <p className="text-xs text-slate-400 mt-0.5">Audit transaction records, payment methods, and customer invoices</p>
        </div>

        <Link
          to="/pos"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Receipt className="w-4 h-4" />
          <span>New Sale (POS)</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Invoice # or Customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Sales History Table */}
      {loading ? (
        <LoadingSpinner label="Retrieving sales records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSales} />
      ) : sales.length === 0 ? (
        <EmptyState title="No Sales Transactions Found" description="Completed transactions will appear here." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Cashier / Staff</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Items</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-indigo-300">{sale.invoiceNo}</td>

                    <td className="py-3 px-4 text-slate-300">{formatDateTime(sale.createdAt)}</td>

                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {sale.cashier?.name || 'Staff'}
                      {sale.cashier?.workerId && (
                        <span className="block text-[10px] text-slate-500">ID: {sale.cashier.workerId}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      {sale.customer?.name || 'Walk-in'}
                      {sale.customer?.phone && <span className="block text-[10px] text-slate-500">{sale.customer.phone}</span>}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-300">{sale.products.length}</td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant="purple">{sale.paymentMethod.toUpperCase()}</Badge>
                    </td>

                    <td className="py-3 px-4 text-right font-extrabold text-emerald-400 text-sm">{formatCurrency(sale.total)}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewInvoice(sale._id)}
                        className="inline-flex items-center space-x-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold rounded-lg text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Invoice Modal */}
      <Modal
        isOpen={Boolean(selectedSale)}
        onClose={() => setSelectedSale(null)}
        title="Invoice Details"
        maxWidth="max-w-3xl"
      >
        <InvoiceView sale={selectedSale} onPrint={() => window.print()} />
      </Modal>
    </div>
  );
};

export default SalesHistory;
