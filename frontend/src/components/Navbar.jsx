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
  ScanText,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  caseMetrics,
  onLoadDemo,
  onOpenHelp,
  currentUser,
  onOpenUserDrawer
}) {
  const navRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const checkScroll = React.useCallback(() => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = navRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Scroll active tab into view whenever activeTab changes
  React.useEffect(() => {
    const el = document.getElementById(`nav-item-${activeTab}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const handleWheel = (e) => {
    if (navRef.current) {
      // If user uses mousewheel, smoothly scroll horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        navRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const scrollByAmount = (direction) => {
    if (navRef.current) {
      const amount = direction === 'left' ? -220 : 220;
      navRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    const el = document.getElementById(`nav-item-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

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
    <header className="relative w-full z-30 bg-[#080c16] border-b border-[#1e293b] shadow-md select-none">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <button 
          onClick={() => handleTabClick('graph')}
          className="flex items-center space-x-2.5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity text-left focus:outline-none pr-3 border-r border-slate-800"
          title="Return to Home (Knowledge Graph)"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shadow-sm shrink-0">
            <Network className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-center space-x-1.5">
            <h1 className="text-base font-black tracking-wide text-white whitespace-nowrap">
              CRIMENET<span className="text-cyan-400">-X</span>
            </h1>
            <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase tracking-wider">
              ENTERPRISE
            </span>
          </div>
        </button>

        {/* Center: Scrollable Navigation Features Track */}
        <div className="flex-1 min-w-0 flex items-center mx-1 sm:mx-2 gap-1.5">
          {/* Left Scroll Button (Flex sibling, never covers any item) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white flex items-center justify-center shrink-0 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Features Navigation List with Smooth Dynamic Edge Fade */}
          <nav 
            ref={navRef}
            onWheel={handleWheel}
            className="flex-1 min-w-0 flex items-center space-x-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1.5"
            style={{
              maskImage: canScrollRight && canScrollLeft
                ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 36px), transparent)'
                : canScrollRight
                ? 'linear-gradient(to right, black calc(100% - 40px), transparent)'
                : canScrollLeft
                ? 'linear-gradient(to right, transparent, black 28px)'
                : 'none',
              WebkitMaskImage: canScrollRight && canScrollLeft
                ? 'linear-gradient(to right, transparent, black 24px, black calc(100% - 36px), transparent)'
                : canScrollRight
                ? 'linear-gradient(to right, black calc(100% - 40px), transparent)'
                : canScrollLeft
                ? 'linear-gradient(to right, transparent, black 28px)'
                : 'none',
              scrollPaddingLeft: '16px',
              scrollPaddingRight: '28px',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
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
            {/* End Breathing Spacer */}
            <div className="shrink-0 w-3 h-1 pointer-events-none" />
          </nav>

          {/* Right Scroll Button (Flex sibling, never covers any item) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white flex items-center justify-center shrink-0 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Section: Guide, Load Demo & User Session */}
        <div className="flex items-center space-x-2 shrink-0 pl-3 border-l border-slate-800">
          <button
            onClick={onOpenHelp}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm cursor-pointer"
            title="Open Quick Start Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xl:inline whitespace-nowrap">Guide</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs items-center space-x-1.5 transition-colors shadow-md border border-cyan-400/50 whitespace-nowrap cursor-pointer"
            title="Load Demo Evidence"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-white font-bold">Load Demo</span>
          </button>

          {/* Officer Profile & Access Drawer Trigger */}
          <button
            onClick={onOpenUserDrawer}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer shadow-md group shrink-0"
            title="Open Officer Access & Profile Drawer"
          >
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold font-mono text-xs group-hover:bg-cyan-500/30 shrink-0">
              {currentUser?.username?.[0]?.toUpperCase() || <User className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 whitespace-nowrap">
              {currentUser?.username || 'Officer Access'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_6px_#34d399]" />
          </button>
        </div>

      </div>
    </header>
  );
}
