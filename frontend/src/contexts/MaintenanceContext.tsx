'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';

export interface MaintenanceSettings {
  isEnabled: boolean;
  rawEnabled?: boolean;
  title: string;
  message: string;
  startAt?: string | null;
  endAt?: string | null;
  targetScope: 'ALL' | 'CUSTOM';
  targetRoles: string[];
  targetPages: string[];
  supportContact: {
    phone: string;
    email: string;
  };
  readOnlyMode?: boolean;
  updatedAt?: string;
  allowedRoles?: string[];
  allowedIps?: string[];
  bypassSecret?: string;
  effectiveEnabled?: boolean;
}

export interface MaintenanceContextType {
  settings: MaintenanceSettings | null;
  isLoading: boolean;
  isUnderMaintenance: boolean;
  isSuperAdmin: boolean;
  userRole: string;
  hasBypass: boolean;
  refreshMaintenance: () => Promise<void>;
  applyBypassKey: (key: string) => boolean;
  clearBypassKey: () => void;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null;
}

const DEFAULT_SETTINGS: MaintenanceSettings = {
  isEnabled: false,
  title: 'System Under Scheduled Maintenance',
  message: 'We are currently performing essential platform upgrades. The affected services will be restored shortly.',
  startAt: null,
  endAt: null,
  targetScope: 'CUSTOM',
  targetRoles: ['merchant', 'rider', 'public'],
  targetPages: ['/dashboard', '/rider', '/track'],
  supportContact: {
    phone: '+880 1700-000000',
    email: 'support@shohnaat.com',
  },
  readOnlyMode: false,
};

const MaintenanceContext = createContext<MaintenanceContextType>({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isUnderMaintenance: false,
  isSuperAdmin: false,
  userRole: 'public',
  hasBypass: false,
  refreshMaintenance: async () => {},
  applyBypassKey: () => false,
  clearBypassKey: () => {},
  timeRemaining: null,
});

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<string>('public');
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [hasBypass, setHasBypass] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<MaintenanceContextType['timeRemaining']>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load user role from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shohnaat_user');
      if (stored) {
        const u = JSON.parse(stored);
        const role = u.role?.name || u.role || (u.roles && u.roles[0]) || 'public';
        const normalizedRole = typeof role === 'string' ? role.toLowerCase() : 'public';
        setUserRole(normalizedRole);
        setIsSuperAdmin(normalizedRole === 'super_admin' || normalizedRole === 'admin');
      } else {
        setUserRole('public');
        setIsSuperAdmin(false);
      }
    } catch {
      setUserRole('public');
      setIsSuperAdmin(false);
    }
  }, [pathname]);

  // Check URL or localStorage for emergency bypass key
  useEffect(() => {
    try {
      const urlBypass = searchParams?.get('maint_bypass');
      const savedBypass = localStorage.getItem('shohnaat_maint_bypass');

      if (urlBypass) {
        localStorage.setItem('shohnaat_maint_bypass', urlBypass);
        setHasBypass(true);
      } else if (savedBypass) {
        setHasBypass(true);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Fetch maintenance settings from backend
  const refreshMaintenance = useCallback(async () => {
    try {
      // If Super Admin, fetch admin endpoint to get complete details
      const endpoint = isSuperAdmin ? '/api/v1/settings/maintenance/admin' : '/api/v1/settings/maintenance';
      const res = await apiGet<MaintenanceSettings>(endpoint);
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    refreshMaintenance();

    // Poll every 30 seconds for live maintenance status
    const interval = setInterval(refreshMaintenance, 30000);
    return () => clearInterval(interval);
  }, [refreshMaintenance]);

  // Countdown timer calculations
  useEffect(() => {
    if (!settings?.endAt) {
      setTimeRemaining(null);
      return;
    }

    const calculateTime = () => {
      const target = new Date(settings.endAt!).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [settings?.endAt]);

  const applyBypassKey = (key: string): boolean => {
    if (!key.trim()) return false;
    try {
      localStorage.setItem('shohnaat_maint_bypass', key.trim());
      setHasBypass(true);
      return true;
    } catch {
      return false;
    }
  };

  const clearBypassKey = () => {
    try {
      localStorage.removeItem('shohnaat_maint_bypass');
      setHasBypass(false);
    } catch {
      // ignore
    }
  };

  // Determine if current route & user is under maintenance
  const isUnderMaintenance = React.useMemo(() => {
    if (!settings) return false;

    // Must be effectively enabled
    const enabled = settings.isEnabled || settings.effectiveEnabled;
    if (!enabled) return false;

    // Super Admin is never blocked
    if (isSuperAdmin) return false;

    // Has bypass key?
    if (hasBypass) return false;

    // Check if target scope applies to the user's role
    const targetedRoles = settings.targetRoles || [];
    const isRoleTargeted = targetedRoles.length === 0 || targetedRoles.includes(userRole);
    if (!isRoleTargeted) return false;

    // Check if path is targeted
    const currentPath = (pathname || '/').toLowerCase();

    // Never block /admin login or maintenance bypass routes
    if (currentPath.startsWith('/admin') && isSuperAdmin) return false;

    if (settings.targetScope === 'ALL') {
      // Allow admin routes even if ALL is selected so admins can log in
      if (currentPath.startsWith('/admin')) return false;
      return true;
    }

    // Check targeted pages
    const targetPages = settings.targetPages || [];
    if (targetPages.length === 0) return false;

    return targetPages.some((pattern) => {
      if (!pattern) return false;
      const p = pattern.trim().toLowerCase();
      if (currentPath === p) return true;
      if (p === '/') return currentPath === '/';
      if (p.endsWith('/*')) {
        const base = p.slice(0, -2);
        return currentPath === base || currentPath.startsWith(base + '/');
      }
      if (currentPath.startsWith(p + '/')) return true;
      return false;
    });
  }, [settings, isSuperAdmin, hasBypass, userRole, pathname]);

  return (
    <MaintenanceContext.Provider
      value={{
        settings,
        isLoading,
        isUnderMaintenance,
        isSuperAdmin,
        userRole,
        hasBypass,
        refreshMaintenance,
        applyBypassKey,
        clearBypassKey,
        timeRemaining,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => useContext(MaintenanceContext);
