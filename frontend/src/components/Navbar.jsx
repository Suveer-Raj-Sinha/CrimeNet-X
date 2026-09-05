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
  HelpCircle,
  LogOut,
  User,
  Shield,
  ScanText
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  caseMetrics,
  onLoadDemo,
  onOpenHelp,
  currentUser,
  onLogout,
  onOpenLogin
}) {
  const navItems = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'ocr', label: 'OCR & Extract', icon: ScanText },
    { id: 'ingestion', label: 'Data Ingestion', icon: UploadCloud },
    { id: 'query', label: 'AI Search', icon: Search },
    { id: 'resolution', label: 'Entity Resolution', icon: UserCheck },
    { id: 'timeline', label: 'Timeline & Map', icon: Clock },
    { id: 'export', label: 'Export', icon: FileCode },
    { id: 'manual', label: 'User Manual', icon: BookOpen },
  ];

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      case 'investigator':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case 'analyst':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    }
  };

  return (
    <header className="relative w-full z-30 bg-[#080c16] border-b border-[#1e293b] shadow-md">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 overflow-hidden">
        
        {/* Left: Brand Identity (Click to go Home) */}
        <button 
          onClick={() => setActiveTab('graph')}
          className="flex items-center space-x-2.5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-left focus:outline-none pr-2 border-r border-slate-800/80"
          title="Return to Home (Knowledge Graph)"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shadow-sm shrink-0">
            <Network className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-black tracking-wide text-white whitespace-nowrap">
              CRIMENET<span className="text-cyan-400">-X</span>
            </h1>
            <span className="hidden 2xl:inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
        </button>

        {/* Center: Scrollable Navigation Bar (min-w-0 prevents flex overflow overlap!) */}
        <nav className="flex-1 min-w-0 flex items-center space-x-1 overflow-x-auto no-scrollbar py-1 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 text-cyan-300 border border-cyan-400/90 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40'
                    : 'bg-slate-900/80 text-slate-200 hover:text-white hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse shrink-0" />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-cyan-300/70'}`} />
                <span className={isActive ? 'text-cyan-300 font-extrabold tracking-wide text-xs' : 'text-slate-100 font-semibold text-xs'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: User Profile & Action Controls (Fixed Solid Container) */}
        <div className="flex items-center space-x-2 shrink-0 bg-[#080c16] pl-2 border-l border-slate-800/80 z-10">
          <button
            onClick={onOpenHelp}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm"
            title="Open Quick Start Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xl:inline whitespace-nowrap">Guide</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="hidden xl:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs items-center space-x-1.5 transition-colors shadow-md border border-cyan-400/50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-white font-bold">Load Demo</span>
          </button>

          {/* User Session Profile / Login Control */}
          {currentUser ? (
            <div className="flex items-center space-x-1.5 pl-1.5">
              <div className="flex items-center space-x-1.5 px-2 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="w-5.5 h-5.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                  {currentUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-[11px] font-bold text-white leading-none">
                    {currentUser.username}
                  </span>
                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded border uppercase font-bold mt-0.5 ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role || 'USER'}
                  </span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/60 text-red-300 hover:text-red-100 font-bold text-xs flex items-center space-x-1 transition-all shadow-[0_0_12px_rgba(239,68,68,0.25)] cursor-pointer shrink-0"
                title="Log Out Session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap font-bold">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-400/60 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
