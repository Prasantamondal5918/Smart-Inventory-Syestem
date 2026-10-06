import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Search, Bell, Menu, User, LogOut, Store, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import Badge from './Badge';

const Header = ({ onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { user, shop, logout } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling notifications every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'out_of_stock':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu toggle + Shop Name */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center space-x-2 text-slate-300 font-semibold text-sm">
          <Store className="w-5 h-5 text-indigo-400" />
          <span className="text-white">{shop?.shopName || 'Smart Inventory'}</span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, barcode, invoice, worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </form>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h4 className="font-semibold text-white text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-xs text-slate-500">No notifications available</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`p-3 text-xs flex items-start space-x-3 cursor-pointer hover:bg-slate-800/60 transition-colors ${
                        !notif.isRead ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-200">{notif.title}</p>
                        <p className="text-slate-400 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-800 text-center bg-slate-950/50">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <Badge variant={user?.role === 'owner' ? 'purple' : 'info'} className="mt-1">
                  {user?.role === 'owner' ? 'Shop Owner' : 'Worker'}
                </Badge>
              </div>

              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
