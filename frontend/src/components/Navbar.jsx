import React from 'react';
import { 
  Network, 
  UploadCloud, 
  Search, 
  UserCheck, 
  Clock, 
  FileCode, 
  BookOpen,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, caseMetrics, onLoadDemo, onOpenHelp }) {
  const navItems = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'ingestion', label: 'Data Ingestion', icon: UploadCloud },
    { id: 'query', label: 'AI Search', icon: Search },
    { id: 'resolution', label: 'Entity Resolution', icon: UserCheck },
    { id: 'timeline', label: 'Timeline & Map', icon: Clock },
    { id: 'export', label: 'Export', icon: FileCode },
    { id: 'manual', label: 'User Manual', icon: BookOpen },
  ];

  return (
    <header className="relative w-full z-30 bg-[#080c16] border-b border-[#1e293b] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity (Click to go Home) */}
        <button 
          onClick={() => setActiveTab('graph')}
          className="flex items-center space-x-3 shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-left focus:outline-none"
          title="Return to Home (Knowledge Graph)"
        >
          <div className="w-8.5 h-8.5 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shadow-sm">
            <Network className="w-4.5 h-4.5 text-cyan-400" />
          </div>

          <div className="flex items-center space-x-2">
            <h1 className="text-base font-black tracking-wide text-white whitespace-nowrap">
              CRIMENET<span className="text-cyan-400">-X</span>
            </h1>
            <span className="hidden xl:inline-block text-[9px] px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
        </button>

        {/* Center: Scrollable Responsive Navigation Items (Never Clips) */}
        <nav className="flex-1 flex items-center justify-start md:justify-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 text-cyan-300 border border-cyan-400/90 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse shrink-0"></span>
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-cyan-300/70'}`} />
                <span className={isActive ? 'text-cyan-300 font-black tracking-wide text-xs' : 'text-slate-100 font-bold text-xs'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenHelp}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Open Quick Start Guide"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Guide</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center space-x-1.5 transition-colors shadow-md border border-cyan-400/50 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="text-white font-black">Load Demo Case</span>
          </button>
        </div>
      </div>
    </header>
  );
}
