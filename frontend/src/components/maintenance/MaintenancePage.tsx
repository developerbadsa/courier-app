'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  RefreshCw,
  KeyRound,
  Truck,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  MessageCircle,
  EyeOff,
  Server,
  Activity,
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
    simulationRole,
  } = useMaintenance();
  const router = useRouter();

  const [isBypassModalOpen, setIsBypassModalOpen] = useState(false);
  const [bypassInput, setBypassInput] = useState('');
  const [bypassError, setBypassError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pingStatus, setPingStatus] = useState<'checking' | 'offline' | 'online'>('offline');
  const [pingLatency, setPingLatency] = useState<number>(35);

  // Auto-reconnect background heartbeat ping
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const checkServerLive = async () => {
      try {
        const start = performance.now();
        const apiHost =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== 'undefined' && window.location.hostname.includes('shohnaat.rahimbadsa.me')
            ? 'https://api-shohnaat.rahimbadsa.me'
            : 'http://localhost:5001');

        const res = await fetch(`${apiHost}/api/v1/settings/maintenance`, {
          cache: 'no-store',
        });
        const elapsed = Math.round(performance.now() - start);
        setPingLatency(Math.max(12, elapsed));

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && !json.data.isEnabled) {
            setPingStatus('online');
            // Platform is back online! Refresh automatically
            setTimeout(() => {
              if (!isSimulatingUserView) {
                window.location.reload();
              }
            }, 1200);
          } else {
            setPingStatus('offline');
          }
        }
      } catch {
        setPingStatus('offline');
      }
    };

    checkServerLive();
    timer = setInterval(checkServerLive, 6000);
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
      setBypassError('Failed to apply bypass key');
    }
  };

  const title = settings?.title || 'System Under Scheduled Maintenance';
  const message =
    settings?.message ||
    'We are performing essential platform upgrades and database maintenance to provide faster parcel processing and higher reliability.';
  const hotline = settings?.supportContact?.phone || '+880 1700-000000';
  const email = settings?.supportContact?.email || 'support@shohnaat.com';
  const targetRoles = settings?.targetRoles || [];

  const roleLabels: Record<string, string> = {
    merchant: 'Merchant Portal & API',
    rider: 'Rider Mobile App',
    operator: 'Hub Barcode Operations',
    public: 'Public Tracking & Website',
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* ── Admin Simulation Top Notice Bar ── */}
      {isSimulatingUserView && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-sans shadow-lg sticky top-0 z-50 py-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
            <span>
              <strong>ADMIN SIMULATION MODE:</strong> You are testing the exact maintenance view as a{' '}
              <span className="uppercase underline underline-offset-2">{simulationRole}</span>.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/settings/maintenance')}
              className="px-3 py-1 bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-bold rounded-lg transition-colors"
            >
              Configure Settings
            </button>
            <button
              onClick={() => setIsSimulatingUserView(false)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-amber-300 hover:text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Simulation</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Radiant Background Elements & Glow Meshes ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-blue-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Modern Radial Particle Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* ── Top Navigation / Brand Header ── */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 font-black border border-blue-400/30">
            <Truck className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-white uppercase leading-none">
              SHOHNAAT
            </span>
            <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mt-0.5">
              Logistics Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                pingStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse'
              }`}
            />
            <span>
              {pingStatus === 'online'
                ? 'System Ready • Auto-Reloading...'
                : `Live Auto-Ping: ${pingLatency}ms`}
            </span>
          </div>

          <button
            onClick={() => setIsBypassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-sm hover:border-slate-600 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Bypass</span>
          </button>
        </div>
      </header>

      {/* ── Main Content Hero ── */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-6 py-8 flex flex-col items-center text-center my-auto">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm shadow-amber-500/10">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-ping" />
          <span>Scheduled Infrastructure Maintenance</span>
        </div>

        {/* 3D Radiant Wrench Icon with Dual Rings */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-2xl shadow-blue-950/80 relative z-10">
            <Wrench className="w-11 h-11 stroke-[2] animate-[spin_16s_linear_infinite]" />
          </div>
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-amber-500/20 via-blue-500/20 to-transparent blur-md -z-0" />
        </div>

        {/* Notice Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mb-4">
          {title}
        </h1>

        {/* Notice Message */}
        <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed mb-8 font-normal">
          {message}
        </p>

        {/* ── Countdown Timer (if configured) ── */}
        {timeRemaining && !timeRemaining.isExpired && (
          <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 mb-8 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Estimated Service Restoration</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              <div className="flex flex-col items-center bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {String(timeRemaining.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Days
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Hours
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Minutes
                </span>
              </div>
              <div className="flex flex-col items-center bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  Seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Active Service Status Grid ── */}
        <div className="w-full max-w-lg grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center">
            <span className="text-slate-400 font-medium">Merchant Booking</span>
            <span className="font-bold text-amber-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Maintenance
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center">
            <span className="text-slate-400 font-medium">Live Tracking</span>
            <span className="font-bold text-amber-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Paused
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center">
            <span className="text-slate-400 font-medium">Parcel Safety</span>
            <span className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% Secured
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center">
            <span className="text-slate-400 font-medium">Help Hotline</span>
            <span className="font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Operational
            </span>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking Status...' : 'Check Again & Refresh'}</span>
          </button>

          <a
            href={`tel:${hotline}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call Hotline</span>
          </a>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span>Email Support</span>
          </a>
        </div>
      </main>

      {/* ── Footer with Support Details ── */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span>© {new Date().getFullYear()} Shohnaat Logistics. All infrastructure monitored 24/7.</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={`tel:${hotline}`}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors font-medium"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hotline: {hotline}</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>{email}</span>
          </a>
        </div>
      </footer>

      {/* ── Emergency Bypass Secret Modal ── */}
      {isBypassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Super Admin Emergency Bypass</span>
              </div>
              <button
                onClick={() => setIsBypassModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              If you are a system administrator or authorized engineer, enter the emergency bypass secret key or sign in with your Super Admin credentials.
            </p>

            <form onSubmit={handleBypassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                  className="px-3 py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Admin Sign In →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBypassModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 cursor-pointer"
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
