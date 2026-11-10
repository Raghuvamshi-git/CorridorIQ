import React from 'react';

export default function StatCard({ title, value, unit = '', change, isPositive, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/40',
    rose: 'text-rose-400 bg-rose-950/60 border-rose-800/40',
    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40'
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all duration-200 shadow-sm relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
            {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
          </div>
          {change && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.indigo} group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-slate-800 to-transparent group-hover:via-indigo-500/50 transition-all" />
    </div>
  );
}

