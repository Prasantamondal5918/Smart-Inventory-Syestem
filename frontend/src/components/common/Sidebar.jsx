import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  Truck,
  GitBranch,
  History,
  Bell,
  Settings,
  User,
  X,
  Sparkles,
  Bot,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const isOwner = user?.role === 'owner';

  const ownerMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Inventory', path: '/stock', icon: Boxes },
    { label: 'POS Terminal', path: '/pos', icon: ShoppingCart },
    { label: 'Sales History', path: '/sales', icon: Receipt },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Workers', path: '/workers', icon: Users },
    { label: 'Suppliers', path: '/suppliers', icon: Truck },
    { label: 'Branches', path: '/branches', icon: GitBranch },
    { label: 'Activity Logs', path: '/activity-logs', icon: History },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const workerMenuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Inventory', path: '/stock', icon: Boxes },
    { label: 'POS Terminal', path: '/pos', icon: ShoppingCart },
    { label: 'Sales History', path: '/sales', icon: Receipt },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const menuItems = isOwner ? ownerMenuItems : workerMenuItems;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight tracking-tight">SmartInventory</h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wide">POS & SAAS SYSTEM</p>
            </div>
          </div>
          {isMobileOpen && (
            <button onClick={onCloseMobile} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">System Status</span>
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Online
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">MERN Stack v1.0 Production</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed left-0 top-0 bottom-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-xs z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
