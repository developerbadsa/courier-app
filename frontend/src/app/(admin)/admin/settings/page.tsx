'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Bell,
  ShieldCheck,
  CreditCard,
  Building2,
  Users,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Database,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useMaintenance } from '@/contexts/MaintenanceContext';

export default function AdminSettingsOverviewPage() {
  const { settings } = useMaintenance();
  const isMaintenanceActive = Boolean(settings?.isEnabled || settings?.effectiveEnabled);

  const SETTING_CARDS = [
    {
      title: 'Site Maintenance & Access Lockdown',
      description:
        'Toggle platform maintenance mode, specify offline routes, restrict user roles, set countdown timers, and generate bypass keys.',
      href: '/admin/settings/maintenance',
      icon: Wrench,
      badge: isMaintenanceActive ? 'LIVE ACTIVE' : 'Operational',
      badgeColor: isMaintenanceActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-amber-50 text-amber-600',
      borderGlow: isMaintenanceActive ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200',
    },
    {
      title: 'Notification Channels & Triggers',
      description:
        'Configure email SMTP, SMS gateways, automated webhook triggers, delivery confirmations, and customer alerts.',
      href: '/admin/settings/notifications',
      icon: Bell,
      badge: 'Configured',
      badgeColor: 'bg-blue-100 text-blue-800',
      iconBg: 'bg-blue-50 text-blue-600',
      borderGlow: 'border-slate-200',
    },
    {
      title: 'Rate Cards & Zone Pricing',
      description:
        'Manage standard commercial rates, weight tier multipliers, inside/outside city surcharges, and custom merchant contracts.',
      href: '/admin/rates',
      icon: CreditCard,
      badge: 'Active',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      iconBg: 'bg-indigo-50 text-indigo-600',
      borderGlow: 'border-slate-200',
    },
    {
      title: 'Hubs & Coverage Zones',
      description:
        'Define regional sorting hubs, dispatch coverage districts, pickup zones, and delivery radius constraints.',
      href: '/admin/hubs',
      icon: Building2,
      badge: 'Active',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderGlow: 'border-slate-200',
    },
    {
      title: 'Fleet & Rider Operations',
      description:
        'Register field riders, assign vehicles, monitor daily shifts, performance metrics, and delivery runsheets.',
      href: '/admin/fleet',
      icon: Users,
      badge: 'Active',
      badgeColor: 'bg-purple-100 text-purple-800',
      iconBg: 'bg-purple-50 text-purple-600',
      borderGlow: 'border-slate-200',
    },
    {
      title: 'Audit Logs & System History',
      description:
        'Review comprehensive security audit trails, actor timestamps, entity diffs, and admin actions across the platform.',
      href: '/admin/audit-logs',
      icon: ShieldCheck,
      badge: 'Monitoring',
      badgeColor: 'bg-slate-100 text-slate-800',
      iconBg: 'bg-slate-100 text-slate-700',
      borderGlow: 'border-slate-200',
    },
  ];

  return (
    <DashboardLayout
      role="admin"
      title="System Settings & Administration Hub"
      subtitle="Manage global platform configurations, operational parameters, communication channels, and security controls."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SETTING_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 bg-white flex flex-col justify-between group ${card.borderGlow}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg} shadow-xs`}
                  >
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                  <span>{card.title}</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Configure Settings</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
