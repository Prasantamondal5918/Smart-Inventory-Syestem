import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data found', description = 'There are no items to display right now.', icon: Icon = PackageOpen, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-800/40 rounded-xl border border-slate-700/50 text-center my-4">
      <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
