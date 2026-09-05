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
import LoginPage from './components/LoginPage';
import DocumentOcrScanner from './components/DocumentOcrScanner';
import UserDrawer from './components/UserDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [caseData, setCaseData] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [showLoginView, setShowLoginView] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);

  // User authentication state stored in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('crimenetx_user');
      return saved ? JSON.parse(saved) : { username: 'investigator1', token: null, role: 'investigator' };
    } catch {
      return { username: 'investigator1', token: null, role: 'investigator' };
    }
  });

  const fetchCaseData = async () => {
    try {
      const headers = { 'Investigator': currentUser?.username || 'OFFICER-771' };
      if (currentUser?.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }
      const res = await fetch('http://localhost:8000/api/v1/cases/CASE-2026-001', { headers });
      if (res.ok) {
        const data = await res.json();
        setCaseData(data);
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

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('crimenetx_user', JSON.stringify(userData));
    } catch (e) {
      console.error('Error saving session:', e);
    }
    setShowLoginView(false);
    setNotification(`✓ Logged in successfully as ${userData.username} (${userData.role.toUpperCase()})`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('crimenetx_user');
    } catch (e) {
      console.error('Error removing session:', e);
    }
    setNotification('Session ended. Logged out safely.');
    setIsUserDrawerOpen(true);
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchCaseData();
    fetchHealth();
  }, [currentUser]);

  // Render Login Page if explicit Login view is requested
  if (showLoginView) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          handleLoginSuccess(user);
          setShowLoginView(false);
        }}
        onGuestProceed={() => setShowLoginView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 relative">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 px-4 py-2 text-xs font-black text-center shadow-lg relative z-50 animate-fadeIn">
          {notification}
        </div>
      )}

      {/* Main Background Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isHelpOpen ? 'blur-md brightness-40 pointer-events-none select-none' : ''}`}>
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          caseMetrics={caseData}
          healthStatus={healthStatus}
          onLoadDemo={handleLoadDemo}
          onOpenHelp={() => setIsHelpOpen(true)}
          currentUser={currentUser}
          onOpenUserDrawer={() => setIsUserDrawerOpen(true)}
        />

        {/* Main Work Area */}
        <main className="flex-1">
          {activeTab === 'graph' && (
            <GraphViewer
              caseData={caseData}
              onSelectEntity={(ent) => console.log('Selected entity:', ent)}
              onOpenHelp={() => setIsHelpOpen(true)}
            />
          )}

          {activeTab === 'ocr' && (
            <DocumentOcrScanner
              onScanComplete={(scanResult) => {
                fetchCaseData();
                setNotification(`✓ Scanned intelligence from ${scanResult?.filename || 'document'} successfully ingested into Knowledge Graph, Timeline & Search!`);
                setTimeout(() => setNotification(null), 5000);
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
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

      {/* Help Modal Guide */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onLoadDemo={handleLoadDemo}
      />

      {/* Peekable Edge Tab for User / Officer Access */}
      <button
        onClick={() => setIsUserDrawerOpen(true)}
        style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900/95 hover:bg-slate-800 border-l border-t border-b border-cyan-500/50 hover:border-cyan-400 rounded-l-xl py-3 px-1.5 flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer group transition-all hover:pl-2.5"
        title="Peek Officer Profile & Credentials"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
        <div className="w-5 h-5 rounded-md bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold font-mono text-[10px]">
          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <span 
          style={{ writingMode: 'vertical-rl' }}
          className="text-[9px] font-mono font-bold tracking-widest text-slate-400 group-hover:text-cyan-300 uppercase py-1"
        >
          OFFICER
        </span>
      </button>

      {/* User Identity & Access Drawer */}
      <UserDrawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </div>
  );
}
