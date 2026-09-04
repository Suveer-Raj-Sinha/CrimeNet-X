import React, { useState } from 'react';
import { 
  BookOpen, 
  Network, 
  UploadCloud, 
  Search, 
  UserCheck, 
  Clock, 
  FileCode, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database
} from 'lucide-react';

export default function UserManualTab({ setActiveTab, onLoadDemo }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'System Overview & Purpose', icon: Sparkles },
    { id: 'graph', title: '1. Knowledge Graph Navigation', icon: Network },
    { id: 'ingestion', title: '2. 23-Source Ingestion Scanner', icon: UploadCloud },
    { id: 'query', title: '3. AI Search Query Engine', icon: Search },
    { id: 'resolution', title: '4. Entity Resolution Matrix', icon: UserCheck },
    { id: 'timeline', title: '5. Unified Timeline & Map', icon: Clock },
    { id: 'export', title: '6. JSON / XML Data Exporter', icon: FileCode },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Tab Banner Header */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-cyan-500/30">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              CRIMENET-X System Manual & Operations Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete step-by-step guide explaining every feature and how to analyze crime evidence in this application.
            </p>
          </div>
        </div>

        <button
          onClick={onLoadDemo}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Load Sample Case Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-1 glass-panel p-4 space-y-2">
          <span className="text-xs font-bold text-slate-400 block px-3 py-1">
            Manual Topics:
          </span>

          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Detailed Content Section */}
        <div className="lg:col-span-3 glass-panel p-6 space-y-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">System Overview & Purpose</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-cyan-300">CRIMENET-X</strong> is an enterprise evidence intelligence platform designed for law enforcement officers. In modern investigations, evidence is scattered across FIR documents, call logs (CDRs), bank transfers, CCTV camera logs, GPS coordinates, witness statements, and vehicle records.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    What This App Does
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Automatically extracts People, Phones, Vehicles, Locations, and Accounts from raw files, links their relationships into a visual network map, and flags unusual patterns (e.g. call bursts, money layering).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Evidence-First Principle
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    AI suggestions are strictly advisory and 100% traceable to source document line numbers and CSV rows. The system never declares guilt or takes automated actions.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    if (onLoadDemo) onLoadDemo();
                    setActiveTab('graph');
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <span>Go to Knowledge Graph</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Knowledge Graph Section */}
          {activeSection === 'graph' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Network className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">1. Knowledge Graph Navigation</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <h4 className="font-bold text-cyan-300">Color-Coded Visual Circles (Nodes):</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <span className="p-2 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300">🔵 PERSON: Suspects & witnesses</span>
                  <span className="p-2 rounded bg-slate-900 border border-emerald-500/40 text-emerald-300">🟢 PHONE: Mobile (+91)</span>
                  <span className="p-2 rounded bg-slate-900 border border-amber-500/40 text-amber-300">🟡 VEHICLE: License plates</span>
                  <span className="p-2 rounded bg-slate-900 border border-purple-500/40 text-purple-300">🟣 LOCATION: Stations & tolls</span>
                  <span className="p-2 rounded bg-slate-900 border border-rose-500/40 text-rose-300">🔴 ACCOUNT: Bank & UPI IDs</span>
                  <span className="p-2 rounded bg-slate-900 border border-indigo-500/40 text-indigo-300">🟦 IMEI: Device serials</span>
                </div>

                <h4 className="font-bold text-cyan-300 pt-2">Key Actions You Can Perform:</h4>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Click Any Circle:</strong> Highlights connected relationship lines and opens the Evidence Rationale ("WHY?") drawer on the right side.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Filter Categories:</strong> Use the left dropdown to view only Persons, Phones, or Vehicles.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-slate-900 p-2.5 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">HUB & MIDDLE Badges:</strong> Identifies masterminds (Hubs) and intermediary connectors (Middlemen).</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Ingestion Section */}
          {activeSection === 'ingestion' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">2. 23-Source Data Ingestion & Scanner</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The Ingestion Engine accepts heterogeneous data feeds across 23 intelligence categories (FIRs, CDRs, Financial, ANPR, GPS, Witness statements, etc.).
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-cyan-300">How to Ingest New Data (3 Steps):</h4>
                <ol className="space-y-2 text-slate-300 list-decimal list-inside">
                  <li>Select 1 of 23 source categories from the dropdown menu (e.g. *FIR*, *CDR*, *CCTV*).</li>
                  <li>Paste raw document text, call log CSVs, or click a <strong>Quick Sample Feed</strong> button.</li>
                  <li>Click <span className="text-cyan-300 font-bold">"Scan Payload & Extract Entities"</span>. Watch the live 8-stage progress tracker!</li>
                </ol>
              </div>
            </div>
          )}

          {/* AI Query Section */}
          {activeSection === 'query' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Search className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">3. AI Search Query Engine</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Ask plain English questions without needing SQL or complex database syntax.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-cyan-300">Example Questions You Can Ask:</h4>
                <ul className="space-y-1.5 text-slate-400">
                  <li className="p-2 rounded bg-slate-950 text-cyan-300 font-mono">"Who connects Rahul and Amit?"</li>
                  <li className="p-2 rounded bg-slate-950 text-cyan-300 font-mono">"Entities near Jaipur Station within 1 km"</li>
                  <li className="p-2 rounded bg-slate-950 text-cyan-300 font-mono">"High value transactions above ₹50,000"</li>
                </ul>
              </div>
            </div>
          )}

          {/* Resolution Section */}
          {activeSection === 'resolution' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <UserCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">4. Entity Resolution Matrix</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The system evaluates duplicate identity candidates (e.g., matching "Rahul Sharma" with "R. Sharma" based on shared phone numbers, device IMEIs, or addresses).
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-cyan-300">Classifications:</h4>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2 rounded bg-slate-950 flex items-center justify-between">
                    <span className="font-bold text-cyan-300">STRONG MATCH (≥ 85%)</span>
                    <span className="text-[10px] text-slate-400">High probability duplicate</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 flex items-center justify-between">
                    <span className="font-bold text-amber-300">POSSIBLE MATCH (50 - 84%)</span>
                    <span className="text-[10px] text-slate-400">Requires investigator Approve/Reject click</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Section */}
          {activeSection === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">5. Unified Timeline & Map</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Traces chronological event sequences across all modalities (Bank transfer ➔ ANPR camera sighting ➔ CDR call ➔ Station co-location).
              </p>
            </div>
          )}

          {/* Export Section */}
          {activeSection === 'export' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">6. JSON / XML Data Exporter</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                One-click copying and downloading of CCTNS/NCRB compliant structured case intelligence exports.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
