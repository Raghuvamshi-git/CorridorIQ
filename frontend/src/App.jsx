import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import DashboardPage from './pages/DashboardPage';
import LiveOperationsPage from './pages/LiveOperationsPage';
import RoutesPage from './pages/RoutesPage';
import FleetPage from './pages/FleetPage';
import DemandPage from './pages/DemandPage';
import AgentStudioPage from './pages/AgentStudioPage';
import DispatchPage from './pages/DispatchPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGlobalRefresh = async () => {
    try {
      setIsRefreshing(true);
      await api.seedDatabase();
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const tabTitles = {
    overview: 'Overview',
    'live-operations': 'Live Operations & GPS Telemetry',
    routes: 'Route & Corridor Intelligence',
    fleet: 'Fleet Analytics & Diagnostics',
    demand: 'Passenger Demand & Overcrowding',
    agent: 'AI Operations Agent Studio',
    dispatch: 'Dispatch Recommendations & Intervention',
    settings: 'System & Regional Settings'
  };

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTabTitle={tabTitles[activeTab] || 'Operations'}
          onRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-6" key={refreshKey}>
          {activeTab === 'overview' && <DashboardPage setActiveTab={setActiveTab} />}
          {activeTab === 'live-operations' && <LiveOperationsPage />}
          {activeTab === 'routes' && <RoutesPage />}
          {activeTab === 'fleet' && <FleetPage />}
          {activeTab === 'demand' && <DemandPage />}
          {activeTab === 'agent' && <AgentStudioPage />}
          {activeTab === 'dispatch' && <DispatchPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
