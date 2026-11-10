import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Locate, Maximize2, Compass, Layers } from 'lucide-react';

export default function HyderabadTransitMap({
  positions = [],
  stops = [],
  selectedRoute = '',
  height = '520px'
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const stopsLayerRef = useRef(null);
  const [vehicleCount, setVehicleCount] = useState(0);

  // Default Hyderabad Metropolitan Center Coordinates
  const HYD_CENTER = [17.3850, 78.4867];
  const DEFAULT_ZOOM = 12;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet Map Instance
      const map = L.map(mapContainerRef.current, {
        center: HYD_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true
      });

      // OpenStreetMap standard tile provider without API key requirement
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        minZoom: 10
      }).addTo(map);

      // Dedicated layer groups for clean updates
      stopsLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle map resizing when sidebar collapses or container dimensions change
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Center on Hyderabad Default Coordinates
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(HYD_CENTER, DEFAULT_ZOOM, { animate: true });
    }
  };

  // Fit Bounds to All Available Markers
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || positions.length === 0) return;
    const validPositions = positions.filter(p => p.latitude && p.longitude);
    if (validPositions.length === 0) return;

    const latLngs = validPositions.map(p => [p.latitude, p.longitude]);
    const bounds = L.latLngBounds(latLngs);
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
    }
  };

  // Render Vehicles and Stops
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !stopsLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();
    stopsLayerRef.current.clearLayers();

    // 1. Render Transit Stops
    if (stops && stops.length > 0) {
      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="background-color: #1e293b; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #38bdf8; box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);"></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      stops.forEach(s => {
        if (s.stop_lat && s.stop_lon) {
          L.marker([s.stop_lat, s.stop_lon], { icon: stopIcon })
            .bindTooltip(`
              <div style="font-family: system-ui; font-size: 11px;">
                <b>${s.stop_name}</b>
                ${s.stop_sequence ? `<br><span style="color: #64748b;">Stop #${s.stop_sequence}</span>` : ''}
              </div>
            `, { direction: 'top', offset: [0, -6] })
            .addTo(stopsLayerRef.current);
        }
      });
    }

    // 2. Filter & Render Vehicles
    const filteredPositions = selectedRoute
      ? positions.filter(p => p.route_id === selectedRoute || p.route_short_name === selectedRoute)
      : positions;

    setVehicleCount(filteredPositions.length);

    // Coordinate jitter map to prevent overlapping markers from obscuring each other
    const coordSeen = new Map();

    filteredPositions.forEach((p, idx) => {
      if (!p.latitude || !p.longitude) return;

      let lat = p.latitude;
      let lon = p.longitude;

      // Handle close coordinates (e.g. bunched buses at Ameerpet Metro Hub)
      const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
      if (coordSeen.has(coordKey)) {
        const count = coordSeen.get(coordKey);
        coordSeen.set(coordKey, count + 1);
        // Small radial displacement (approx 50-80 meters) so both markers remain clickable
        const angle = (count * 90) * (Math.PI / 180);
        lat += 0.0007 * Math.cos(angle);
        lon += 0.0007 * Math.sin(angle);
      } else {
        coordSeen.set(coordKey, 1);
      }

      const isElectric = (p.propulsion_type || p.propulsion) === 'ELECTRIC';
      const isDelayed = (p.speed_kmh < 15 && p.speed_kmh > 0) || p.delay_mins > 8;
      const isIdle = p.speed_kmh === 0;

      // Color scheme based on status and propulsion
      const markerBg = isElectric ? '#10b981' : isDelayed ? '#f43f5e' : isIdle ? '#f59e0b' : '#4f46e5';
      const routeShortName = p.route_short_name || (p.route_id ? p.route_id.replace('R-', '') : 'BUS');

      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: ${markerBg}; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5); color: #ffffff; font-size: 13px; font-weight: 800;">
              ${isElectric ? '⚡' : '🚌'}
            </div>
            <div style="margin-top: -2px; background: #0f172a; color: #f8fafc; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 4px; border: 1px solid #334155; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.4);">
              ${routeShortName}
            </div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 21],
        popupAnchor: [0, -22]
      });

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 190px; color: #0f172a; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 13px; font-weight: 800; color: #1e293b;">${p.vehicle_label || p.vehicle_id}</span>
            <span style="font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; background: ${isElectric ? '#dcfce7; color: #166534;' : '#e0e7ff; color: #3730a3;'}">
              ${p.propulsion_type || (isElectric ? 'ELECTRIC' : 'DIESEL')}
            </span>
          </div>

          <div style="font-size: 11px; line-height: 1.5; color: #334155;">
            <div>Corridor: <b style="color: #0f172a;">Route ${p.route_short_name || p.route_id}</b></div>
            ${p.corridor_name ? `<div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">${p.corridor_name}</div>` : ''}
            <div>Live Speed: <b>${p.speed_kmh} km/h</b> ${isDelayed ? '<span style="color:#e11d48; font-weight:bold;">(Delay Alert)</span>' : ''}</div>
            <div>Occupancy: <b>${p.passenger_count || 0} pax</b> (${Math.round((p.passenger_load_factor || 0.5) * 100)}%)</div>
            <div>Status: <span style="font-weight:600; color:${p.status === 'IN_SERVICE' ? '#15803d' : '#b45309'};">${p.status || 'IN_SERVICE'}</span></div>
            ${p.fuel_or_battery_level !== undefined ? `<div>Energy / Battery: <b>${p.fuel_or_battery_level}%</b></div>` : ''}
          </div>

          <div style="margin-top: 8px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between;">
            <span>Simulated Telemetry</span>
            <span>Hyderabad IST</span>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lon], { icon: busIcon }).bindPopup(popupContent);
      marker.addTo(markersLayerRef.current);
    });

    // Auto-fit bounds if a specific corridor was selected
    if (selectedRoute && filteredPositions.length > 0) {
      const latLngs = filteredPositions.map(p => [p.latitude, p.longitude]);
      const bounds = L.latLngBounds(latLngs);
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [positions, stops, selectedRoute]);

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-[#0f172a] shadow-xl"
      style={{ height }}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" tabIndex={0} />

      {/* Floating Control Bar (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleResetView}
          title="Center on Hyderabad (Lat: 17.3850, Lon: 78.4867)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium shadow-md backdrop-blur-md transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>Center HYD</span>
        </button>

        <button
          onClick={handleFitBounds}
          title="Fit view to all active vehicle coordinates"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium shadow-md backdrop-blur-md transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fit All</span>
        </button>

        <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-md">
          {selectedRoute ? `Route: ${selectedRoute}` : '12 Corridors Active'}
        </div>
      </div>

      {/* Legend & Fleet Status (Bottom Left) */}
      <div className="absolute bottom-6 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center gap-4 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block ring-2 ring-indigo-500/30" />
          <span>In-Transit ({positions.filter(p => (p.propulsion_type || p.propulsion) !== 'ELECTRIC' && p.speed_kmh >= 15).length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-500/30" />
          <span>Electric Fleet ({positions.filter(p => (p.propulsion_type || p.propulsion) === 'ELECTRIC').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block ring-2 ring-rose-500/30" />
          <span>Congested / Slow ({positions.filter(p => p.speed_kmh > 0 && p.speed_kmh < 15).length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          <span>Transit Hubs</span>
        </div>
        <div className="border-l border-slate-800 pl-3 text-slate-400 font-mono text-[10px]">
          Active: <b className="text-white">{vehicleCount}</b> / 48
        </div>
      </div>
    </div>
  );
}
