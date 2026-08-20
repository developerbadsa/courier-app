'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Truck,
  Package,
  MapPin,
  CreditCard,
  Settings,
  X,
  LogOut,
  Users,
  BarChart3,
  Building2,
  FileText,
  ShieldCheck,
  Search,
  Bell,
} from 'lucide-react';

export type UserRole = 'merchant' | 'admin' | 'rider' | 'operator';

interface SidebarProps {
  role?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role = 'merchant',
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    role: string;
    initials: string;
  }>({
    name: 'Ahmed K.',
    email: 'merchant@shohnaat.com',
    role: 'Merchant',
    initials: 'AM',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shohnaat_user');
      if (stored) {
        const u = JSON.parse(stored);
        const name = u.name || 'Ahmed K.';
        const email = u.email || 'merchant@shohnaat.com';
        const roleName = u.role?.name || role;
        const initials =
          name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'AM';

        setUserInfo({
          name,
          email,
          role: roleName.charAt(0).toUpperCase() + roleName.slice(1),
          initials,
        });
      }
    } catch {
      // Fallback default
    }
  }, [role]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('shohnaat_token');
      localStorage.removeItem('shohnaat_user');
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const getNavItems = () => {
    if (role === 'admin' || role === 'operator') {
      return [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Shipments', href: '/dashboard/shipments', icon: Truck },
        { label: 'Fleet & Riders', href: '/admin/fleet', icon: Users },
        { label: 'Inbound Scan', href: '/admin/scan', icon: Package },
        { label: 'Outbound Bag', href: '/admin/scan/outbound', icon: Truck },
        { label: 'Hubs & Zones', href: '/admin/hubs', icon: Building2 },
        { label: 'Rate Cards', href: '/admin/rates', icon: CreditCard },
        { label: 'Finance', href: '/admin/finance', icon: BarChart3 },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { label: 'Notifications', href: '/admin/settings/notifications', icon: Bell },
      ];
    }

    if (role === 'rider') {
      return [
        { label: 'Rider Task List', href: '/rider', icon: Truck },
        { label: 'Live Tracking', href: '/track', icon: MapPin },
      ];
    }

    // Default: Merchant
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Shipments', href: '/dashboard/shipments', icon: Truck },
      { label: 'Pickups', href: '/dashboard/pickups', icon: Package },
      { label: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
      { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
      { label: 'Finance', href: '/dashboard/finance', icon: CreditCard },
      { label: 'Developer API', href: '/dashboard/developer', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 select-none font-sans">
      {/* ── Brand Logo Header ── */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0 border-b border-slate-800/80">
        <Link
          href={role === 'admin' ? '/admin' : '/dashboard'}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            <Truck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wider text-white uppercase leading-tight">
              SHOHNAAT
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              {role === 'admin' ? 'Operations OS' : 'Logistics'}
            </span>
          </div>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Main Nav Items ── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard' || item.href === '/admin'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 stroke-[2] ${
                  isActive ? 'text-white' : 'text-slate-400'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile & Logout Bottom Card (Compact & Clean) ── */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between gap-2 p-2 rounded hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-2xs">
              {userInfo.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate leading-tight">
                {userInfo.name || 'Ahmed K.'}
              </div>
              <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                {userInfo.email || 'merchant@shohnaat.com'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 w-64 z-50 flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
