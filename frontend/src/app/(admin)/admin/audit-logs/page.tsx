'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Filter, User, Package, CreditCard, Settings, AlertTriangle, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, DataTable, Column, Tabs, Button, Badge } from '@/components/ui';
import { apiGet, showToast } from '@/lib/api';

interface AuditLog {
  id: string; actor: string; action: string; entityType: string; entityId: string;
  ip: string; timestamp: string; diff?: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  SHIPMENT_CREATED: <Package className="w-3.5 h-3.5" />,
  STATUS_DELIVERED: <Package className="w-3.5 h-3.5" />,
  SHIPMENT_BULK_CREATED: <Package className="w-3.5 h-3.5" />,
  KYC_APPROVED: <User className="w-3.5 h-3.5" />,
  DELIVERY_FAILED: <AlertTriangle className="w-3.5 h-3.5" />,
  HUB_CREATED: <Settings className="w-3.5 h-3.5" />,
  SETTLEMENT_PROCESSED: <CreditCard className="w-3.5 h-3.5" />,
  RATE_CARD_UPDATED: <CreditCard className="w-3.5 h-3.5" />,
};

const ACTION_COLORS: Record<string, string> = {
  SHIPMENT_CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
  STATUS_DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SHIPMENT_BULK_CREATED: 'bg-blue-50 text-blue-700 border-blue-200',
  KYC_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DELIVERY_FAILED: 'bg-red-50 text-red-700 border-red-200',
  HUB_CREATED: 'bg-purple-50 text-purple-700 border-purple-200',
  SETTLEMENT_PROCESSED: 'bg-amber-50 text-amber-700 border-amber-200',
  RATE_CARD_UPDATED: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/audit-logs');
      if (res.success && res.data) {
        setLogs(res.data.map((l: any) => ({
          id: l.id, actor: l.actorName || l.actor || 'System', action: l.action || 'UNKNOWN',
          entityType: l.entityType || '', entityId: l.entityId || '',
          ip: l.ip || '—', timestamp: new Date(l.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          diff: l.diff ? (typeof l.diff === 'string' ? l.diff : JSON.stringify(l.diff)) : undefined,
        })));
      }
    } catch { showToast('error', 'Failed to load audit logs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const tabs = [
    { key: 'all', label: 'All Events' },
    { key: 'shipment', label: 'Shipments' },
    { key: 'user', label: 'Users & KYC' },
    { key: 'system', label: 'System' },
  ];

  const filtered = logs.filter((log) => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'shipment' && log.entityType === 'Shipment') ||
      (activeTab === 'user' && (log.entityType === 'Merchant' || log.actor.includes('Rider'))) ||
      (activeTab === 'system' && ['Branch', 'RateCard', 'Settlement'].includes(log.entityType));
    return matchesTab;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'action', header: 'Event', sortable: true, accessor: (r) => r.action,
      render: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border ${ACTION_COLORS[row.action] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
          {ACTION_ICONS[row.action] || <Settings className="w-3.5 h-3.5" />}
          {row.action.replace(/_/g, ' ')}
        </span>
      ),
    },
    { key: 'actor', header: 'Actor', sortable: true, accessor: (r) => r.actor, render: (row) => <span className="text-slate-700 font-medium">{row.actor}</span> },
    {
      key: 'entityId', header: 'Entity',
      render: (row) => (<div><div className="font-mono text-[11px] text-primary font-semibold">{row.entityId}</div><div className="text-[10px] text-slate-400">{row.entityType}</div></div>),
    },
    { key: 'diff', header: 'Details', render: (row) => row.diff ? <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{row.diff}</span> : <span className="text-slate-300">—</span> },
    { key: 'ip', header: 'IP', render: (row) => <span className="text-[11px] font-mono text-slate-400">{row.ip}</span> },
    { key: 'timestamp', header: 'Time', sortable: true, accessor: (r) => r.timestamp, render: (row) => <span className="text-[11px] text-slate-500">{row.timestamp}</span> },
  ];

  return (
    <DashboardLayout role="admin" title="System Audit Logs" subtitle="Complete event history of all administrative actions and system changes">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search by actor, action, or entity..." pageSize={15} emptyMessage="No audit logs found."
          headerRight={<Badge variant="blue" size="sm">{filtered.length} events</Badge>} />
      )}
    </DashboardLayout>
  );
}
