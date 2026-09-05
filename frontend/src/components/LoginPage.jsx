import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Users
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onGuestProceed }) {
  const [username, setUsername] = useState('investigator1');
  const [password, setPassword] = useState('invest123');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const demoAccounts = [
    {
      role: 'ADMIN',
      user: 'admin',
      pass: 'admin123',
      label: 'System Admin',
      borderColor: 'border-purple-500/40 hover:border-purple-400',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      badge: 'FULL ACCESS'
    },
    {
      role: 'INVESTIGATOR',
      user: 'investigator1',
      pass: 'invest123',
      label: 'Lead Investigator',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      badge: 'RECOMMENDED'
    },
    {
      role: 'ANALYST',
      user: 'analyst1',
      pass: 'analyst123',
      label: 'Data Analyst',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      badge: 'ANALYTICS'
    },
    {
      role: 'VIEWER',
      user: 'viewer1',
      pass: 'viewer123',
      label: 'Audit Viewer',
      borderColor: 'border-amber-500/40 hover:border-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      badge: 'READ ONLY'
    }
  ];

  const handleSelectDemo = (acc) => {
    setUsername(acc.user);
    setPassword(acc.pass);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        username: username.trim(),
        password: password.trim(),
        ...(showMfaInput && mfaCode ? { mfa_code: mfaCode.trim() } : {})
      };

      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check credentials.');
      }

      setSuccessMsg(`✓ Authenticated Successfully! Role: ${data.role.toUpperCase()}`);
      
      setTimeout(() => {
        onLoginSuccess({
          username: username.trim(),
          token: data.access_token,
          role: data.role
        });
      }, 900);

    } catch (err) {
      setError(err.message || 'Login request failed. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background Cyber Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.08),transparent_65%)] pointer-events-none" />

      {/* Main Box-Like Container (Structured like Quick Start Guide) */}
      <div className="max-w-3xl w-full bg-[#0b1120] rounded-2xl border border-slate-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col transition-all">
        
        {/* Top Decorative Accent Gradient Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Box Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center shrink-0 shadow-inner">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                CRIMENET<span className="text-cyan-400">-X</span> Security Portal
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono font-bold uppercase tracking-wider">
                  ENTERPRISE AUTH
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Select a preset role box or enter credentials to sign in.
              </p>
            </div>
          </div>
        </div>

        {/* Box Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* Alert Banners */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-start space-x-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* BOX CARD SECTION 1: 1-Click Quick Demo Account Cards Grid */}
          <div className="p-4.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>1-Click Preset Demo Role Cards</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                CLICK TO FILL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => {
                const isSelected = username === acc.user;
                return (
                  <div
                    key={acc.role}
                    onClick={() => handleSelectDemo(acc)}
                    className={`p-3.5 rounded-xl border bg-slate-950/90 transition-all cursor-pointer flex flex-col justify-between ${acc.borderColor} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'opacity-85 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white">{acc.label}</h3>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${acc.badgeBg}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Username: <strong className="text-cyan-300">{acc.user}</strong></span>
                      <span className="text-[10px] text-slate-500">Pass: {acc.pass}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BOX CARD SECTION 2: Credentials Form Input Box */}
          <div className="p-4.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                Enter Credentials
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-slate-950/90 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional MFA Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    Multi-Factor Authentication (MFA)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMfaInput(!showMfaInput)}
                    className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
                  >
                    {showMfaInput ? '- Hide MFA' : '+ Optional MFA Code (Demo: 123456)'}
                  </button>
                </div>

                {showMfaInput && (
                  <div className="relative animate-fadeIn">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="Enter 6-digit MFA Code (Demo: 123456)"
                      className="w-full bg-slate-950/90 border border-cyan-500/50 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2 text-xs text-cyan-300 placeholder-slate-500 font-mono outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 font-black text-xs text-white shadow-lg border border-cyan-400/50 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SIGN IN & AUTHENTICATE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* BOX CARD SECTION 3: Security & Architecture Info Box Legend */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-white uppercase tracking-wide block">
              🛡️ Security & Architecture Guarantee:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Argon2id Hashing</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>JWT Session Tokens</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Lockout & Rate Limit</span>
              </div>
            </div>
          </div>

        </div>

        {/* Box Footer (Structured like Quick Start Guide Footer) */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Authorized Law Enforcement Access Only</span>
          </div>

          <button
            type="button"
            onClick={onGuestProceed}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <span>Explore as Guest</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

      </div>
    </div>
  );
}
