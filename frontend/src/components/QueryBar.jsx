import React, { useState } from 'react';
import { Search, ShieldCheck, Cpu, ArrowRight, Zap, Code } from 'lucide-react';

export default function QueryBar({ onExecuteQuery }) {
  const [queryText, setQueryText] = useState('Who connects Rahul and Amit?');
  const [isSearching, setIsSearching] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const sampleQueries = [
    'Who connects Rahul and Amit?',
    'Entities near Jaipur Station within 1 km',
    'High value transactions above ₹50,000',
    'Show call bursts for phone +919876543210'
  ];

  const handleSearch = async (queryToRun) => {
    const q = queryToRun || queryText;
    if (!q) return;
    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append('query', q);

      const res = await fetch('http://localhost:8000/api/v1/query/execute', {
        method: 'POST',
        headers: { 'Investigator': 'OFFICER-771' },
        body: formData
      });
      const data = await res.json();
      setQueryResult(data);
      if (onExecuteQuery) onExecuteQuery(data);
    } catch (err) {
      console.error('Query execution error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-5 max-w-[1800px] mx-auto">
      {/* Search Header Banner */}
      <div className="glass-panel p-6 space-y-4">
        <div className="panel-header">
          <span className="panel-header-title">
            <Search className="w-4 h-4 text-cyan-400" />
            AI Search
          </span>
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Ask plain English investigation query (e.g., 'Who connects Rahul and Amit?')..."
            className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-sans"
          />
          <button
            onClick={() => handleSearch(queryText)}
            disabled={isSearching}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSearching ? <Cpu className="w-4 h-4 animate-spin text-slate-950" /> : <Search className="w-4 h-4 text-slate-950" />}
            <span>{isSearching ? 'Executing Plan...' : 'Search'}</span>
          </button>
        </div>

        {/* Quick Sample Query Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs text-slate-400 font-medium py-1">Quick Prompts:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQueryText(sq);
                handleSearch(sq);
              }}
              className="text-xs px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Results & Execution Plan Breakdown */}
      {queryResult && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              Interpreted Safe Query Plan & Results
            </h4>
            <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950">
              Intent: {queryResult.query_plan?.parsed_intent}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
            {queryResult.summary}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Matched Entities */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Matched Entities:</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {(queryResult.matched_entities || []).map((e, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-cyan-300 block">{e.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{e.type}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono">
                      Conf: {e.extraction_confidence || 0.95}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Relationships */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Matched Evidence Links:</span>
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {(queryResult.matched_relationships || []).map((r, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-400">
                      <span>{r.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {r.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {r.pointer?.raw_snippet || `Link from ${r.source_entity_id} to ${r.target_entity_id}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
