const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error [${res.status}]: ${errorText || res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Request to ${endpoint} failed:`, err);
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardTrends: () => request('/dashboard/trends'),
  seedDatabase: () => request('/dashboard/seed', { method: 'POST' }),

  // Routes & Corridors
  getRoutes: () => request('/routes'),
  getRouteDetail: (routeId) => request(`/routes/${routeId}`),
  getRouteHeadways: (routeId) => request(`/routes/${routeId}/headways`),

  // Vehicles & Fleet
  getVehicles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.propulsion) query.append('propulsion', params.propulsion);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/vehicles${qs}`);
  },
  getVehiclePositions: (routeId = '') => {
    const qs = routeId ? `?route_id=${encodeURIComponent(routeId)}` : '';
    return request(`/vehicles/positions${qs}`);
  },

  // Analytics
  getDelayAnalytics: () => request('/analytics/delays'),
  getHeadwayAnomalies: (routeId = '') => {
    const qs = routeId ? `?route_id=${encodeURIComponent(routeId)}` : '';
    return request(`/analytics/headways${qs}`);
  },
  getPassengerDemand: (routeId = '') => {
    const qs = routeId ? `?route_id=${encodeURIComponent(routeId)}` : '';
    return request(`/analytics/passenger-demand${qs}`);
  },
  getRouteComparison: () => request('/analytics/route-comparison'),

  // AI Operations Agent
  chatWithAgent: (message, conversationHistory = []) => 
    request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: conversationHistory })
    }),

  // Dispatch Recommendations
  getRecommendations: (status = '') => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/dispatch/recommendations${qs}`);
  },
  updateRecommendationStatus: (recId, status) =>
    request(`/dispatch/recommendations/${recId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
};

