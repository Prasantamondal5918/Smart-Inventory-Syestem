import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { Users, Plus, Search, Edit3, Trash2, ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchWorkers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/workers?page=${page}&limit=10${search ? `&search=${search}` : ''}`);
      setWorkers(res.data.workers);
      setTotalPages(res.data.pagination.pages);
      setTotalItems(res.data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch workers staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [page]);

  const handleToggleStatus = async (worker) => {
    const newStatus = worker.status === 'active' ? 'inactive' : 'active';
    try {
      await API.put(`/workers/${worker._id}`, { status: newStatus });
      toast.success(`Worker '${worker.name}' status set to ${newStatus}`);
      fetchWorkers();
    } catch (err) {
      toast.error(err.message || 'Failed to update worker status');
    }
  };

  const handleDeleteWorker = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete worker '${name}'?`)) return;
    try {
      await API.delete(`/workers/${id}`);
      toast.success(`Worker '${name}' deleted successfully`);
      fetchWorkers();
    } catch (err) {
      toast.error(err.message || 'Failed to delete worker');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Worker & Staff Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage store cashiers, inventory workers, status & access credentials</p>
        </div>

        <Link
          to="/workers/add"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Worker</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchWorkers();
          }}
          className="relative max-w-md"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by worker name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Workers Directory Table */}
      {loading ? (
        <LoadingSpinner label="Retrieving worker directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchWorkers} />
      ) : workers.length === 0 ? (
        <EmptyState
          title="No Workers Registered"
          description="Click 'Add New Worker' to create staff logins for your shop."
          action={
            <Link
              to="/workers/add"
              className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>Add Worker</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Worker ID & Name</th>
                  <th className="py-3.5 px-4">Email & Phone</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {workers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{w.name}</p>
                          <p className="text-[10px] text-indigo-400 font-mono font-semibold">{w.workerId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <p className="font-medium text-slate-200">{w.email}</p>
                      {w.phone && <p className="text-[11px] text-slate-400">{w.phone}</p>}
                    </td>

                    <td className="py-3 px-4 font-semibold text-indigo-300">{w.designation}</td>

                    <td className="py-3 px-4 text-slate-400">{formatDate(w.joiningDate)}</td>

                    <td className="py-3 px-4 text-center">
                      <Badge variant={w.status === 'active' ? 'success' : 'danger'}>
                        {w.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(w)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            w.status === 'active'
                              ? 'text-amber-400 hover:bg-amber-950/30'
                              : 'text-emerald-400 hover:bg-emerald-950/30'
                          }`}
                          title={w.status === 'active' ? 'Deactivate Worker' : 'Activate Worker'}
                        >
                          {w.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>

                        <Link
                          to={`/workers/edit/${w._id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Worker & Reset Password"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeleteWorker(w._id, w.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Worker"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

export default Workers;
