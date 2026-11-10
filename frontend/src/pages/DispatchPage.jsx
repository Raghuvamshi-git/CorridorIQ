import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function DispatchPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await api.getRecommendations(filterStatus || undefined);
      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load dispatch recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [filterStatus]);

  const handleStatusUpdate = async (recId, newStatus) => {
    try {
      setActionLoadingId(recId);
      const updated = await api.updateRecommendationStatus(recId, newStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendation_id === recId ? updated : r))
      );
    } catch (err) {
      alert(`Action failed: ${err.message || 'Error updating status'}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = recommendations.filter(r => r.status === 'PENDING_REVIEW').length;
  const approvedCount = recommendations.filter(r => r.status === 'APPROVED').length;
  const resolvedCount = recommendations.filter(r => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          Hyderabad Operational Dispatch Recommendations & Intervention Queue
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-backed dispatch proposals formulated by the AI controller. Human supervisor approval updates the central transit database.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a] border border-slate-800 rounded-xl p-3">
        <div className="flex items-center gap-2">
          {['', 'PENDING_REVIEW', 'APPROVED', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {st === '' ? 'All Actions' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400">
          <b>{pendingCount}</b> pending human controller review
        </span>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading dispatch queue...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 bg-[#0f172a] border border-slate-800 rounded-xl text-center text-slate-400 text-xs">
            No dispatch events currently match the selected status filter.
          </div>
        ) : (
          recommendations.map((rec) => {
            const isCritical = rec.severity === 'CRITICAL';
            const isHigh = rec.severity === 'HIGH';
            const isPending = rec.status === 'PENDING_REVIEW';
            const isApproved = rec.status === 'APPROVED';
            const isResolved = rec.status === 'RESOLVED';
            const isRejected = rec.status === 'REJECTED';

            return (
              <div
                key={rec.id}
                className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                      {rec.recommendation_id}
                    </span>
                    <span className="text-sm font-bold text-white">Route {rec.route_short_name}</span>
                    {rec.vehicle_id && (
                      <span className="text-xs font-mono text-slate-400">• Vehicle: {rec.vehicle_id}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isCritical ? 'danger' : isHigh ? 'warning' : 'info'} size="xs">
                      {rec.severity} PRIORITY
                    </Badge>
                    <Badge
                      variant={
                        isApproved ? 'success'
                        : isResolved ? 'info'
                        : isRejected ? 'default'
                        : 'warning'
                      }
                      size="xs"
                    >
                      {rec.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Evidence Section */}
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Observed Telemetry Evidence
                  </h4>
                  <p className="text-xs text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-sans leading-relaxed">
                    {rec.evidence}
                  </p>
                </div>

                {/* Proposed Intervention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1">
                      Recommended Dispatch Action
                    </span>
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {rec.recommended_action}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Expected Operational Benefit
                    </span>
                    <p className="text-slate-300 font-medium leading-relaxed">
                      {rec.expected_benefit}
                    </p>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">
                    Model Confidence: <b>{Math.round((rec.confidence_score || 0.88) * 100)}%</b> • Generated: {new Date(rec.created_at).toLocaleTimeString('en-GB', { hour12: false })} IST
                  </span>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(rec.recommendation_id, 'APPROVED')}
                          disabled={actionLoadingId === rec.recommendation_id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Authorize Action</span>
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(rec.recommendation_id, 'REJECTED')}
                          disabled={actionLoadingId === rec.recommendation_id}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleStatusUpdate(rec.recommendation_id, 'RESOLVED')}
                        disabled={actionLoadingId === rec.recommendation_id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {(isResolved || isRejected) && (
                      <button
                        onClick={() => handleStatusUpdate(rec.recommendation_id, 'PENDING_REVIEW')}
                        disabled={actionLoadingId === rec.recommendation_id}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

