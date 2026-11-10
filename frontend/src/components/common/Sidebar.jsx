import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  Route,
  Bus,
  Users,
  Bot,
  SlidersHorizontal,
  Settings,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'live-operations', label: 'Live Operations', icon: Navigation, badge: 'Live GPS' },
    { id: 'routes', label: 'Route Intelligence', icon: Route },
    { id: 'fleet', label: 'Fleet Analytics', icon: Bus },
    { id: 'demand', label: 'Passenger Demand', icon: Users },
    { id: 'agent', label: 'AI Operations Agent', icon: Bot, highlight: true },
    { id: 'dispatch', label: 'Dispatch Center', icon: SlidersHorizontal },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg">
            CQ
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              Corridor<span className="text-indigo-400">IQ</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">OPERATIONS INTELLIGENCE</p>
          </div>
        </div>
      </div>

      {/* Region Status Pill */}
      <div className="px-4 py-3 border-b border-slate-800/40 bg-slate-900/40">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-medium text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Hyderabad
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            12 Corridors
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> Gemini
                </span>
              )}
              {item.badge && !item.highlight && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#090d16]">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>v1.0.0 Production MVP</span>
          <span className="text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
          </span>
        </div>
      </div>
    </aside>
  );
}

