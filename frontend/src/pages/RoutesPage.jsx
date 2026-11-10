import React, { useState, useEffect } from 'react';
import { Route, Clock, CheckCircle2, Users, AlertTriangle, ArrowRight, ShieldAlert, Bus } from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('R-101');
  const [routeDetail, setRouteDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoading(true);
        const data = await api.getRoutes();
        setRoutes(data);
        if (data.length > 0) {
          setSelectedRouteId(data[0].route_id);
        }
      } catch (err) {
        console.error('Failed to load routes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoutes();
  }, []);

  useEffect(() => {
    async function loadRouteDetail() {
      if (!selectedRouteId) return;
      try {
        setDetailLoading(true);
        const detail = await api.getRouteDetail(selectedRouteId);
        setRouteDetail(detail);
      } catch (err) {
        console.error('Failed to load route detail:', err);
      } finally {
        setDetailLoading(false);
      }
    }
    loadRouteDetail();
  }, [selectedRouteId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Route className="w-5 h-5 text-indigo-400" />
          Hyderabad Corridor Intelligence & Headway Monitoring
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Punctuality performance, stop sequences, and headway regularity across the 12 metropolitan corridors.
        </p>
      </div>

      {/* Main Grid: Left Route Selector, Right Deep Dive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Corridors List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Hyderabad Corridors ({routes.length})
          </h3>
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {routes.map((r) => {
              const isSelected = selectedRouteId === r.route_id;
              return (
                <div
                  key={r.route_id}
                  onClick={() => setSelectedRouteId(r.route_id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-[#0f172a] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: r.color }}
                        />
                        <span className="font-bold text-sm text-white">Route {r.route_short_name}</span>
                        {r.route_short_name === '101' && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-rose-950 text-rose-400 border border-rose-800 rounded font-bold uppercase">
                            Bunching
                          </span>
                        )}
                        {r.route_short_name === '105' && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold uppercase">
                            Delayed
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{r.corridor_name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                        {r.origin} ➔ {r.destination}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-400">{r.on_time_percentage}%</span>
                      <span className="block text-[10px] text-slate-400">On-Time</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Avg Delay: <b className="text-slate-200">{r.avg_delay_mins}m</b></span>
                    <span>Distance: <b className="text-slate-200">{r.distance_km} km</b></span>
                    <span>Headway: <b className="text-slate-200">{r.target_headway_mins}m</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Selected Route Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {detailLoading ? (
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading corridor telemetry & stops...</p>
            </div>
          ) : routeDetail ? (
            <div className="space-y-4">
              {/* Corridor Overview Card */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                        Route {routeDetail.route.route_short_name}
                      </span>
                      <span className="text-xs text-slate-400">• {routeDetail.route.corridor_name}</span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {routeDetail.route.origin} to {routeDetail.route.destination}
                    </h2>
                  </div>

                  {routeDetail.bunching_detected && (
                    <Badge variant="danger" size="md">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      BUS BUNCHING ACTIVE
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-900/80 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Length</span>
                    <span className="font-bold text-white">{routeDetail.route.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Target Headway</span>
                    <span className="font-bold text-white">{routeDetail.route.target_headway_mins} mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">Average Delay</span>
                    <span className={`font-bold ${routeDetail.route.avg_delay_mins > 10 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {routeDetail.route.avg_delay_mins} mins
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 block">OTP Punctuality</span>
                    <span className="font-bold text-emerald-400">{routeDetail.route.on_time_percentage}%</span>
                  </div>
                </div>

                {/* Service Alert on this Route */}
                {routeDetail.service_alerts && routeDetail.service_alerts.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs">
                    <p className="font-bold text-amber-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      {routeDetail.service_alerts[0].header}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {routeDetail.service_alerts[0].description}
                    </p>
                  </div>
                )}
              </div>

              {/* Station-by-Station Progression Table */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Stop-by-Stop Schedule Adherence & Passenger Accumulation
                  </h3>
                  <span className="text-xs text-slate-400">
                    {routeDetail.stops?.length || 0} Designated Stops
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Seq</th>
                        <th className="px-4 py-2.5">Stop / Station Name</th>
                        <th className="px-4 py-2.5">Scheduled</th>
                        <th className="px-4 py-2.5">Actual Arr</th>
                        <th className="px-4 py-2.5">Delay</th>
                        <th className="px-4 py-2.5">Board / Alight</th>
                        <th className="px-4 py-2.5">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {(routeDetail.stops || []).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="px-4 py-2.5 font-mono text-slate-500 font-bold">{s.stop_sequence}</td>
                          <td className="px-4 py-2.5 font-medium text-white">{s.stop_name}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-400">{s.scheduled_arrival}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-300">{s.actual_arrival || '—'}</td>
                          <td className="px-4 py-2.5 font-semibold">
                            {s.delay_seconds > 0 ? (
                              <span className={s.delay_seconds > 300 ? 'text-rose-400' : 'text-amber-400'}>
                                +{Math.round(s.delay_seconds / 60)}m
                              </span>
                            ) : (
                              <span className="text-emerald-400">On Time</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-[11px] text-slate-400">
                            +{s.boarding_count} / -{s.alighting_count}
                          </td>
                          <td className="px-4 py-2.5 font-mono font-medium text-white">
                            {s.current_occupancy} pax
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a corridor from the left list to inspect stops and vehicle positions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

