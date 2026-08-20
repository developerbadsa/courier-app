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
        const initials = name
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

  // Role-based Nav items
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
      ];
    }

    if (role === 'rider') {
      return [
        { label: 'Rider Task List', href: '/rider', icon: Truck },
        { label: 'Active Delivery', href: '/rider', icon: Package },
        { label: 'Tracking', href: '/track', icon: MapPin },
      ];
    }

    // Default: Merchant
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Shipments', href: '/dashboard/shipments', icon: Truck },
      { label: 'Pickups', href: '/dashboard/pickups', icon: Package },
      { label: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
      { label: 'Finance', href: '/dashboard/finance', icon: CreditCard },
      { label: 'Settings', href: '/dashboard/developer', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#182235] text-slate-300 select-none">
      {/* ── Brand Logo Header ── */}
      <div className="h-20 flex items-center justify-between px-7 shrink-0 border-b border-slate-800/60">
        <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center">
          <span className="font-extrabold text-xl tracking-[0.18em] text-white uppercase font-sans">
            SHOHNAAT
          </span>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── Main Nav Items ── */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
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
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-semibold transition-all ${
                isActive
                  ? 'bg-[#1D68F2] text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile & Logout Bottom Card (Figma Enhanced) ── */}
      <div className="p-3.5 border-t border-slate-800/80 bg-[#131B2B]/60 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 transition-colors">
          {/* User Avatar + Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-600/90 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-blue-400/30">
              {userInfo.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-100 truncate leading-tight">
                {userInfo.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {userInfo.email}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1 cursor-pointer shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40 border-r border-slate-800/80 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
