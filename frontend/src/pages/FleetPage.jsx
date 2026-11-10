import React, { useState, useEffect } from 'react';
import { Bus, BatteryCharging, Zap, Fuel, AlertOctagon, Wrench, CheckCircle, Filter } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function FleetPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filterPropulsion, setFilterPropulsion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFleet() {
      try {
        setLoading(true);
        const data = await api.getVehicles({
          propulsion: filterPropulsion || undefined,
          status: filterStatus || undefined
        });
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load fleet:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFleet();
  }, [filterPropulsion, filterStatus]);

  const totalCount = vehicles.length;
  const electricCount = vehicles.filter(v => v.propulsion_type === 'ELECTRIC').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'MAINTENANCE').length;
  const inServiceCount = vehicles.filter(v => v.status === 'IN_SERVICE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Bus className="w-5 h-5 text-indigo-400" />
          Hyderabad Metropolitan Fleet Telemetry & Health Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Diagnostics, propulsion efficiency, battery levels, and maintenance status for 48 active transit buses.
        </p>
      </div>

      {/* Fleet KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monitored Fleet"
          value={totalCount || 48}
          unit="buses"
          change="TSRTC Hyderabad Region"
          isPositive={true}
          icon={Bus}
          color="indigo"
        />
        <StatCard
          title="Buses In Service"
          value={inServiceCount || 42}
          unit={`(${Math.round(((inServiceCount || 42) / (totalCount || 48)) * 100)}%)`}
          change="Actively Dispatchable"
          isPositive={true}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Zero-Emission Electric Fleet"
          value={electricCount || 20}
          unit="Switch EiV 12"
          change="42% Green Transit Ratio"
          isPositive={true}
          icon={Zap}
          color="cyan"
        />
        <StatCard
          title="In Maintenance / Inspection"
          value={maintenanceCount || 2}
          unit="units"
          change="Battery & Brake Recalls"
          isPositive={maintenanceCount === 0}
          icon={Wrench}
          color="amber"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filter Fleet:</span>

          {/* Propulsion Filter */}
          <select
            value={filterPropulsion}
            onChange={(e) => setFilterPropulsion(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Propulsion Types</option>
            <option value="ELECTRIC">Electric (Switch EiV)</option>
            <option value="CNG">CNG (Tata Starbus)</option>
            <option value="DIESEL">Diesel (Volvo Low-Floor)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Vehicle Statuses</option>
            <option value="IN_SERVICE">In Service</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="IDLE">Idle / Standby</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Showing {vehicles.length} vehicle units
        </span>
      </div>

      {/* Fleet Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const isElectric = v.propulsion_type === 'ELECTRIC';
          const isLow = v.fuel_or_battery_level < 25;
          return (
            <div
              key={v.id}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-white tracking-wide">{v.vehicle_label}</span>
                    <Badge
                      variant={
                        v.status === 'IN_SERVICE' ? 'success'
                        : v.status === 'MAINTENANCE' ? 'danger'
                        : 'default'
                      }
                      size="xs"
                    >
                      {v.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{v.model}</p>
                </div>

                <span className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                  isElectric ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                  : v.propulsion_type === 'CNG' ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-400'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                }`}>
                  {isElectric ? <Zap className="w-3.5 h-3.5" /> : <Fuel className="w-3.5 h-3.5" />}
                  {v.propulsion_type}
                </span>
              </div>

              {/* Battery / Fuel Gauge */}
              <div className="space-y-1.5 my-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    {isElectric ? 'Battery Level' : 'Fuel Tank'}
                    {isLow && <span className="text-rose-400 font-bold text-[10px]">• LOW LEVEL</span>}
                  </span>
                  <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>
                    {v.fuel_or_battery_level}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? 'bg-rose-500' : isElectric ? 'bg-emerald-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, v.fuel_or_battery_level))}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Odometer</span>
                  <span className="font-mono text-slate-300 font-medium">{Math.round(v.odometer_km).toLocaleString('en-IN')} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Capacity</span>
                  <span className="text-slate-300 font-medium">{v.capacity} pax</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Current Speed</span>
                  <span className="text-slate-300 font-medium">{v.current_speed_kmh || 0} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

