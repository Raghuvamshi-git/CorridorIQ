import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, Clock, ArrowUpRight, ShieldAlert } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function DemandPage() {
  const [demandData, setDemandData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDemand() {
      try {
        setLoading(true);
        const data = await api.getPassengerDemand();
        setDemandData(data);
      } catch (err) {
        console.error('Failed to load demand:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDemand();
  }, []);

  const totalMorning = demandData.reduce((acc, d) => acc + (d.peak_morning_volume || 0), 0);
  const totalEvening = demandData.reduce((acc, d) => acc + (d.peak_evening_volume || 0), 0);

  const chartData = demandData.map(d => ({
    name: `R-${d.route_short_name}`,
    corridor: d.corridor_name,
    morning_peak: d.peak_morning_volume,
    evening_peak: d.peak_evening_volume
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          Hyderabad Commuter Demand & Capacity Optimization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Hourly ridership peaks, stop boarding surges, and vehicle overcrowding across Cyberabad and commercial spines.
        </p>
      </div>

      {/* Top Demand Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Morning Rush Peak (08:00 - 10:30)"
          value={totalMorning.toLocaleString('en-IN')}
          unit="boardings"
          change="Metro Feeders & IT Trunk Surge"
          isPositive={true}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Evening Rush Peak (17:00 - 20:30)"
          value={totalEvening.toLocaleString('en-IN')}
          unit="boardings"
          change="Hitech City & Gachibowli Outflow"
          isPositive={true}
          icon={TrendingUp}
          color="cyan"
        />
        <StatCard
          title="Active Overcrowding Alerts"
          value="2"
          unit="corridors"
          change="Load Factor > 1.10x"
          isPositive={false}
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Peak Hour Comparison Bar Chart */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Corridor Peak-Hour Demand Breakdown</h3>
            <p className="text-[11px] text-slate-400">Comparing Morning Peak (08:00-10:00) vs. Evening Peak (17:00-20:00)</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Morning Rush</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-400" /> Evening Rush</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
              />
              <Bar dataKey="morning_peak" fill="#6366f1" name="Morning Peak" radius={[3, 3, 0, 0]} />
              <Bar dataKey="evening_peak" fill="#22d3ee" name="Evening Peak" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overcrowding Hotspots & Alerts */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Critical Overcrowding Hotspots & Mitigation Strategies
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Ameerpet Metro Hub (Interchange)</span>
              <Badge variant="danger">1.35x Overcrowded</Badge>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Massive commuter transfer from Red and Blue metro lines transferring to Route 101 towards Cyber Towers.
            </p>
            <div className="text-[11px] text-indigo-400 font-medium">
              💡 Prescribed Intervention: Deploy 2 auxiliary 65-capacity Electric feeder shuttles starting at Ameerpet station platform.
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white">Cyber Towers & Mindspace Junction</span>
              <Badge variant="warning">1.18x Peak Surge</Badge>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Evening IT workforce egress heading towards Gachibowli Stadium and Kondapur during 17:45 - 19:30.
            </p>
            <div className="text-[11px] text-cyan-400 font-medium">
              💡 Prescribed Intervention: Adjust scheduled headway from 8 minutes down to 6 minutes for Route 102.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

