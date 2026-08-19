'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  LayoutDashboard,
  Truck,
  DollarSign,
  Users,
  Settings,
  BarChart3,
  MapPin,
  LogOut,
  X,
  CreditCard,
  Building2,
  FileText,
} from 'lucide-react';
import { Avatar } from '@/components/ui';

export type UserRole = 'merchant' | 'admin' | 'rider' | 'operator';

interface SidebarProps {
  role?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

/* ── Navigation Config ── */
const NAV_CONFIG: Record<UserRole, { section: string; items: NavItem[] }[]> = {
  merchant: [
    {
      section: 'Operations',
      items: [
        { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Shipments', href: '/dashboard/shipments', icon: Package, badge: '128' },
        { label: 'Create Shipment', href: '/dashboard/shipments/new', icon: Package },
        { label: 'Bulk Upload', href: '/dashboard/shipments/bulk', icon: FileText },
        { label: 'Pickup Requests', href: '/dashboard/pickups', icon: Truck, badge: '3' },
        { label: 'Schedule Pickup', href: '/dashboard/pickups/new', icon: Truck },
        { label: 'Tracking', href: '/track', icon: MapPin },
      ],
    },
    {
      section: 'Financial',
      items: [
        { label: 'COD & Payouts', href: '/dashboard/finance', icon: DollarSign },
        { label: 'Invoices', href: '/dashboard/invoices', icon: FileText },
        { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      ],
    },
    {
      section: 'Settings',
      items: [
        { label: 'Address Book', href: '/dashboard/addresses', icon: MapPin },
        { label: 'Store Profile', href: '/dashboard/profile', icon: Building2 },
        { label: 'API & Webhooks', href: '/dashboard/api', icon: Settings },
      ],
    },
  ],
  admin: [
    {
      section: 'System Hub',
      items: [
        { label: 'Admin Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'All Shipments', href: '/admin/shipments', icon: Package },
        { label: 'Fleet & Riders', href: '/admin/riders', icon: Truck },
        { label: 'Merchants', href: '/admin/merchants', icon: Users },
      ],
    },
    {
      section: 'Hub Operations',
      items: [
        { label: 'Inbound Scanner', href: '/admin/scan', icon: Package },
        { label: 'Outbound Bagging', href: '/admin/scan/outbound', icon: Truck },
      ],
    },
    {
      section: 'Logistics',
      items: [
        { label: 'Branches & Hubs', href: '/admin/hubs', icon: Building2 },
        { label: 'Coverage Zones', href: '/admin/zones', icon: MapPin },
        { label: 'Rate Cards', href: '/admin/rates', icon: CreditCard },
      ],
    },
    {
      section: 'Management',
      items: [
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
        { label: 'Settlements', href: '/admin/finance', icon: DollarSign },
        { label: 'System Settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ],
  rider: [
    {
      section: 'Tasklist',
      items: [
        { label: 'Deliveries', href: '/rider', icon: Truck, badge: '5' },
        { label: 'Pickups', href: '/rider/pickups', icon: Package, badge: '2' },
        { label: 'COD Collection', href: '/rider/cod', icon: DollarSign },
        { label: 'History', href: '/rider/history', icon: BarChart3 },
      ],
    },
  ],
  operator: [
    {
      section: 'Hub Management',
      items: [
        { label: 'Hub Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Inbound Scanner', href: '/admin/scan', icon: Package },
        { label: 'Outbound Bagging', href: '/admin/scan/outbound', icon: Truck },
        { label: 'Rider Dispatch', href: '/admin/dispatch', icon: Users },
      ],
    },
  ],
};

/* ── Profile Info by Role ── */
const ROLE_PROFILE: Record<UserRole, { name: string; email: string; initials: string }> = {
  merchant: { name: 'Acme Merchant', email: 'merchant@shohnaat.com', initials: 'AM' },
  admin: { name: 'System Admin', email: 'admin@shohnaat.com', initials: 'SA' },
  rider: { name: 'John Rider', email: 'rider@shohnaat.com', initials: 'JR' },
  operator: { name: 'Branch Operator', email: 'operator@shohnaat.com', initials: 'BO' },
};

/* ── Sidebar Component ── */
export const Sidebar: React.FC<SidebarProps> = ({ role = 'merchant', isOpen = false, onClose }) => {
  const pathname = usePathname();
  const navSections = NAV_CONFIG[role] || NAV_CONFIG.merchant;
  const profile = ROLE_PROFILE[role] || ROLE_PROFILE.merchant;

  const handleLogout = () => {
    localStorage.removeItem('shohnaat_token');
    localStorage.removeItem('shohnaat_user');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F172A] text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div>
          {/* Brand */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
                <Truck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="font-bold text-[14px] text-white tracking-tight">SHOHNAAT</div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {role === 'admin' ? 'Superadmin' : role === 'rider' ? 'Rider PWA' : role === 'operator' ? 'Operator' : 'Merchant Portal'}
                </div>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3.5 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navSections.map((section) => (
              <div key={section.section} className="space-y-1">
                <div className="px-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  {section.section}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/dashboard' &&
                      item.href !== '/admin' &&
                      pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-[#0c1322]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={profile.name} size="sm" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{profile.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{profile.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
