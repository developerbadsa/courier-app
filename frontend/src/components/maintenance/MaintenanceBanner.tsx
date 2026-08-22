'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Settings, Eye, EyeOff, X, ShieldAlert, Radio } from 'lucide-react';
import { useMaintenance } from '@/contexts/MaintenanceContext';

export const MaintenanceBanner: React.FC = () => {
  const {
    settings,
    isSuperAdmin,
    timeRemaining,
    isSimulatingUserView,
    setIsSimulatingUserView,
    simulationRole,
    setSimulationRole,
  } = useMaintenance();
  const [isDismissed, setIsDismissed] = React.useState(false);

  const isEnabled = Boolean(settings?.isEnabled || settings?.effectiveEnabled || settings?.rawEnabled);

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  // Keep hidden on local server unless explicitly simulating
  if (isLocalhost && !isSimulatingUserView) {
    return null;
  }

  // Show banner to Super Admins when Maintenance Mode is active (or when simulation is active)
  if ((!isEnabled && !isSimulatingUserView) || !isSuperAdmin || isDismissed) {
    return null;
  }

  const targetRoles = settings?.targetRoles || [];
  const targetPages = settings?.targetPages || [];

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-sans shadow-md border-b border-amber-600/30 sticky top-0 z-50 transition-all">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-950/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-950 stroke-[2.5] animate-bounce" />
          </div>
          <div className="truncate flex items-center gap-1.5">
            <span className="font-black uppercase tracking-wider text-amber-950">
              ⚠️ Maintenance Active:
            </span>
            <span className="text-amber-950/90 font-medium">
              Targeted:{' '}
              <strong className="font-bold text-amber-950">
                {targetRoles.length > 0 ? targetRoles.join(', ') : 'All Non-Admin Users'}
              </strong>{' '}
              | Scope:{' '}
              <strong className="font-bold text-amber-950">
                {settings?.targetScope === 'ALL' ? 'Entire Site' : `${targetPages.length} Modules`}
              </strong>
              {timeRemaining && !timeRemaining.isExpired && (
                <span className="ml-2 bg-amber-950/20 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                  Ends in {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Simulate User View Toggle */}
          <button
            onClick={() => setIsSimulatingUserView(!isSimulatingUserView)}
            className={`flex items-center gap-1.5 px-3 py-1 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer ${
              isSimulatingUserView
                ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                : 'bg-amber-950/20 hover:bg-amber-950/30 text-amber-950'
            }`}
          >
            {isSimulatingUserView ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Exit Simulation</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Simulate Visitor View</span>
              </>
            )}
          </button>

          <Link
            href="/admin/settings/maintenance"
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-amber-950/20 rounded text-amber-950 transition-colors cursor-pointer"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
