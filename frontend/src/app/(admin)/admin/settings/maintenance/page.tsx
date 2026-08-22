'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Power,
  Users,
  Globe,
  Truck,
  Building2,
  Package,
  Layers,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Copy,
  ExternalLink,
  Save,
  RotateCcw,
  Eye,
  Info,
  ChevronRight,
  Plus,
  Trash2,
  Phone,
  Mail,
  Lock,
  Unlock,
  Radio,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';
import { apiGet, apiPatch, showToast } from '@/lib/api';
import { useMaintenance, MaintenanceSettings } from '@/contexts/MaintenanceContext';

interface TargetRoleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

interface TargetPageOption {
  id: string;
  name: string;
  path: string;
  description: string;
  category: 'public' | 'merchant' | 'rider' | 'operator';
}

const ROLE_OPTIONS: TargetRoleOption[] = [
  {
    id: 'public',
    name: 'Public Guests & Visitors',
    description: 'Landing page visitors, public tracking searches, and new signups.',
    icon: Globe,
    color: 'blue',
  },
  {
    id: 'merchant',
    name: 'Merchants & Sellers',
    description: 'Merchant dashboard, order bookings, pickup requests, and invoices.',
    icon: Building2,
    color: 'indigo',
  },
  {
    id: 'rider',
    name: 'Delivery Riders',
    description: 'Rider mobile app, assigned deliveries, tasks, and status updates.',
    icon: Truck,
    color: 'amber',
  },
  {
    id: 'operator',
    name: 'Hub Operators & Staff',
    description: 'Branch hub staff, barcode scanning, bag dispatches, and sorting.',
    icon: Package,
    color: 'emerald',
  },
];

const PRESET_PAGES: TargetPageOption[] = [
  {
    id: 'landing',
    name: 'Landing Page',
    path: '/',
    description: 'Home page & public marketing website',
    category: 'public',
  },
  {
    id: 'tracking',
    name: 'Public Tracking',
    path: '/track',
    description: 'Public shipment tracking portal',
    category: 'public',
  },
  {
    id: 'register',
    name: 'Merchant Registration',
    path: '/register',
    description: 'New merchant signup form',
    category: 'public',
  },
  {
    id: 'merchant_dashboard',
    name: 'Merchant Dashboard',
    path: '/dashboard',
    description: 'Merchant main analytics & overview',
    category: 'merchant',
  },
  {
    id: 'merchant_shipments',
    name: 'Shipments & Booking',
    path: '/dashboard/shipments',
    description: 'Parcel booking and bulk parcel uploads',
    category: 'merchant',
  },
  {
    id: 'merchant_pickups',
    name: 'Pickup Requests',
    path: '/dashboard/pickups',
    description: 'Scheduling and tracking doorstep pickups',
    category: 'merchant',
  },
  {
    id: 'merchant_finance',
    name: 'Finance & Invoices',
    path: '/dashboard/finance',
    description: 'COD remittance, statements, and payouts',
    category: 'merchant',
  },
  {
    id: 'rider_portal',
    name: 'Rider Task Portal',
    path: '/rider',
    description: 'Rider delivery tasks and run-sheets',
    category: 'rider',
  },
  {
    id: 'hub_scan',
    name: 'Hub Barcode Scanning',
    path: '/admin/scan',
    description: 'Inbound & outbound manifest scanning',
    category: 'operator',
  },
];

interface AuditEntry {
  id: string;
  action: string;
  actor?: {
    name: string;
    email: string;
  };
  diff?: any;
  createdAt: string;
}

