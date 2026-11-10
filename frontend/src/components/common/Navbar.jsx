import React, { useState, useEffect } from 'react';
import { Search, Bell, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import Badge from './Badge';

export default function Navbar({ activeTabTitle, onRefresh, isRefreshing }) {
  const [currentISTTime, setCurrentISTTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as DD-MM-YYYY HH:mm:ss IST
      const datePart = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = now.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentISTTime(`${datePart} ${timePart} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Hyderabad Operations Center</span>
          <span>/</span>
          <span className="text-slate-200 font-medium capitalize">{activeTabTitle}</span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">
          {activeTabTitle === 'Overview' ? 'Hyderabad Metropolitan Transit Operations' : activeTabTitle}
        </h2>
      </div>

      {/* Center / Search */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search corridors, stops, buses..."
          className="w-full bg-slate-900/80 border border-slate-800 text-xs rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Environment Disclosure Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40 text-amber-400 text-xs font-semibold tracking-wide">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>SIMULATED DATA</span>
        </div>

        {/* Operating Clock */}
        <div className="hidden lg:block text-right border-l border-slate-800 pl-3">
          <p className="text-[10px] text-slate-400 uppercase font-medium">Operating Window</p>
          <p className="text-xs font-mono font-medium text-slate-200">{currentISTTime || '10-11-2026 IST'}</p>
        </div>

        {/* Refresh Seeder Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh transit data"
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors relative"
        >
          <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Notifications */}
        <button
          title="2 Operational Alerts Active"
          className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 animate-ping" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
        </button>

        {/* Controller Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
            HC
          </div>
          <div className="hidden xl:block text-left text-xs">
            <p className="font-semibold text-white leading-none">Controller</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">TSRTC Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
}

