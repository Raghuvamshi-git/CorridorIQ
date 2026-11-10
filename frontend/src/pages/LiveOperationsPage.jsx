import React, { useState, useEffect } from 'react';
import { Navigation, Bus, RefreshCw, Filter, AlertTriangle, BatteryCharging, Zap } from 'lucide-react';
import HyderabadTransitMap from '../components/map/HyderabadTransitMap';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function LiveOperationsPage() {
  const [positions, setPositions] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveTelemetry = async (routeId = '') => {
    try {
      setRefreshing(true);
      const promises = [
        api.getVehiclePositions(routeId),
        routes.length === 0 ? api.getRoutes() : Promise.resolve(routes)
      ];
      if (routeId) {
        promises.push(api.getRouteDetail(routeId));
      }

      const results = await Promise.all(promises);
      setPositions(results[0]);
      if (routes.length === 0) setRoutes(results[1]);
      if (routeId && results[2]?.stops) {
        setStops(results[2].stops);
      } else if (!routeId) {
        setStops([]);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry(selectedRoute);
    const interval = setInterval(() => fetchLiveTelemetry(selectedRoute), 15000);
    return () => clearInterval(interval);
  }, [selectedRoute]);

  const handleRouteFilter = (e) => {
    setSelectedRoute(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-indigo-400" />
              Live Corridor Operations & Simulated Telemetry
            </h1>
            <Badge variant="warning">SIMULATED GPS FEED</Badge>
          </div>
          <p className="text-xs text-slate-400">
            Real-time tracking of 48 Hyderabad metropolitan buses along 12 active transit corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Corridor Filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoute}
              onChange={handleRouteFilter}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="">All Hyderabad Corridors</option>
              {routes.map(r => (
                <option key={r.route_id} value={r.route_id} className="bg-slate-900">
                  Route {r.route_short_name} — {r.corridor_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchLiveTelemetry(selectedRoute)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* Interactive Hyderabad Map Component */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Hyderabad Geographical Telemetry Layer
          </span>
          <span className="text-[11px] text-slate-500">
            Showing {positions.length} simulated vehicles reporting active GPS
          </span>
        </div>
        <HyderabadTransitMap positions={positions} stops={stops} selectedRoute={selectedRoute} height="520px" />
      </div>

      {/* Live Fleet Position Records Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bus className="w-4 h-4 text-indigo-400" />
            Simulated Fleet Telemetry Log
          </h3>
          <span className="text-xs text-slate-400">
            Refreshed automatically every 15s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Vehicle ID</th>
                <th className="px-4 py-3">Assigned Route</th>
                <th className="px-4 py-3">GPS Coordinates</th>
                <th className="px-4 py-3">Speed</th>
                <th className="px-4 py-3">Passenger Load</th>
                <th className="px-4 py-3">Occupancy Status</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {positions.slice(0, 15).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-white">
                    {p.vehicle_label || p.vehicle_id}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-200">Route {p.route_short_name || '101'}</span>
                    <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">{p.corridor_name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                    {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span className={p.speed_kmh < 15 ? 'text-rose-400' : 'text-slate-200'}>
                      {p.speed_kmh} km/h
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{p.passenger_count}</span>
                      <span className="text-[10px] text-slate-400">({Math.round((p.passenger_load_factor || 0.5) * 100)}%)</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.occupancy_status === 'CRUSHED_STANDING_ROOM' ? 'danger'
                        : p.occupancy_status === 'STANDING_ROOM_ONLY' ? 'warning'
                        : 'success'
                      }
                      size="xs"
                    >
                      {p.occupancy_status?.replaceAll('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {new Date(p.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'IN_SERVICE' ? 'success' : 'warning'} size="xs">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

