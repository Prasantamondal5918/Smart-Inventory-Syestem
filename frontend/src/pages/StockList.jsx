import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import { Boxes, Plus, Search, Calendar, Truck, User } from 'lucide-react';

const StockList = () => {
  const [stockLogs, setStockLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchStockLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/stock?page=${page}&limit=10`);
      setStockLogs(res.data.stockLogs);
      setTotalPages(res.data.pagination.pages);
      setTotalItems(res.data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory stock logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock & Inventory Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track restock transactions, supplier invoices, and batch expiry dates</p>
        </div>

        <Link
          to="/stock/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Stock</span>
        </Link>
      </div>

      {/* Stock Logs Table */}
      {loading ? (
        <LoadingSpinner label="Retrieving inventory history..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStockLogs} />
      ) : stockLogs.length === 0 ? (
        <EmptyState
          title="No Stock Transactions Recorded"
          description="Click 'Add New Stock' to log restocked inventory items."
          action={
            <Link
              to="/stock/add"
              className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4 text-center">Qty Added</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Invoice & Batch</th>
                  <th className="py-3.5 px-4">Purchase Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Worker Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stockLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {log.productId?.productName || 'Deleted Product'}
                      {log.productId?.barcode && (
                        <p className="text-[10px] font-mono text-slate-400">Barcode: {log.productId.barcode}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-emerald-400 text-sm">
                      +{log.quantity}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{log.supplier}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {log.invoiceNumber && <p className="font-mono text-indigo-300 font-semibold">{log.invoiceNumber}</p>}
                      {log.batchNumber && <p className="text-[10px] text-slate-400">Batch: {log.batchNumber}</p>}
                    </td>

                    <td className="py-3 px-4 text-slate-300">{formatDate(log.purchaseDate)}</td>

                    <td className="py-3 px-4">
                      {log.expiryDate ? (
                        <span className="text-amber-400 font-medium">{formatDate(log.expiryDate)}</span>
                      ) : (
                        <span className="text-slate-500">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.workerId?.name || 'Worker'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} totalItems={totalItems} onPageChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};

export default StockList;
