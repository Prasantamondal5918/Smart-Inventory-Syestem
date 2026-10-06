import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'indigo', trend }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color]} border backdrop-blur-md shadow-lg transition-transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {(subtext || trend) && (
        <div className="mt-3 flex items-center text-xs text-slate-400 space-x-2">
          {trend && (
            <span className={`font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
