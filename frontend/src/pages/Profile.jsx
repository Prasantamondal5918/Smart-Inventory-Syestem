import React from 'react';
import { useAuthStore } from '../store/authStore';
import Badge from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import { User, Mail, Phone, Calendar, ShieldCheck, Briefcase } from 'lucide-react';

const Profile = () => {
  const { user, shop } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <h1 className="text-2xl font-bold text-white">User Profile & Account Info</h1>
        <p className="text-xs text-slate-400 mt-0.5">Your staff credentials & authorization status</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-2xl shadow-xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={user?.role === 'owner' ? 'purple' : 'info'}>
                {user?.role === 'owner' ? 'Shop Owner' : 'Worker'}
              </Badge>
              {user?.workerId && <span className="font-mono text-xs text-indigo-400">ID: {user.workerId}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block font-medium">Designation / Role:</span>
            <p className="font-bold text-white text-sm flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>{user?.designation || 'Staff'}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block font-medium">Associated Shop:</span>
            <p className="font-bold text-white text-sm">{shop?.shopName || 'Apex Supermarket'}</p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block font-medium">Phone Contact:</span>
            <p className="font-bold text-white text-sm flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{user?.phone || 'N/A'}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block font-medium">Account Status:</span>
            <span className="inline-block">
              <Badge variant={user?.status === 'active' ? 'success' : 'danger'}>
                {(user?.status || 'active').toUpperCase()}
              </Badge>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
