'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { apiGet, subscribeMaintenance } from '@/lib/api';

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
  isSimulatingUserView: boolean;
  simulationRole: 'merchant' | 'rider' | 'public';
  setIsSimulatingUserView: (simulating: boolean) => void;
  setSimulationRole: (role: 'merchant' | 'rider' | 'public') => void;
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
  message: 'We are currently performing essential platform upgrades to improve performance and reliability. The affected services will be restored shortly.',
  startAt: null,
  endAt: null,
  targetScope: 'CUSTOM',
  targetRoles: ['merchant', 'rider', 'public'],
  targetPages: ['/', '/track', '/dashboard', '/rider'],
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
  isSimulatingUserView: false,
  simulationRole: 'merchant',
  setIsSimulatingUserView: () => {},
  setSimulationRole: () => {},
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
  const [isSimulatingUserView, setIsSimulatingUserView] = useState<boolean>(false);
  const [simulationRole, setSimulationRole] = useState<'merchant' | 'rider' | 'public'>('merchant');
  const [timeRemaining, setTimeRemaining] = useState<MaintenanceContextType['timeRemaining']>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load user role & simulation state from localStorage
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

    try {
      const sim = localStorage.getItem('shohnaat_maint_simulation');
      if (sim === 'true') {
        setIsSimulatingUserView(true);
      }
    } catch {
      // ignore
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

  // Initial fetch and regular polling fallback (every 20 seconds)
  useEffect(() => {
    refreshMaintenance();
    const interval = setInterval(refreshMaintenance, 20000);
    return () => clearInterval(interval);
  }, [refreshMaintenance]);

  // Real-Time SSE Stream for instant push updates
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let eventSource: EventSource | null = null;
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || 
        (window.location.hostname.includes('shohnaat.rahimbadsa.me') ? 'https://api-shohnaat.rahimbadsa.me' : 'http://localhost:5001');
      
      eventSource = new EventSource(`${apiHost}/api/v1/settings/maintenance/live`);

      eventSource.addEventListener('maintenance_update', (event) => {
        try {
          const updated = JSON.parse(event.data);
          setSettings((prev) => ({
            ...(prev || DEFAULT_SETTINGS),
            ...updated,
          }));
        } catch {
          // ignore
        }
      });

      eventSource.addEventListener('initial_state', (event) => {
        try {
          const initial = JSON.parse(event.data);
          setSettings((prev) => ({
            ...(prev || DEFAULT_SETTINGS),
            ...initial,
          }));
        } catch {
          // ignore
        }
      });

      eventSource.onerror = () => {
        // SSE disconnected, fallback polling is active
        eventSource?.close();
      };
    } catch {
      // SSE not supported or network error
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  // BroadcastChannel & storage event for cross-tab instant synchronization
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('shohnaat_maintenance_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'MAINTENANCE_TOGGLED') {
          refreshMaintenance();
        }
      };
    } catch {
      // BroadcastChannel fallback
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shohnaat_maint_broadcast') {
        refreshMaintenance();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshMaintenance]);

  // Hook into 503 API interceptor to immediately trigger maintenance screen
  useEffect(() => {
    const unsubscribe = subscribeMaintenance((payload) => {
      if (payload?.maintenance) {
        setSettings((prev) => ({
          ...(prev || DEFAULT_SETTINGS),
          isEnabled: true,
          effectiveEnabled: true,
          title: payload.title || prev?.title || DEFAULT_SETTINGS.title,
          message: payload.message || prev?.message || DEFAULT_SETTINGS.message,
          startAt: payload.startAt || prev?.startAt,
          endAt: payload.endAt || prev?.endAt,
          supportContact: payload.supportContact || prev?.supportContact || DEFAULT_SETTINGS.supportContact,
        }));
      }
    });

    return unsubscribe;
  }, []);

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

  const handleSetSimulatingUserView = (simulating: boolean) => {
    setIsSimulatingUserView(simulating);
    try {
      if (simulating) {
        localStorage.setItem('shohnaat_maint_simulation', 'true');
      } else {
        localStorage.removeItem('shohnaat_maint_simulation');
      }
    } catch {
      // ignore
    }
  };

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
  const isUnderMaintenance = useMemo(() => {
    const currentPath = (pathname || '/').toLowerCase();

    // Direct access to /admin and /login are ALWAYS accessible so admins can enter directly
    if (currentPath.startsWith('/admin') || currentPath === '/login' || currentPath.startsWith('/login/')) {
      return false;
    }

    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local'));

    // On local dev server, stay hidden and operational unless simulating
    if (isLocalhost && !isSimulatingUserView) {
      return false;
    }

    // 1. If Super Admin is simulating the customer experience, trigger maintenance page
    if (isSimulatingUserView) {
      return true;
    }

    if (!settings) return false;

    // 2. Must be effectively enabled
    const enabled = Boolean(settings.isEnabled || settings.effectiveEnabled || settings.rawEnabled);
    if (!enabled) return false;

    // 3. Super Admin is exempt during normal operations
    if (isSuperAdmin) return false;

    // 4. Authorized bypass key holders are exempt
    if (hasBypass) return false;

    // 5. Check if target scope applies to the user's role
    const effectiveRole = isSimulatingUserView ? simulationRole : userRole;
    const targetedRoles = settings.targetRoles || [];
    const isRoleTargeted = targetedRoles.length === 0 || targetedRoles.includes(effectiveRole);
    if (!isRoleTargeted) return false;

    // 6. Check if path is targeted
    // If targetScope is 'ALL', block all customer & public routes
    if (settings.targetScope === 'ALL') {
      if (currentPath.startsWith('/admin') && isSuperAdmin) return false;
      return true;
    }

    // 7. Check targeted pages (with robust wildcard and sub-route matching)
    const targetPages = settings.targetPages || [];
    if (targetPages.length === 0) return false;

    return targetPages.some((pattern) => {
      if (!pattern) return false;
      const p = pattern.trim().toLowerCase();

      // Exact match
      if (currentPath === p) return true;

      // Root path '/'
      if (p === '/') return currentPath === '/';

      // Wildcard pattern: e.g. "/dashboard/*" or "/rider/*"
      if (p.endsWith('/*')) {
        const base = p.slice(0, -2);
        return currentPath === base || currentPath.startsWith(base + '/');
      }

      // Prefix match (e.g. "/dashboard" blocks "/dashboard/shipments", "/dashboard/pickups", etc.)
      if (currentPath.startsWith(p + '/')) return true;

      return false;
    });
  }, [settings, isSuperAdmin, hasBypass, userRole, pathname, isSimulatingUserView, simulationRole]);

  return (
    <MaintenanceContext.Provider
      value={{
        settings,
        isLoading,
        isUnderMaintenance,
        isSuperAdmin,
        userRole,
        hasBypass,
        isSimulatingUserView,
        simulationRole,
        setIsSimulatingUserView: handleSetSimulatingUserView,
        setSimulationRole,
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
