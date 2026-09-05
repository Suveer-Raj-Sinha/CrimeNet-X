import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  MousePointer, 
  FileText,
  User, 
  Phone, 
  Car, 
  MapPin, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';

export default function HelpModal({ isOpen, onClose, onLoadDemo }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', isolation: 'isolate' }}
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 animate-fade-in overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      {/* Standard Web Dialog Box Container */}
      <div 
        style={{ backgroundColor: '#0b1120', opacity: 1 }}
        className="max-w-2xl w-full rounded-2xl border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative my-auto overflow-hidden text-slate-100 flex flex-col transition-all duration-200 transform scale-100"
      >
        {/* Top Decorative Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"></div>

        {/* Dialog Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-start justify-between gap-4 relative">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 id="dialog-title" className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                CRIMENET-X Quick Start Guide
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase tracking-wider">
                  1-MIN TUTORIAL
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Follow 3 simple steps to analyze crime evidence and trace suspect linkages.
              </p>
            </div>
          </div>

          {/* Dialog Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Close Dialog (Esc)"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialog Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* 3 Simple Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono">
                  STEP 1
                </span>
                <UploadCloud className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Load Case Data</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Click <span className="text-cyan-300 font-bold">"Load Demo Case"</span> to populate FIRs, CDR call logs, and vehicle records.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono">
                  STEP 2
                </span>
                <MousePointer className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Click & Drag Circles</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Click any node on the graph (<span className="text-cyan-300">Person</span>, <span className="text-emerald-300">Phone</span>, <span className="text-amber-300 font-semibold">Vehicle</span>) to inspect details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500 text-slate-950 font-mono">
                  STEP 3
                </span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-extrabold text-white">Read "WHY?" Evidence</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Read the Evidence Card on the right to see verified proof lines, timestamps, and source documents.
              </p>
            </div>
          </div>

          {/* Key Icon Legend */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wide">
              Entity Legend & Color Codes:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-extrabold">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Person</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 font-extrabold">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-300 font-extrabold">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span>Vehicle Plate</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/90 border border-purple-500/40 text-purple-300 font-extrabold">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>Location</span>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-300 font-extrabold">
                <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                <span>Bank Account</span>
              </span>
            </div>
          </div>
        </div>

        {/* Standard Dialog Footer */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Standard Law Enforcement Operating Guide</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                if (onLoadDemo) onLoadDemo();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/25 border border-cyan-400/50 transition-all cursor-pointer"
            >
              <span>Load Sample Case & Explore</span>
              <ArrowRight className="w-4 h-4 text-cyan-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
