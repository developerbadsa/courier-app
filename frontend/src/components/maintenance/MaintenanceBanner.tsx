'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, Settings, ShieldAlert, X } from 'lucide-react';
import { useMaintenance } from '@/contexts/MaintenanceContext';

export const MaintenanceBanner: React.FC = () => {
  const { settings, isSuperAdmin, timeRemaining } = useMaintenance();
  const [isDismissed, setIsDismissed] = React.useState(false);

  const isEnabled = Boolean(settings?.isEnabled || settings?.effectiveEnabled);

  // Only show banner to Super Admins when Maintenance Mode is active
  if (!isEnabled || !isSuperAdmin || isDismissed) {
    return null;
  }

  const targetRoles = settings?.targetRoles || [];
  const targetPages = settings?.targetPages || [];

  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-sans shadow-md border-b border-amber-700/30 sticky top-0 z-50 transition-all">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-950/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-950 stroke-[2.5] animate-bounce" />
          </div>
          <div className="truncate">
            <span className="font-extrabold uppercase tracking-wider text-amber-950 mr-1.5">
              ⚠️ Maintenance Mode Active:
            </span>
            <span className="text-amber-950/90 font-medium">
              Targeted:{' '}
              <strong>
                {targetRoles.length > 0 ? targetRoles.join(', ') : 'All Non-Admin Users'}
              </strong>{' '}
              | Routes: <strong>{settings?.targetScope === 'ALL' ? 'Entire Platform' : `${targetPages.length} offline modules`}</strong>
              {timeRemaining && !timeRemaining.isExpired && (
                <span className="ml-2 bg-amber-950/20 px-2 py-0.5 rounded font-mono font-bold">
                  Ends in {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/settings/maintenance"
            className="flex items-center gap-1 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Manage Settings</span>
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-amber-700/20 rounded text-amber-950 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
