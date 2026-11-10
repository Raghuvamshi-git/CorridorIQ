import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Bot,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Code
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch (err) {
        console.error('Failed to get health:', err);
      }
    }
    checkHealth();
  }, []);

  const handleSeedReset = async () => {
    try {
      setSeeding(true);
      setSeedSuccessMsg(null);
      const res = await api.seedDatabase();
      setSeedSuccessMsg(res.message || 'Synthetic transit data refreshed successfully.');
    } catch (err) {
      alert(`Seeding failed: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          CorridorIQ System & Hyderabad Regional Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review environment parameters, database dialect, AI agent configuration, and synthetic seeder controls.
        </p>
      </div>

      {/* Regional Configuration */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400" />
          Operating Region: Hyderabad, Telangana, India
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">City Center GPS</span>
            <span className="font-mono text-white font-medium">17.3850° N, 78.4867° E</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Timezone</span>
            <span className="text-white font-medium">Asia/Kolkata (IST, +5:30)</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Currency</span>
            <span className="text-white font-medium">INR (₹ Indian Rupee)</span>
          </div>
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Date Format</span>
            <span className="text-white font-medium">DD-MM-YYYY (24-Hour)</span>
          </div>
        </div>
      </div>

      {/* Database Dialect & Connection */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Database Persistence Engine
          </h3>
          <Badge variant={health?.database_status === 'connected' ? 'success' : 'danger'}>
            {health?.database_status === 'connected' ? 'ACTIVE & CONNECTED' : 'DISCONNECTED'}
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Active Database Dialect: <b className="text-indigo-400 font-mono uppercase">{health?.database_dialect || 'SQLITE'}</b>.
        </p>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
          <p className="text-slate-300">
            CorridorIQ is designed with first-class support for <b>MySQL 8.0</b> with InnoDB relational integrity, and seamlessly includes an automatic <b>SQLite development fallback</b> for immediate local execution with zero setup hassle.
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>MySQL URL (Optional): mysql+pymysql://root:password@localhost:3306/corridoriq_db</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Agent Configuration */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            Google Gemini GenAI Configuration
          </h3>
          <Badge variant={health?.gemini_configured ? 'success' : 'info'}>
            {health?.gemini_configured ? 'GEMINI API KEY ACTIVE' : 'LOCAL TOOL RUNNER ACTIVE'}
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The autonomous operations agent uses the official <b>Google Gen AI Python SDK</b> with native Gemini function calling. When an API key is provided in <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">backend/.env</code>, multi-turn GenAI reasoning is unlocked.
        </p>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-1">
          <p className="font-semibold text-slate-200">How to activate Gemini 2.5 Flash:</p>
          <ol className="list-decimal list-inside text-slate-400 text-[11px] space-y-1 mt-1 font-mono">
            <li>Open <span className="text-slate-300">backend/.env</span></li>
            <li>Set <span className="text-indigo-300">GEMINI_API_KEY=AIzaSy...</span></li>
            <li>Restart backend server. The agent automatically activates live Gemini function calling!</li>
          </ol>
        </div>
      </div>

      {/* Synthetic Data Reset Engine */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          Synthetic Hyderabad Transit Simulator
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Regenerate the entire synthetic database: 1 agency, 12 corridors, 63 geocoded stops, 48 buses, 216 scheduled trips, 1,368 stop-time events, and 1,944 telemetry records with injected bus bunching and delay bottlenecks.
        </p>

        {seedSuccessMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}

        <button
          onClick={handleSeedReset}
          disabled={seeding}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Regenerating Hyderabad Network...' : 'Regenerate Synthetic Data'}</span>
        </button>
      </div>
    </div>
  );
}

