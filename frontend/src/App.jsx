import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GraphViewer from './components/GraphViewer';
import IngestionScanner from './components/IngestionScanner';
import QueryBar from './components/QueryBar';
import EntityResolver from './components/EntityResolver';
import TimelineGeoViewer from './components/TimelineGeoViewer';
import ExportDrawer from './components/ExportDrawer';
import UserManualTab from './components/UserManualTab';
import HelpModal from './components/HelpModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [caseData, setCaseData] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const fetchCaseData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/cases/CASE-2026-001', {
        headers: { 'Investigator': 'OFFICER-771' }
      });
      if (res.ok) {
        const data = await res.json();
        setCaseData(data); // This now only contains basic case info (title, status, etc)
      }
    } catch (err) {
      console.error('Error fetching case metadata:', err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
      }
    } catch (err) {
      console.error('Error fetching health status:', err);
    }
  };

  const handleLoadDemo = async () => {
    await fetchCaseData();
    setNotification('✓ Operation CyberPhantom case data pre-loaded!');
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchCaseData();
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-emerald-500 text-slate-950 px-4 py-2 text-xs font-bold text-center shadow-lg relative z-50">
          {notification}
        </div>
      )}

      {/* Main Background Wrapper - Blurs & Dims Entire Website Data When Modal Appears */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isHelpOpen ? 'blur-md brightness-40 pointer-events-none select-none' : ''}`}>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          caseMetrics={caseData}
          healthStatus={healthStatus}
          onLoadDemo={handleLoadDemo}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {/* Main Work Area */}
        <main className="flex-1">
          {activeTab === 'graph' && (
            <GraphViewer
              onSelectEntity={(ent) => console.log('Selected entity:', ent)}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
          )}

          {activeTab === 'ingestion' && (
            <IngestionScanner
              sourceTypes={caseData?.supported_source_types}
              onIngestSuccess={fetchCaseData}
            />
          )}

          {activeTab === 'query' && (
            <QueryBar onExecuteQuery={(res) => console.log('Query result:', res)} />
          )}

          {activeTab === 'resolution' && (
            <EntityResolver
              candidates={caseData?.resolution_candidates}
              onActionCandidate={fetchCaseData}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineGeoViewer />
          )}

          {activeTab === 'export' && <ExportDrawer />}

          {activeTab === 'manual' && (
            <UserManualTab
              setActiveTab={setActiveTab}
              onLoadDemo={handleLoadDemo}
            />
          )}
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90 py-3 px-6 text-center text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CRIMENET-X Evidence Intelligence Platform v1.0.0</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Evidence-First Intelligence Architecture • Human-in-the-Loop Verification & Provenance Tracking
          </span>
        </footer>
      </div>

      {/* Help Modal Guide - Placed at end of DOM tree so it ALWAYS renders ON TOP of all page elements */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onLoadDemo={handleLoadDemo}
      />
    </div>
  );
}
