import React from 'react';
import { UserCheck, Check, X, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function EntityResolver({ candidates, onActionCandidate }) {
  const handleAction = async (candidateId, entityAId, entityBId, action) => {
    try {
      const formData = new FormData();
      formData.append('candidate_id', candidateId);
      formData.append('entity_a_id', entityAId);
      formData.append('entity_b_id', entityBId);
      formData.append('action', action);

      const res = await fetch('http://localhost:8000/api/v1/graph/resolution/action', {
        method: 'POST',
        headers: { 'Investigator': 'OFFICER-771' },
        body: formData
      });
      const data = await res.json();
      if (onActionCandidate) onActionCandidate(data);
    } catch (err) {
      console.error('Resolution action error:', err);
    }
  };

  const list = candidates || [
    {
      candidate_id: "CAND-01",
      entity_a_id: "ENT-PER-01",
      entity_a_name: "Rahul Sharma",
      entity_b_id: "ENT-PER-02",
      entity_b_name: "R. Sharma",
      classification: "STRONG MATCH",
      entity_resolution_confidence: 0.88,
      matched_features: [
        "Name / Alias Pattern Similarity (85%)",
        "Direct Shared Phone Match (+91-9876543210)",
        "Document Co-occurrence (3 files)"
      ],
      status: "PENDING_REVIEW"
    }
  ];

  return (
    <div className="w-full px-6 py-5 space-y-4 max-w-[1800px] mx-auto">
      <div className="glass-panel p-6 space-y-4">
        <div className="panel-header">
          <span className="panel-header-title">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Entity Resolution
          </span>
          <span className="badge badge-cyan">Human-in-Loop</span>
        </div>

        <p className="text-body text-slate-400 leading-relaxed">
          Multi-feature similarity matching across Name Patterns, Shared Phones, Device IMEIs, and Document Co-occurrence. Ambiguous links require explicit investigator authorization before merging.
        </p>


        {/* Candidate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {list.map((cand) => {
            const isStrong = cand.classification === 'STRONG MATCH';
            const isApproved = cand.status === 'APPROVED';
            const isRejected = cand.status === 'REJECTED';

            return (
              <div
                key={cand.candidate_id}
                className={`p-5 rounded-2xl border ${
                  isStrong ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-slate-900/80 border-slate-800'
                } space-y-4 shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                      isStrong ? 'bg-cyan-500 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {cand.classification} ({intScore(cand.entity_resolution_confidence)}%)
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {cand.candidate_id}
                  </span>
                </div>

                {/* Person A vs Person B comparison */}
                <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="border-r border-slate-800 pr-2">
                    <span className="text-[10px] text-slate-400 block">Entity A:</span>
                    <span className="text-xs font-bold text-cyan-300">{cand.entity_a_name}</span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[10px] text-slate-400 block">Entity B:</span>
                    <span className="text-xs font-bold text-cyan-300">{cand.entity_b_name}</span>
                  </div>
                </div>

                {/* Matched Feature List */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="text-[11px] font-medium text-slate-400 block">
                    Multi-Attribute Match Rationale:
                  </span>
                  {cand.matched_features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] bg-slate-900/90 p-1.5 rounded">
                      <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Status: <strong className="text-slate-200">{cand.status}</strong>
                  </span>

                  {!isApproved && !isRejected ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(cand.candidate_id, cand.entity_a_id, cand.entity_b_id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs flex items-center gap-1 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleAction(cand.candidate_id, cand.entity_a_id, cand.entity_b_id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs flex items-center gap-1 font-bold transition-all shadow-lg"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Alias Merge</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400">
                      ✓ Resolution Executed & Audited
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function intScore(conf) {
  if (!conf) return 85;
  return conf > 1 ? intScore(conf / 100) : Math.round(conf * 100);
}
