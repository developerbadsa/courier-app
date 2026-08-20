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
        <main className="flex-1 p-4 lg:p-6">
          {/* Page Header */}
          {title && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                >
                  {primaryActionLabel}
                </Button>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
