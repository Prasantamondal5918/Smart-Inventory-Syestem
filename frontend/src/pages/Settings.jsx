import React from 'react';
import { useAuthStore } from '../store/authStore';
import Badge from '../components/common/Badge';
import { Store, Building, Mail, Phone, MapPin, ShieldCheck, Database } from 'lucide-react';

const Settings = () => {
  const { shop, user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Shop & Application Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Overview of active business configuration, shop profile, and database isolation</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
            {shop?.shopName ? shop.shopName.charAt(0) : 'S'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{shop?.shopName || 'Apex Supermarket'}</h2>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="purple">{shop?.businessType || 'Retail'}</Badge>
              <Badge variant="success">Active SAAS Tenant</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Business Contact</h4>
            <p className="text-slate-400 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{shop?.email || 'N/A'}</span>
            </p>
            <p className="text-slate-400 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>{shop?.phone || 'N/A'}</span>
            </p>
            <p className="text-slate-400 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{shop?.address || 'N/A'}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Tax & Branch Isolation</h4>
            <p className="text-slate-400">GST / Tax Identification Number:</p>
            <p className="font-mono text-indigo-400 font-bold text-sm">{shop?.gstNumber || 'Not Specified'}</p>
            <p className="text-slate-400 pt-1">Total Registered Outlets: <strong className="text-white">{shop?.branchCount || 1}</strong></p>
          </div>
        </div>

        <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 flex items-center space-x-3">
          <Database className="w-6 h-6 flex-shrink-0 text-indigo-400" />
          <div>
            <h5 className="font-bold text-white">Strict Multi-Tenant Shop Data Isolation</h5>
            <p className="text-slate-400 mt-0.5">All products, stock transactions, sales history and staff accounts are strictly scoped to shopId: <span className="font-mono text-indigo-400">{shop?._id}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
