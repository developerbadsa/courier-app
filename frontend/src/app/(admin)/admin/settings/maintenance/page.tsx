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
  ShieldCheck,
  KeyRound,
  Copy,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  Phone,
  Mail,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  EyeOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { apiGet, apiPatch, showToast } from '@/lib/api';
import { useMaintenance, MaintenanceSettings } from '@/contexts/MaintenanceContext';

interface TargetRoleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

interface TargetPageOption {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
}

const ROLE_OPTIONS: TargetRoleOption[] = [
  {
    id: 'public',
    name: 'Public & Visitors',
    description: 'Landing page and tracking visitors',
    icon: Globe,
  },
  {
    id: 'merchant',
    name: 'Merchants',
    description: 'Merchant dashboard, bookings, invoices',
    icon: Building2,
  },
  {
    id: 'rider',
    name: 'Delivery Riders',
    description: 'Rider tasks and delivery runsheets',
    icon: Truck,
  },
  {
    id: 'operator',
    name: 'Hub Staff',
    description: 'Branch hub barcode scanning',
    icon: Package,
  },
];

const PRESET_PAGES: TargetPageOption[] = [
  { id: 'landing', name: 'Home Landing Page', path: '/', icon: Globe },
  { id: 'tracking', name: 'Public Tracking', path: '/track', icon: Globe },
  { id: 'register', name: 'Merchant Signup', path: '/register', icon: Building2 },
  { id: 'merchant_dashboard', name: 'Merchant Dashboard', path: '/dashboard', icon: Building2 },
  { id: 'merchant_shipments', name: 'Parcel Booking', path: '/dashboard/shipments', icon: Package },
  { id: 'merchant_pickups', name: 'Pickup Requests', path: '/dashboard/pickups', icon: Truck },
  { id: 'merchant_finance', name: 'Finance & Invoices', path: '/dashboard/finance', icon: Building2 },
  { id: 'rider_portal', name: 'Rider Portal', path: '/rider', icon: Truck },
  { id: 'hub_scan', name: 'Hub Barcode Scan', path: '/admin/scan', icon: Package },
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
    'We are currently performing essential platform upgrades to improve service reliability and speed. Services will be restored shortly.'
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
    showToast('info', 'New bypass key generated.');
  };

  const handleCopyBypassUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://shohnaat.com';
    const url = `${origin}/?maint_bypass=${bypassSecret}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Bypass URL copied to clipboard!');
  };

  const handleSave = async (overrideEnabled?: boolean) => {
    setIsSaving(true);
    const targetEnabled = typeof overrideEnabled === 'boolean' ? overrideEnabled : isEnabled;
    setIsEnabled(targetEnabled);

    try {
      const allTargetPages = Array.from(new Set([...selectedPages, ...customPaths]));
      const allowedIps = allowedIpsText
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean);

      const payload = {
        isEnabled: targetEnabled,
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
          `Maintenance mode ${targetEnabled ? 'ENABLED' : 'DISABLED'} successfully.`
        );
        setShowConfirmModal(false);

        // Cross-tab immediate notification
        try {
          const channel = new BroadcastChannel('shohnaat_maintenance_channel');
          channel.postMessage({ type: 'MAINTENANCE_TOGGLED', isEnabled: targetEnabled });
          channel.close();
          localStorage.setItem('shohnaat_maint_broadcast', String(Date.now()));
        } catch {}

        await refreshMaintenance();
        fetchSettings();
      } else {
        showToast('error', res.message || 'Failed to update settings.');
      }
    } catch {
      showToast('error', 'Network error while updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      role="admin"
      title="Maintenance & System Lockdown"
      subtitle="Manage scheduled platform maintenance, user role restrictions, offline routes, and bypass access."
    >
      {/* ── Top Master Switch Card ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
                isEnabled ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Wrench className="w-5 h-5 stroke-[2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-bold text-slate-900">
                  Platform Status: {isEnabled ? 'Maintenance Mode Active' : 'Operational'}
                </h2>
                <Badge variant={isEnabled ? 'amber' : 'green'} size="sm">
                  {isEnabled ? 'Lockdown Live' : 'All Online'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                {isEnabled
                  ? `Restricting traffic for ${
                      selectedRoles.length > 0 ? selectedRoles.join(', ') : 'all non-admin users'
                    } across selected modules.`
                  : 'All customer and merchant portals are actively accepting traffic.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSimulatingUserView(!isSimulatingUserView)}
              leftIcon={isSimulatingUserView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            >
              {isSimulatingUserView ? 'Exit Simulation' : 'Simulate Visitor View'}
            </Button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (!isEnabled) {
                  setShowConfirmModal(true);
                } else {
                  handleSave(false);
                }
              }}
              className={`relative inline-flex h-9 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                isEnabled ? 'bg-amber-500' : 'bg-slate-300'
              } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-sm transition duration-200 flex items-center justify-center ${
                  isEnabled ? 'translate-x-11 text-amber-600' : 'translate-x-0 text-slate-400'
                }`}
              >
                {isSaving ? (
                  <RotateCcw className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Power className="w-4 h-4 stroke-[2]" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Section 1: Target Audience Roles ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Target User Roles</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select which groups will be restricted during maintenance.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoles(ROLE_OPTIONS.map((r) => r.id))}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setSelectedRoles([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLE_OPTIONS.map((role) => {
              const isSelected = selectedRoles.includes(role.id);
              const Icon = role.icon;

              return (
                <div
                  key={role.id}
                  onClick={() => handleToggleRole(role.id)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>

                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{role.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 2: Protected Routes & Scope ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Protected Routes & Modules</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select modules to lock down or restrict all routes.</p>
            </div>

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTargetScope('CUSTOM')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  targetScope === 'CUSTOM' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Selected Routes
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('ALL')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  targetScope === 'ALL' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                All Routes
              </button>
            </div>
          </div>

          {targetScope === 'ALL' ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-center">
              <p className="text-xs text-red-800 font-semibold">
                Entire platform is set to offline. All visitor, merchant, and rider routes will be redirected to the maintenance notice.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {PRESET_PAGES.map((page) => {
                  const isChecked = selectedPages.includes(page.path);
                  const Icon = page.icon;

                  return (
                    <div
                      key={page.id}
                      onClick={() => handleTogglePage(page.path)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between select-none ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 stroke-[2]" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-xs text-slate-900 block truncate">{page.name}</span>
                          <span className="text-[10px] font-mono text-slate-500 block truncate">{page.path}</span>
                        </div>
                      </div>

                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ml-2 transition-colors ${
                          isChecked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Path Adder */}
              <div className="pt-3 border-t border-slate-100">
                <form onSubmit={handleAddCustomPath} className="flex gap-2">
                  <input
                    type="text"
                    value={customPathInput}
                    onChange={(e) => setCustomPathInput(e.target.value)}
                    placeholder="Add custom route (e.g. /dashboard/rates or /api/v1/shipments/*)"
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                  />
                  <Button type="submit" variant="secondary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add Path
                  </Button>
                </form>

                {customPaths.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {customPaths.map((path) => (
                      <span
                        key={path}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-mono"
                      >
                        <span>{path}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomPath(path)}
                          className="text-slate-400 hover:text-red-500"
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

        {/* ── Section 3: Schedule & Duration ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule & Countdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">Optionally schedule start time and expected completion.</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const target = new Date(now.getTime() + 1 * 60 * 60 * 1000);
                  setStartAt(now.toISOString().slice(0, 16));
                  setEndAt(target.toISOString().slice(0, 16));
                  showToast('info', 'Schedule set for 1 hour duration.');
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +1h
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
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +2h
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
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                +4h
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartAt('');
                  setEndAt('');
                  showToast('info', 'Schedule cleared.');
                }}
                className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated End Time (Countdown Target)
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* ── Section 4: Notice Details & Contacts ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Notice Announcement & Support</h3>
            <p className="text-xs text-slate-500 mt-0.5">Customize the notice shown to affected visitors.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Headline Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. System Under Scheduled Maintenance"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notice Message</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the maintenance reason..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Helpline Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Support Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 5: Bypass Key & Whitelisted IPs ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Bypass Access & Whitelist</h3>
            <p className="text-xs text-slate-500 mt-0.5">Emergency access key and authorized office IP addresses.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bypass Secret Key</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={bypassSecret}
                  onChange={(e) => setBypassSecret(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleGenerateSecret}
                  className="px-2.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={handleCopyBypassUrl}
                  className="px-2.5 py-2 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Whitelisted IPs (Comma-separated)</label>
              <input
                type="text"
                value={allowedIpsText}
                onChange={(e) => setAllowedIpsText(e.target.value)}
                placeholder="103.145.2.1, 127.0.0.1"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* ── Section 6: Audit History ── */}
        {auditLogs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Recent Activity Log</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.diff?.isEnabled ? 'bg-amber-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-semibold text-slate-800">
                      {log.diff?.isEnabled ? 'Enabled Maintenance Mode' : 'Disabled Maintenance Mode'}
                    </span>
                    <span className="text-slate-400">by {log.actor?.name || 'Super Admin'}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Sticky Save Bar ── */}
      <div className="sticky bottom-0 z-20 mt-8 -mx-4 sm:-mx-6 lg:-mx-8 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">Changes apply immediately across all apps and live routes.</span>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={fetchSettings} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave()}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5 stroke-[2]" />}
          >
            Save & Apply Changes
          </Button>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Maintenance Activation"
        >
          <div className="space-y-4 text-slate-700">
            <p className="text-xs text-slate-600 leading-relaxed">
              Activating maintenance mode will immediately lock out selected roles (
              <strong>{selectedRoles.join(', ')}</strong>) from accessing offline routes. Super Admins will retain access.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSaving}
                className="bg-amber-600 hover:bg-amber-700 font-bold"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSave(true);
                }}
              >
                Yes, Enable
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