export default function MaintenanceSettingsPage() {
  const {
    refreshMaintenance,
    isSimulatingUserView,
    setIsSimulatingUserView,
    simulationRole,
    setSimulationRole,
  } = useMaintenance();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  // Form State
  const [isEnabled, setIsEnabled] = useState(false);
  const [title, setTitle] = useState('System Under Scheduled Maintenance');
  const [message, setMessage] = useState(
    'We are performing essential system updates and infrastructure maintenance to provide you with faster, more reliable courier logistics.'
  );
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [targetScope, setTargetScope] = useState<'ALL' | 'CUSTOM'>('CUSTOM');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['merchant', 'rider', 'public']);
  const [selectedPages, setSelectedPages] = useState<string[]>([
    '/',
    '/track',
    '/dashboard',
    '/dashboard/shipments',
    '/dashboard/pickups',
    '/rider',
  ]);
  const [customPathInput, setCustomPathInput] = useState('');
  const [customPaths, setCustomPaths] = useState<string[]>([]);
  const [bypassSecret, setBypassSecret] = useState('shohnaat_maint_2026');
  const [allowedIpsText, setAllowedIpsText] = useState('');
  const [phone, setPhone] = useState('+880 1700-000000');
  const [email, setEmail] = useState('support@shohnaat.com');
  const [readOnlyMode, setReadOnlyMode] = useState(false);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, auditRes] = await Promise.all([
        apiGet<MaintenanceSettings>('/api/v1/settings/maintenance/admin'),
        apiGet<AuditEntry[]>('/api/v1/settings/maintenance/audit'),
      ]);

      if (settingsRes.success && settingsRes.data) {
        const d = settingsRes.data;
        setIsEnabled(Boolean(d.isEnabled || d.rawEnabled));
        setTitle(d.title || 'System Under Scheduled Maintenance');
        setMessage(d.message || '');
        setStartAt(d.startAt ? new Date(d.startAt).toISOString().slice(0, 16) : '');
        setEndAt(d.endAt ? new Date(d.endAt).toISOString().slice(0, 16) : '');
        setTargetScope(d.targetScope || 'CUSTOM');
        setSelectedRoles(d.targetRoles || ['merchant', 'rider', 'public']);

        const presetMatched = (d.targetPages || []).filter((p) =>
          PRESET_PAGES.some((pp) => pp.path === p)
        );
        const customMatched = (d.targetPages || []).filter(
          (p) => !PRESET_PAGES.some((pp) => pp.path === p)
        );
        setSelectedPages(presetMatched);
        setCustomPaths(customMatched);

        setBypassSecret(d.bypassSecret || 'shohnaat_maint_2026');
        setAllowedIpsText((d.allowedIps || []).join(', '));
        if (d.supportContact) {
          setPhone(d.supportContact.phone || '+880 1700-000000');
          setEmail(d.supportContact.email || 'support@shohnaat.com');
        }
        setReadOnlyMode(Boolean(d.readOnlyMode));
      }

      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data);
      }
    } catch {
      showToast('error', 'Failed to load maintenance configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAllRoles = () => {
    setSelectedRoles(ROLE_OPTIONS.map((r) => r.id));
  };

  const handleClearAllRoles = () => {
    setSelectedRoles([]);
  };

  const handleTogglePage = (pagePath: string) => {
    setSelectedPages((prev) =>
      prev.includes(pagePath) ? prev.filter((p) => p !== pagePath) : [...prev, pagePath]
    );
  };

  const handleAddCustomPath = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPathInput.trim()) return;
    let path = customPathInput.trim();
    if (!path.startsWith('/')) path = '/' + path;

    if (!customPaths.includes(path) && !selectedPages.includes(path)) {
      setCustomPaths((prev) => [...prev, path]);
    }
    setCustomPathInput('');
  };

  const handleRemoveCustomPath = (path: string) => {
    setCustomPaths((prev) => prev.filter((p) => p !== path));
  };

  const handleGenerateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = 'maint_';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setBypassSecret(res);
    showToast('info', 'New bypass secret key generated.');
  };

  const handleCopyBypassUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://shohnaat.com';
    const url = `${origin}/?maint_bypass=${bypassSecret}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Bypass URL copied to clipboard!');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const allTargetPages = Array.from(new Set([...selectedPages, ...customPaths]));
      const allowedIps = allowedIpsText
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean);

      const payload = {
        isEnabled,
        title,
        message,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: endAt ? new Date(endAt).toISOString() : null,
        targetScope,
        targetRoles: selectedRoles,
        targetPages: allTargetPages,
        allowedIps,
        bypassSecret,
        supportContact: { phone, email },
        readOnlyMode,
      };

      const res = await apiPatch<MaintenanceSettings>('/api/v1/settings/maintenance', payload);
      if (res.success) {
        showToast(
          'success',
          `Site Maintenance Mode ${isEnabled ? 'ENABLED' : 'DISABLED'} successfully.`
        );
        setShowConfirmModal(false);

        // Cross-tab immediate synchronization
        try {
          const channel = new BroadcastChannel('shohnaat_maintenance_channel');
          channel.postMessage({ type: 'MAINTENANCE_TOGGLED', isEnabled });
          channel.close();
          localStorage.setItem('shohnaat_maint_broadcast', String(Date.now()));
        } catch {
          // ignore
        }

        await refreshMaintenance();
        fetchSettings();
      } else {
        showToast('error', res.message || 'Failed to update maintenance settings.');
      }
    } catch {
      showToast('error', 'Network error while updating maintenance settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="Site Maintenance & Access Lockdown"
      subtitle="Configure platform maintenance mode, target user groups, offline modules, schedules, and bypass rules."
    >
      {/* ── Top Status Card & Master Switch ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Status Block */}
        <div
          className={`lg:col-span-2 rounded-2xl p-6 sm:p-8 border transition-all relative overflow-hidden shadow-sm ${
            isEnabled
              ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 text-amber-100 shadow-amber-500/5'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  isEnabled
                    ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                    : 'bg-emerald-600 text-white shadow-emerald-600/20'
                }`}
              >
                {isEnabled ? (
                  <Wrench className="w-7 h-7 stroke-[2.2] animate-pulse" />
                ) : (
                  <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {isEnabled ? 'Maintenance Mode is LIVE' : 'Platform is FULLY OPERATIONAL'}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      isEnabled
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEnabled ? 'bg-amber-400 animate-ping' : 'bg-emerald-600'
                      }`}
                    />
                    {isEnabled ? 'Active Lockdown' : 'All Online'}
                  </span>
                </div>

                <p
                  className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                    isEnabled ? 'text-amber-200/80' : 'text-slate-500'
                  }`}
                >
                  {isEnabled
                    ? `Site traffic for ${
                        selectedRoles.length > 0 ? selectedRoles.join(', ') : 'all non-admin users'
                      } is currently being redirected to the scheduled maintenance notice.`
                    : 'All customer, merchant, and rider portals are actively accepting traffic and live orders.'}
                </p>
              </div>
            </div>

            {/* Glowing Master Toggle */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (!isEnabled) {
                    setShowConfirmModal(true);
                  } else {
                    setIsEnabled(false);
                  }
                }}
                className={`relative inline-flex h-11 w-24 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isEnabled ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                    isEnabled ? 'translate-x-13 text-amber-600' : 'translate-x-0 text-slate-400'
                  }`}
                >
                  <Power className="w-5 h-5 stroke-[2.5]" />
                </span>
              </button>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isEnabled ? 'Click to Turn OFF' : 'Click to Turn ON'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats / Info Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Lockdown Scope Summary
              </span>
              <Badge variant={targetScope === 'ALL' ? 'red' : 'amber'} size="sm">
                {targetScope === 'ALL' ? 'Full Lockdown' : 'Custom Scope'}
              </Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Targeted User Groups:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {selectedRoles.length} of {ROLE_OPTIONS.length} Selected
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Targeted Pages:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {targetScope === 'ALL'
                    ? 'All Pages (Entire Site)'
                    : `${selectedPages.length + customPaths.length} Modules Blocked`}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 text-xs">Super Admin Status:</span>
                <span className="font-bold text-emerald-600 text-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Exempt
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Modal Preview</span>
              </button>

              <button
                onClick={() => setIsSimulatingUserView(!isSimulatingUserView)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSimulatingUserView
                    ? 'bg-red-600 text-white shadow-sm shadow-red-500/30 animate-pulse'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-500/30'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isSimulatingUserView ? 'Exit Simulation' : 'Live Simulation'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Settings Configuration Sections ── */}
      <div className="space-y-8">
        {/* ── SECTION 1: Target Audience ("Kader jonno") ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Target Audience & User Roles
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-10">
                Select which user roles and visitor categories will be blocked when maintenance mode is active.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllRoles}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAllRoles}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              const Icon = role.icon;

              return (
                <div
                  key={role.id}
                  onClick={() => handleToggleRole(role.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 stroke-[2]" />
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                      />
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mb-1">{role.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{role.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      Status:
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    >
                      {isSelected ? '🔒 Blocked' : '🔓 Allowed'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Super Admin Notice Pill */}
          <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Note:</strong> Super Administrators are permanently whitelisted and will never be locked out of the administration portal.
            </span>
          </div>
        </div>

        {/* ── SECTION 2: Target Pages & Modules ("Kon kon page offline") ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Target Pages & Functional Modules
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1 ml-10">
                Choose between locking down the entire website or selecting specific functional modules and custom URL routes.
              </p>
            </div>

            {/* Scope Mode Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTargetScope('CUSTOM')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  targetScope === 'CUSTOM'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Granular Modules
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  targetScope === 'ALL'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Entire Platform (All Routes)
              </button>
            </div>
          </div>

          {targetScope === 'ALL' ? (
            <div className="p-8 rounded-2xl bg-red-50/70 border border-red-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-red-500/20">
                <Lock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h4 className="text-base font-bold text-red-950 mb-1">
                Full Platform Lockdown Active
              </h4>
              <p className="text-xs text-red-700 max-w-md mx-auto leading-relaxed">
                All pages, landing screens, merchant apps, and rider portals will display the Maintenance Notice for target roles. Only authenticated Super Admins can access administrative tools.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pre-configured Module Checkboxes */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                  Select System Portals & Routes
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PRESET_PAGES.map((page) => {
                    const isChecked = selectedPages.includes(page.path);
                    return (
                      <div
                        key={page.id}
                        onClick={() => handleTogglePage(page.path)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked
                            ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {page.name}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600 ml-1 shrink-0">
                              {page.path}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {page.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Path Adder */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Add Custom Route or Path Pattern
                </span>
                <form
                  onSubmit={handleAddCustomPath}
                  className="flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={customPathInput}
                      onChange={(e) => setCustomPathInput(e.target.value)}
                      placeholder="e.g. /dashboard/developer, /rates, or /api/v1/shipments/*"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="w-full sm:w-auto font-semibold"
                  >
                    Add Route
                  </Button>
                </form>

                {/* Custom paths list */}
                {customPaths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {customPaths.map((path) => (
                      <span
                        key={path}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-slate-100 text-xs font-mono"
                      >
                        <span>{path}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomPath(path)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 3: Schedule & Countdown Timer ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Maintenance Schedule & Countdown Timer
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Optionally schedule when maintenance should automatically start and display an expected completion countdown timer to users.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">
                Quick Duration Presets:
              </span>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const target = new Date(now.getTime() + 1 * 60 * 60 * 1000);
                  setStartAt(now.toISOString().slice(0, 16));
                  setEndAt(target.toISOString().slice(0, 16));
                  showToast('info', 'Schedule set for 1 hour duration.');
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
              >
                +1 Hour
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const target = new Date(now.getTime() + 2 * 60 * 60 * 1000);
                  setStartAt(now.toISOString().slice(0, 16));
                  setEndAt(target.toISOString().slice(0, 16));
                  showToast('info', 'Schedule set for 2 hours duration.');
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const target = new Date(now.getTime() + 4 * 60 * 60 * 1000);
                  setStartAt(now.toISOString().slice(0, 16));
                  setEndAt(target.toISOString().slice(0, 16));
                  showToast('info', 'Schedule set for 4 hours duration.');
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
              >
                +4 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartAt('');
                  setEndAt('');
                  showToast('info', 'Schedule cleared (immediate mode).');
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Clear Dates
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Start Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave empty to activate immediately when turned on.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Estimated End Time (Restoration Countdown)
                </label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-sans"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Renders a dynamic Days:Hours:Mins live countdown timer on the maintenance page.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Customer Notice & Support Branding ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Notice Banner & Support Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the headline, explanation text, and urgent support contacts presented to affected customers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled System Maintenance"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Announcement Message / Reason
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the maintenance reason clearly..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm leading-relaxed focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Emergency Support Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Support Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@shohnaat.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 5: Emergency Bypass & Security ── */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Emergency Access & Secret Bypass
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate secret bypass keys for QA testing and whitelist authorized office IP addresses.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Secret Bypass Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bypassSecret}
                  onChange={(e) => setBypassSecret(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  className="px-3 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={handleCopyBypassUrl}
                  className="px-3 py-2.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy URL</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 mt-1.5 block leading-relaxed">
                Anyone visiting with <code>?maint_bypass={bypassSecret}</code> can bypass maintenance.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Whitelisted IP Addresses (Comma separated)
              </label>
              <input
                type="text"
                value={allowedIpsText}
                onChange={(e) => setAllowedIpsText(e.target.value)}
                placeholder="103.145.2.1, 127.0.0.1"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Requests from these IPs bypass maintenance automatically.
              </span>
            </div>
          </div>
        </div>

        {/* ── SECTION 6: Audit History Trail ── */}
        {auditLogs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900">Recent Maintenance Activity Log</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.diff?.isEnabled ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                    />
                    <div>
                      <span className="font-bold text-slate-800">
                        {log.diff?.isEnabled ? 'Enabled Maintenance Mode' : 'Disabled Maintenance Mode'}
                      </span>
                      <span className="text-slate-400 ml-2">by {log.actor?.name || 'Super Admin'}</span>
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="sticky bottom-0 z-30 mt-10 -mx-6 sm:-mx-8 lg:-mx-10 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-lg flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Click save to immediately synchronize changes across API & UI guards.</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={fetchSettings}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4 stroke-[2.5]" />}
            className="shadow-md shadow-blue-600/20 font-bold"
          >
            Save & Apply Changes
          </Button>
        </div>
      </div>

      {/* ── Confirmation Modal on Enabling ── */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Maintenance Mode Activation"
        >
          <div className="space-y-4 text-slate-700">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm block">Are you sure you want to proceed?</span>
                <p className="leading-relaxed">
                  Activating maintenance mode will immediately lock out selected roles (
                  <strong>{selectedRoles.join(', ')}</strong>) from accessing offline routes. Super Admins will retain access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 font-bold"
                onClick={() => {
                  setIsEnabled(true);
                  setShowConfirmModal(false);
                  handleSave();
                }}
              >
                Yes, Enable Maintenance Mode
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Live Preview Modal ── */}
      {showPreviewModal && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Customer Maintenance Screen Preview"
          size="lg"
        >
          <div className="bg-[#090D16] text-white p-6 sm:p-8 rounded-2xl text-center relative overflow-hidden border border-slate-800">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Scheduled Infrastructure Maintenance</span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mb-6">
              <span>Hotline: {phone}</span>
              <span>•</span>
              <span>Email: {email}</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              ⚡ This is a real-time preview of how customers and merchants will see the offline maintenance screen.
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
