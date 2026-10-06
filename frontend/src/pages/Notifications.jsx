import React, { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import { formatDateTime } from '../utils/formatters';
import { Bell, Check, CheckCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';

const Notifications = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, loading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotifBadge = (type) => {
    switch (type) {
      case 'low_stock':
        return <Badge variant="warning">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="danger">Out of Stock</Badge>;
      case 'large_sale':
        return <Badge variant="success">Large Sale</Badge>;
      case 'failed_login':
        return <Badge variant="danger">Security Alert</Badge>;
      default:
        return <Badge variant="info">System</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications Center</h1>
          <p className="text-xs text-slate-400 mt-0.5">Automated inventory alerts, low stock warnings & security activity</p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching notification alerts..." />
      ) : notifications.length === 0 ? (
        <EmptyState title="No Notifications" description="You have no notifications or alerts at this time." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition-colors flex items-start justify-between space-x-4 ${
                !notif.isRead
                  ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-950/20'
                  : 'bg-slate-900/40 border-slate-800 opacity-70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {getNotifBadge(notif.type)}
                  <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                </div>
                <p className="text-xs text-slate-300">{notif.message}</p>
                <p className="text-[10px] text-slate-500">{formatDateTime(notif.createdAt)}</p>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif._id)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Read</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
