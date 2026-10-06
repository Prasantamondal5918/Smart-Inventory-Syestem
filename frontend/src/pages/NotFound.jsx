import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 max-w-sm mt-2 mb-6">
        The route or resource you are trying to access does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;
