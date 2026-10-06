import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles, ShieldCheck, Zap, BarChart2 } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">SmartInventory</h2>
        <p className="mt-1 text-sm text-slate-400">Production-Ready Inventory & POS System</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-2xl p-6 sm:p-8">
          <Outlet />
        </div>
      </div>

      {/* Highlights footer */}
      <div className="mt-8 sm:mx-auto sm:max-w-lg flex items-center justify-center space-x-6 text-xs text-slate-500 z-10">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>JWT Authenticated</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Real-time POS</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          <span>MongoDB Powered</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
