'use client';

import React from 'react';
import { Menu, Search, Bell, Plus, Globe } from 'lucide-react';
import { Button } from '@/components/ui';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenMobileSidebar?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryActionHref?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Overview',
  subtitle,
  onOpenMobileSidebar,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 font-normal mt-0.5 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions, Global Search & Badges */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tracking #, merchant..."
            className="w-56 lg:w-64 h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
          />
          <kbd className="absolute right-2.5 text-[10px] font-semibold text-slate-400 bg-slate-200/70 border border-slate-300/60 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>

        {/* Currency / Region Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-md text-[11px] font-semibold text-slate-700">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>HQ • USD ($)</span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </button>

        {/* Primary Action Button (if provided) */}
        {primaryActionLabel && (
          <Button
            variant="primary"
            size="sm"
            onClick={onPrimaryAction}
            leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
            className="h-9 px-3.5 text-xs font-semibold"
          >
            {primaryActionLabel}
          </Button>
        )}
      </div>
    </header>
  );
};
