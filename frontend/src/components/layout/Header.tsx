'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  CreditCard,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Package,
  DollarSign,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileSidebar?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionHref?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
}) => {
  const router = useRouter();

  // Format current date: "Mon, Aug 18"
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTrackingId, setSearchTrackingId] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [userInfo, setUserInfo] = useState({
    name: 'Ahmed K.',
    email: 'merchant@shohnaat.com',
    role: 'Merchant Account',
    initials: 'AM',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shohnaat_user');
      if (stored) {
        const u = JSON.parse(stored);
        const name = u.name || 'Ahmed K.';
        const email = u.email || 'merchant@shohnaat.com';
        const roleName = u.role?.name || 'Merchant Account';
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
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('shohnaat_token');
      localStorage.removeItem('shohnaat_user');
    } catch {
      // ignore
    }
    router.push('/login');
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTrackingId.trim()) {
      setIsSearchOpen(false);
      router.push(`/track?id=${encodeURIComponent(searchTrackingId.trim())}`);
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Mobile Toggle & Figma Greeting */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
            Good morning, {userInfo.name.split(' ')[0]}
          </h2>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            {todayFormatted}
          </p>
        </div>
      </div>

      {/* Right: Search, Notification with Red Dot, Interactive Profile Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Quick Search (⌘K)"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsProfileOpen(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown Card */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  <span className="bg-blue-100 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    3 New
                  </span>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Mark all as read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      Parcel <span className="font-mono font-bold">SH-9082</span> has been picked up
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Rider David Miller • 12m ago</p>
                  </div>
                </div>

                <div className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      Weekly COD settlement <span className="font-bold text-emerald-600">$4,250.00</span> processed
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Automated Payout • 2h ago</p>
                  </div>
                </div>

                <div className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      Store KYC verification approved by Superadmin
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">HQ Compliance • 5h ago</p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50/50">
                <Link
                  href="/dashboard/shipments"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View all activity logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Pill with Standard Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationsOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-[#1D68F2] hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer ring-2 ring-transparent hover:ring-blue-200"
            title="Account Menu"
            aria-expanded={isProfileOpen}
          >
            <User className="w-4.5 h-4.5 text-white" />
          </button>

          {/* Standard Enterprise Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1D68F2] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {userInfo.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                      {userInfo.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified Merchant</span>
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-2 space-y-1 text-xs font-semibold text-slate-700">
                <Link
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Store Profile & KYC</span>
                </Link>

                <Link
                  href="/dashboard/addresses"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Address Book & Hubs</span>
                </Link>

                <Link
                  href="/dashboard/finance"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>Finance & Settlements</span>
                </Link>

                <Link
                  href="/dashboard/developer"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Developer API & Keys</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/40">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleQuickSearch} className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Enter parcel tracking number (e.g. SH-9082)..."
                value={searchTrackingId}
                onChange={(e) => setSearchTrackingId(e.target.value)}
                className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-4 bg-slate-50/50 text-xs text-slate-500 flex items-center justify-between">
              <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px] font-bold">Enter</kbd> to track</span>
              <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => { setSearchTrackingId('SH-9082'); }}>Try demo: SH-9082</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
