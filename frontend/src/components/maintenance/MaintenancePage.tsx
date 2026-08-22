'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  Phone,
  Mail,
  RefreshCw,
  KeyRound,
  Truck,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  EyeOff,
} from 'lucide-react';
import { useMaintenance } from '@/contexts/MaintenanceContext';
import { useRouter } from 'next/navigation';

export const MaintenancePage: React.FC = () => {
  const {
    settings,
    timeRemaining,
    refreshMaintenance,
    applyBypassKey,
    isSimulatingUserView,
    setIsSimulatingUserView,
  } = useMaintenance();
  const router = useRouter();

  const [isBypassModalOpen, setIsBypassModalOpen] = useState(false);
  const [bypassInput, setBypassInput] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Background auto-refresh check
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checkStatus = async () => {
      try {
        const apiHost =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== 'undefined' && window.location.hostname.includes('shohnaat.rahimbadsa.me')
            ? 'https://api-shohnaat.rahimbadsa.me'
            : 'http://localhost:5001');

        const res = await fetch(`${apiHost}/api/v1/settings/maintenance`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && !json.data.isEnabled && !isSimulatingUserView) {
            window.location.reload();
          }
        }
      } catch {
        // ignore
      }
    };

    timer = setInterval(checkStatus, 10000);
    return () => clearInterval(timer);
  }, [isSimulatingUserView]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMaintenance();
    setTimeout(() => {
      setIsRefreshing(false);
      window.location.reload();
    }, 600);
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
      setBypassError('Invalid bypass key');
    }
  };

  const title = settings?.title || 'System Under Scheduled Maintenance';
  const message =
    settings?.message ||
    'We are currently performing essential platform upgrades to improve system performance and reliability. Services will be restored shortly.';
  const hotline = settings?.supportContact?.phone || '+880 1700-000000';
  const email = settings?.supportContact?.email || 'support@shohnaat.com';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Admin Simulation Top Notice Bar ── */}
      {isSimulatingUserView && (
        <div className="w-full bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between text-xs font-semibold border-b border-amber-600/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>Admin Simulation Mode Active: You are viewing this screen as a regular visitor.</span>
          </div>
          <button
            onClick={() => setIsSimulatingUserView(false)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-950 text-amber-300 hover:text-white rounded text-xs font-bold transition-colors cursor-pointer"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Exit Simulation</span>
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">SHOHNAAT</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBypassModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-500" />
              <span>Bypass Key</span>
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
            >
              <span>Admin Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Maintenance Card ── */}
      <main className="max-w-lg w-full mx-auto px-4 py-12 my-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-xs text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Scheduled System Maintenance</span>
          </div>

          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-amber-100/70 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <Wrench className="w-7 h-7 stroke-[2]" />
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {title}
          </h1>

          {/* Message */}
          <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-md mx-auto">
            {message}
          </p>

          {/* ── Countdown Timer (if configured) ── */}
          {timeRemaining && !timeRemaining.isExpired && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Estimated Restoration</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                    {String(timeRemaining.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Days</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Hours</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono block">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Mins</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-extrabold text-blue-600 font-mono block">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Secs</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 stroke-[2.2] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Check Again & Refresh'}</span>
            </button>

            <a
              href={`tel:${hotline}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Helpline</span>
            </a>
          </div>

          {/* Support Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
            <a href={`tel:${hotline}`} className="hover:text-slate-900 transition-colors">
              Hotline: <strong>{hotline}</strong>
            </a>
            <span>•</span>
            <a href={`mailto:${email}`} className="hover:text-slate-900 transition-colors">
              <strong>{email}</strong>
            </a>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Shohnaat Logistics Network. All services monitored 24/7.</span>
        </div>
      </footer>

      {/* ── Bypass Secret Modal ── */}
      {isBypassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Emergency Access Bypass</span>
              </div>
              <button
                onClick={() => setIsBypassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Authorized team members and administrators can enter the emergency bypass key below to access the platform.
            </p>

            <form onSubmit={handleBypassSubmit} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={bypassInput}
                  onChange={(e) => {
                    setBypassInput(e.target.value);
                    setBypassError('');
                  }}
                  placeholder="Enter bypass secret key..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-mono"
                />
                {bypassError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{bypassError}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Admin Login →
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBypassModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs cursor-pointer"
                  >
                    Unlock
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
