import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bus,
  Clock,
  Users,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function DashboardPage({ setActiveTab }) {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sumData, trendData] = await Promise.all([
          api.getDashboardSummary(),
          api.getDashboardTrends()
        ]);
        setSummary(sumData);
        setTrends(trendData);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to connect to backend service.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium">Loading Hyderabad transport intelligence metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-950/20 border border-rose-800/50 rounded-xl text-rose-300 text-sm">
        <h3 className="font-bold mb-1 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          Backend Connection Notice
        </h3>
        <p className="text-xs text-rose-300/80 mb-3">{error}</p>
        <p className="text-xs text-slate-400">
          Ensure FastAPI backend is running at <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded">http://127.0.0.1:8000</code>
        </p>
      </div>
    );
  }

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Hyderabad Operations Hero Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#161f38] to-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              <MapPin className="w-3.5 h-3.5" /> Hyderabad Metropolitan Transport Operations Center
            </span>
            <span className="text-xs text-slate-400">• TSRTC Simulated Fleet</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Corridor Intelligence & Network Punctuality
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Real-time monitoring across 12 high-density transit corridors including Cyber Towers Hitech City, Ameerpet Interchange, Gachibowli Financial District, and LB Nagar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('agent')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            <span>Ask AI Operations Agent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="On-Time Performance"
          value={summary?.on_time_performance_pct || 81.4}
          unit="%"
          change="Target: 85.0%"
          isPositive={(summary?.on_time_performance_pct || 81.4) >= 80}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Average Network Delay"
          value={summary?.avg_network_delay_mins || 6.8}
          unit="mins"
          change="+1.2m vs Morning Baseline"
          isPositive={false}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Active Fleet Utilization"
          value={summary?.total_active_vehicles || 42}
          unit={`/ ${summary?.total_active_vehicles ? summary.total_active_vehicles + 6 : 48}`}
          change="87.5% Fleet Deployed"
          isPositive={true}
          icon={Bus}
          color="indigo"
        />
        <StatCard
          title="Passenger Volume Today"
          value={(summary?.total_passengers_today || 14280).toLocaleString('en-IN')}
          unit="passengers"
          change="Morning & Evening Peaks Active"
          isPositive={true}
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Secondary Quick Metrics & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Incident Alert Box */}
        <div className="bg-[#0f172a] border border-amber-900/40 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Critical Corridor Bottlenecks Detected
            </h3>
            <span className="text-[10px] text-amber-400 font-semibold uppercase bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
              {summary?.bunching_corridors_count || 1} Bunching Incident • {summary?.active_anomalies_count || 3} Anomalies
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start justify-between text-xs">
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Route 101: Bus Bunching between TS-09-UB-104 & TS-09-UB-103
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Secunderabad – Ameerpet – Hitech City corridor. Headway collapsed to 2.2 mins at Ameerpet Metro Hub.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-medium transition-colors shrink-0"
              >
                Review Action
              </button>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start justify-between text-xs">
              <div>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Route 105: Severe Delay on Mehdipatnam – Tolichowki Corridor
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Flyover approach congestion causing +23.4 min average delay for Gachibowli bound IT commuters.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('routes')}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] font-medium transition-colors shrink-0"
              >
                Inspect Route
              </button>
            </div>
          </div>
        </div>

        {/* Pending Recommendations Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Dispatch Support</h3>
              <Badge variant="warning">{summary?.pending_recommendations_count || 2} Pending</Badge>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI controller has formulated evidence-backed holding and short-turn recommendations requiring dispatcher authorization.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Confidence Avg: 91%</span>
            <button
              onClick={() => setActiveTab('dispatch')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open Dispatch Queue →
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Passenger Demand Curve */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Hyderabad Passenger Demand Profile (24-Hour)</h3>
              <p className="text-[11px] text-slate-400">Boardings vs. Alightings across all monitored stops</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Boardings</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Alightings</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.hourly_passenger_demand || []}>
                <defs>
                  <linearGradient id="colorBoard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="boardings" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBoard)" />
                <Area type="monotone" dataKey="alightings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAlight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay Distribution Buckets */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Delay Categorization</h3>
            <p className="text-[11px] text-slate-400 mb-3">Completed trip deviation segments</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trends?.delay_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {(trends?.delay_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-2 border-t border-slate-800">
            {(trends?.delay_distribution || []).map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="truncate">{entry.category}: <b>{entry.count}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corridor Punctuality Comparison Bar Chart */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Corridor On-Time Performance Comparison</h3>
            <p className="text-[11px] text-slate-400">Punctuality rate (%) across the 12 Hyderabad corridors</p>
          </div>
          <button
            onClick={() => setActiveTab('routes')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All Corridors →
          </button>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends?.route_performance_comparison || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="route_name" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                formatter={(val, name) => [`${val}%`, 'On-Time Rate']}
              />
              <Bar dataKey="on_time_pct" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

