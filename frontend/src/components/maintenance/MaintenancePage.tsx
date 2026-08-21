'use client';

import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  ShieldAlert,
  Phone,
  Mail,
  RefreshCw,
  KeyRound,
  Truck,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { useRouter } from 'next/navigation';

export const MaintenancePage: React.FC = () => {
  const { settings, timeRemaining, refreshMaintenance, applyBypassKey } = useMaintenance();
  const router = useRouter();

  const [isBypassModalOpen, setIsBypassModalOpen] = useState(false);
  const [bypassInput, setBypassInput] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMaintenance();
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 800);
  };

  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bypassInput.trim()) {
      setBypassError('Please enter a valid bypass secret key');
      return;
    }

    const applied = applyBypassKey(bypassInput.trim());
    if (applied) {
      setIsBypassModalOpen(false);
      window.location.reload();
    } else {
      setBypassError('Failed to apply bypass key');
    }
  };

  const title = settings?.title || 'System Under Scheduled Maintenance';
  const message =
    settings?.message ||
    'We are performing essential system updates and infrastructure maintenance to provide you with faster, more reliable courier logistics.';
  const hotline = settings?.supportContact?.phone || '+880 1700-000000';
  const email = settings?.supportContact?.email || 'support@shohnaat.com';
  const targetRoles = settings?.targetRoles || [];

  const roleLabels: Record<string, string> = {
    merchant: 'Merchant Portal',
    rider: 'Rider App',
    operator: 'Hub Operations',
    public: 'Public Tracking & Website',
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* ── Radiant Background Elements ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── Top Header ── */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-black">
            <Truck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white uppercase leading-none">
              SHOHNAAT
            </span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase mt-0.5">
              Logistics Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBypassModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Bypass</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Hero ── */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-10 flex flex-col items-center text-center my-auto">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm shadow-amber-500/10 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span>Scheduled Infrastructure Maintenance</span>
        </div>

        {/* Icon & Glow Center */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-2xl shadow-blue-900/40 relative z-10">
            <Wrench className="w-11 h-11 stroke-[1.8] animate-[spin_12s_linear_infinite]" />
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-blue-500/20 rounded-full blur-xl -z-0" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mb-4">
          {title}
        </h1>

        {/* Message */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8">
          {message}
        </p>

        {/* ── Countdown Timer (if configured) ── */}
        {timeRemaining && !timeRemaining.isExpired && (
          <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 mb-8 shadow-xl shadow-black/40">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Estimated Service Restoration</span>
            </div>

            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              <div className="flex flex-col items-center bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono">
                  {String(timeRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">
                  Days
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">
                  Hours
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
                <span className="text-2xl sm:text-4xl font-black text-white font-mono">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">
                  Minutes
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4">
                <span className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase mt-1">
                  Seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Affected Scope Pills ── */}
        {targetRoles.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-lg">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Affected Portals:
            </span>
            {targetRoles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60 text-xs font-medium text-slate-300"
              >
                {roleLabels[role] || role}
              </span>
            ))}
          </div>
        )}

        {/* ── Actions: Refresh Button ── */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Checking Status...' : 'Check Again / Refresh'}</span>
          </button>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-colors"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Email Support</span>
          </a>
        </div>
      </main>

      {/* ── Footer with Support Details ── */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span>© {new Date().getFullYear()} Shohnaat Logistics. All systems monitored 24/7.</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={`tel:${hotline}`}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>Hotline: {hotline}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>{email}</span>
          </a>
        </div>
      </footer>

      {/* ── Bypass Secret Modal ── */}
      {isBypassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Super Admin Bypass</span>
              </div>
              <button
                onClick={() => setIsBypassModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If you are a system administrator or authorized QA engineer, enter the emergency bypass secret key or sign in with your Super Admin credentials.
            </p>

            <form onSubmit={handleBypassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bypass Secret Key
                </label>
                <input
                  type="password"
                  value={bypassInput}
                  onChange={(e) => {
                    setBypassInput(e.target.value);
                    setBypassError('');
                  }}
                  placeholder="Enter bypass key..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                />
                {bypassError && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{bypassError}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign In to Admin Panel →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBypassModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30"
                  >
                    Unlock Access
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
