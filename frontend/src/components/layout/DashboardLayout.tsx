'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar, type UserRole } from './Sidebar';
import { TopBar } from './TopBar';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: UserRole;
  title?: string;
  subtitle?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  role = 'merchant',
  title,
  subtitle,
  primaryActionLabel,
  onPrimaryAction,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-[1600px] w-full mx-auto">
          {/* Page Header with generous spacing */}
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {primaryActionLabel && onPrimaryAction && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={onPrimaryAction}
                  leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  className="shadow-sm font-semibold"
                >
                  {primaryActionLabel}
                </Button>
              )}
            </div>
          )}
          <div className="space-y-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
