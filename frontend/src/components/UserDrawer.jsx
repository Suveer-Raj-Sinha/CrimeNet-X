import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  ShieldCheck,
  Key,
  LogOut,
  Sparkles,
  Lock,
  CheckCircle2,
  Fingerprint,
  ChevronRight,
  Eye,
  EyeOff,
  Briefcase,
  AlertCircle
} from 'lucide-react';

export default function UserDrawer({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [usernameInput, setUsernameInput] = useState('investigator1');
  const [passwordInput, setPasswordInput] = useState('invest123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  const demoAccounts = [
    {
      role: 'ADMIN',
      user: 'admin',
      pass: 'admin123',
      label: 'System Admin',
      badge: 'Full Access',
      color: 'border-purple-500/40 text-purple-300 bg-purple-950/50'
    },
    {
      role: 'INVESTIGATOR',
      user: 'investigator1',
      pass: 'invest123',
      label: 'Lead Investigator',
      badge: 'Target Case Lead',
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50'
    },
    {
      role: 'ANALYST',
      user: 'analyst1',
      pass: 'analyst123',
      label: 'Intelligence Analyst',
      badge: 'Data & Graph',
      color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50'
    }
  ];

  const handleQuickSwitch = (account) => {
    onLoginSuccess({
      username: account.user,
      token: `demo-token-${account.user}`,
      role: account.role.toLowerCase()
    });
    setAuthError(null);
  };

  const handleFormLogin = (e) => {
    e.preventDefault();
    setAuthError(null);

    const match = demoAccounts.find(
      (a) => a.user.toLowerCase() === usernameInput.trim().toLowerCase()
    );

    if (match && passwordInput.trim() === match.pass) {
      onLoginSuccess({
        username: match.user,
        token: `auth-token-${match.user}-${Date.now()}`,
        role: match.role.toLowerCase()
      });
      setIsLoginMode(false);
    } else if (usernameInput.trim().length > 0 && passwordInput.trim().length > 0) {
      // Allow flexible custom login
      onLoginSuccess({
        username: usernameInput.trim(),
        token: `custom-token-${Date.now()}`,
        role: 'investigator'
      });
      setIsLoginMode(false);
    } else {
      setAuthError('Please provide a valid username and password.');
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-950 text-purple-300 border-purple-500/60';
      case 'investigator':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/60';
      case 'analyst':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/60';
      default:
        return 'bg-amber-950 text-amber-300 border-amber-500/60';
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 overflow-hidden select-none animate-fadeIn"
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 99999 }}
    >
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(2, 6, 23, 0.8)' }}
        onClick={onClose}
      />

      {/* Slide-in Drawer Container */}
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex"
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 100000 }}
      >
        <div 
          className="w-screen max-w-md bg-[#080c16] border-l border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
          style={{ width: '100vw', maxWidth: '420px', height: '100vh' }}
        >
          
          {/* Drawer Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1d]/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Officer Access & Identity</h3>
                <span className="text-[10px] text-slate-400 font-mono">CCTNS Secure Session Gateway</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* Profile Section (when Logged In & not in switch mode) */}
            {currentUser && !isLoginMode ? (
              <div className="space-y-6">
                {/* User Card */}
                <div className="glass-panel p-5 border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-[#080c16] space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center text-cyan-300 font-black font-mono text-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        {currentUser.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080c16] shadow-[0_0_8px_#34d399]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-base font-bold text-white truncate">
                          {currentUser.username}
                        </h4>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${getRoleBadgeStyle(currentUser.role)}`}>
                          {currentUser.role || 'OFFICER'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-cyan-400" />
                        Special Investigation Wing
                      </p>
                      <span className="inline-block mt-1 text-[10px] text-emerald-400 font-mono">
                        ● Active CCTNS Clearance
                      </span>
                    </div>
                  </div>

                  {/* Security Clearance Credentials */}
                  <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-mono">Clearance Tier</span>
                      <span className="font-bold text-slate-200">Level 4 (Top Secret)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block font-mono">Target Case</span>
                      <span className="font-bold text-cyan-300 font-mono">CASE-2026-001</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Fast Role Switcher */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                    Quick Role Switcher
                  </span>
                  <div className="space-y-2">
                    {demoAccounts.map((acc) => {
                      const isCurrent = currentUser.username.toLowerCase() === acc.user.toLowerCase();
                      return (
                        <button
                          key={acc.user}
                          onClick={() => handleQuickSwitch(acc)}
                          className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold font-mono text-cyan-400">
                              {acc.user[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">
                                {acc.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                user: {acc.user}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${acc.color}`}>
                            {acc.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions: Switch Credentials or Logout */}
                <div className="pt-4 space-y-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sign In With Another Account</span>
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setIsLoginMode(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Log Out Session</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Login Form Section */
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white">Officer Authentication</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sign in with your investigative credentials or select a pre-authorized demo account.
                  </p>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleFormLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Username / Badge ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="e.g. investigator1"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                        required
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                  >
                    <span>Authenticate Officer</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Preset Demo Accounts */}
                <div className="pt-4 border-t border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Instant Demo Authorization:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.user}
                        type="button"
                        onClick={() => {
                          setUsernameInput(acc.user);
                          setPasswordInput(acc.pass);
                          handleQuickSwitch(acc);
                          setIsLoginMode(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-left transition-all cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{acc.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {acc.user} / {acc.pass}
                          </span>
                        </div>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${acc.color}`}>
                          {acc.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {currentUser && (
                  <button
                    type="button"
                    onClick={() => setIsLoginMode(false)}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800"
                  >
                    Cancel & Return to Profile
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#070b14] text-center">
            <span className="text-[10px] text-slate-500 font-mono block">
              CrimeNet-X Secure Enclave • ISO/IEC 27001 Certified
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
