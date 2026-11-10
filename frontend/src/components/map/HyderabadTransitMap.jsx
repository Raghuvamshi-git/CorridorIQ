import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function HyderabadTransitMap({ positions = [], stops = [], selectedRoute = null, height = '450px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Default Hyderabad Center Coordinates
  const HYD_CENTER = [17.3850, 78.4867];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: HYD_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      // Dark style tile layer (CartoDB DarkMatter or OSM with CSS filter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep instance alive during normal state updates
    };
  }, []);

  // Update Markers when positions or selectedRoute change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // Custom Icon Generator
    const createBusIcon = (isElectric, isDelayed) => {
      const color = isElectric ? '#10b981' : isDelayed ? '#f43f5e' : '#4f46e5';
      return L.divIcon({
        className: 'custom-bus-marker',
        html: `
          <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}; color: white; font-size: 11px; font-weight: bold;">
            🚌
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
    };

    const stopIcon = L.divIcon({
      className: 'custom-stop-marker',
      html: `
        <div style="background-color: #334155; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #94a3b8;"></div>
      `,
      iconSize: [10, 10],
      iconAnchor: [5, 5]
    });

    // Render Stops
    if (stops && stops.length > 0) {
      stops.forEach(s => {
        if (s.stop_lat && s.stop_lon) {
          L.marker([s.stop_lat, s.stop_lon], { icon: stopIcon })
            .bindTooltip(`<b>${s.stop_name}</b><br><span style="font-size:10px; color:#94a3b8">Sequence #${s.stop_sequence || ''}</span>`, { direction: 'top' })
            .addTo(markersLayerRef.current);
        }
      });
    }

    // Render Vehicles
    const filteredPositions = selectedRoute
      ? positions.filter(p => p.route_id === selectedRoute || p.route_short_name === selectedRoute)
      : positions;

    filteredPositions.forEach(p => {
      if (p.latitude && p.longitude) {
        const isDelayed = p.speed_kmh < 15;
        const icon = createBusIcon(p.propulsion === 'ELECTRIC', isDelayed);
        const marker = L.marker([p.latitude, p.longitude], { icon })
          .bindPopup(`
            <div style="font-family: sans-serif; min-width: 170px; color: #0f172a;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${p.vehicle_label || p.vehicle_id}</h4>
              <p style="margin: 2px 0; font-size: 11px; color: #475569;">Route: <b>${p.route_short_name || p.route_id || 'Active'}</b></p>
              <p style="margin: 2px 0; font-size: 11px;">Speed: <b>${p.speed_kmh} km/h</b></p>
              <p style="margin: 2px 0; font-size: 11px;">Occupancy: <b>${p.passenger_count || 0} passengers (${Math.round((p.passenger_load_factor || 0.5) * 100)}%)</b></p>
              <p style="margin: 2px 0; font-size: 10px; color: #64748b;">Status: ${p.occupancy_status || 'IN_SERVICE'}</p>
              <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8;">
                * Simulated GPS Telemetry
              </div>
            </div>
          `);
        marker.addTo(markersLayerRef.current);
      }
    });

  }, [positions, stops, selectedRoute]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Legend Badge Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm" /> In-Transit Bus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm" /> Electric Bus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Transit Stop
        </span>
      </div>

      <div className="absolute top-3 right-3 z-[1000] bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
        Lat: 17.3850 | Lon: 78.4867 (Hyderabad)
      </div>
    </div>
  );
}

