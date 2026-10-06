import React, { useState, useEffect } from 'react';
import API from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import Badge from '../components/common/Badge';
import { formatDateTime } from '../utils/formatters';
import { History, User, Activity, Globe, Shield } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [workerId, setWorkerId] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 15,
        ...(workerId && { workerId }),
        ...(action && { action }),
      });
      const [logRes, workerRes] = await Promise.all([
        API.get(`/activity-logs?${queryParams.toString()}`),
        API.get('/workers?limit=100'),
      ]);
      setLogs(logRes.data.logs);
      setTotalPages(logRes.data.pagination.pages);
      setTotalItems(logRes.data.pagination.total);
      setWorkers(workerRes.data.workers || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch activity audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, workerId, action]);

  const getActionBadge = (act) => {
    if (act.includes('LOGIN')) return <Badge variant="info">{act}</Badge>;
    if (act.includes('SALE')) return <Badge variant="success">{act}</Badge>;
    if (act.includes('STOCK') || act.includes('PRODUCT')) return <Badge variant="purple">{act}</Badge>;
    if (act.includes('DELETE') || act.includes('FAILED')) return <Badge variant="danger">{act}</Badge>;
    return <Badge variant="default">{act}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">System Activity Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-0.5">Immutable audit log tracking all worker actions, sales & stock modifications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg flex flex-wrap gap-3">
        <select
          value={workerId}
          onChange={(e) => {
            setWorkerId(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Workers & Owners</option>
          {workers.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name} ({w.workerId})
            </option>
          ))}
        </select>

        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Action Types</option>
          <option value="LOGIN">LOGIN</option>
          <option value="LOGOUT">LOGOUT</option>
          <option value="FAILED_LOGIN">FAILED_LOGIN</option>
          <option value="ADD_PRODUCT">ADD_PRODUCT</option>
          <option value="UPDATE_PRODUCT">UPDATE_PRODUCT</option>
          <option value="DELETE_PRODUCT">DELETE_PRODUCT</option>
          <option value="ADD_STOCK">ADD_STOCK</option>
          <option value="COMPLETE_SALE">COMPLETE_SALE</option>
          <option value="ADD_WORKER">ADD_WORKER</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner label="Fetching security audit logs..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : logs.length === 0 ? (
        <EmptyState title="No Activity Logs Recorded" description="System activities will automatically be recorded here." />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4 text-center">Action Type</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">{formatDateTime(log.createdAt)}</td>

                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {log.userId?.name || 'System User'}
                      {log.userId?.role && <span className="block text-[10px] text-slate-500 capitalize">{log.userId.role}</span>}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">{getActionBadge(log.action)}</td>

                    <td className="py-3 px-4 text-slate-200">{log.description}</td>

                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px] whitespace-nowrap">{log.ipAddress}</td>
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

export default ActivityLogs;
