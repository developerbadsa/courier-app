'use client';

import React, { useState } from 'react';
import { Shield, Filter, User, Package, CreditCard, Settings, AlertTriangle, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, DataTable, Column, Tabs, Input, Button, Badge } from '@/components/ui';

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  ip: string;
  timestamp: string;
  diff?: string;
}

const MOCK_LOGS: AuditLog[] = [
  { id: '1', actor: 'Superadmin', action: 'SHIPMENT_CREATED', entityType: 'Shipment', entityId: 'SH-ABC123', ip: '192.168.1.10', timestamp: '2 min ago', diff: 'COD: $64.50' },
  { id: '2', actor: 'David Miller (Rider)', action: 'STATUS_DELIVERED', entityType: 'Shipment', entityId: 'SH-XYZ789', ip: '10.0.0.5', timestamp: '15 min ago', diff: 'from: OUT_FOR_DELIVERY → DELIVERED' },
  { id: '3', actor: 'Sarah Johnson (Merchant)', action: 'SHIPMENT_BULK_CREATED', entityType: 'Shipment', entityId: 'bulk', ip: '172.16.0.1', timestamp: '1h ago', diff: 'Created: 25 shipments' },
  { id: '4', actor: 'Superadmin', action: 'KYC_APPROVED', entityType: 'Merchant', entityId: 'MC-101', ip: '192.168.1.10', timestamp: '2h ago' },
  { id: '5', actor: 'James Wilson (Rider)', action: 'DELIVERY_FAILED', entityType: 'Shipment', entityId: 'SH-DEF456', ip: '10.0.0.8', timestamp: '3h ago', diff: 'Reason: CONSIGNEE_UNREACHABLE' },
  { id: '6', actor: 'Superadmin', action: 'HUB_CREATED', entityType: 'Branch', entityId: 'BR-005', ip: '192.168.1.10', timestamp: '5h ago', diff: 'New hub: Seattle Distribution' },
  { id: '7', actor: 'System', action: 'SETTLEMENT_PROCESSED', entityType: 'Settlement', entityId: 'STL-042', ip: 'internal', timestamp: 'Yesterday', diff: '$12,198.00 paid to Merchant MC-101' },
  { id: '8', actor: 'Superadmin', action: 'RATE_CARD_UPDATED', entityType: 'RateCard', entityId: 'RC-STD', ip: '192.168.1.10', timestamp: 'Yesterday', diff: 'Base charge: $5.00 → $6.50' },
];

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
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const tabs = [
    { key: 'all', label: 'All Events' },
    { key: 'shipment', label: 'Shipments' },
    { key: 'user', label: 'Users & KYC' },
    { key: 'system', label: 'System' },
  ];

  const filtered = MOCK_LOGS.filter((log) => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'shipment' && log.entityType === 'Shipment') ||
      (activeTab === 'user' && (log.entityType === 'Merchant' || log.actor.includes('Rider'))) ||
      (activeTab === 'system' && ['Branch', 'RateCard', 'Settlement'].includes(log.entityType));
    const matchesSearch = !search || log.actor.toLowerCase().includes(search.toLowerCase()) || log.action.toLowerCase().includes(search.toLowerCase()) || log.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'action', header: 'Event', sortable: true, accessor: (r) => r.action,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-semibold border ${ACTION_COLORS[row.action] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            {ACTION_ICONS[row.action] || <Settings className="w-3.5 h-3.5" />}
            {row.action.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'actor', header: 'Actor', sortable: true, accessor: (r) => r.actor,
      render: (row) => <span className="text-slate-700 font-medium">{row.actor}</span>,
    },
    {
      key: 'entityId', header: 'Entity',
      render: (row) => (
        <div>
          <div className="font-mono text-[11px] text-blue-600 font-semibold">{row.entityId}</div>
          <div className="text-[10px] text-slate-400">{row.entityType}</div>
        </div>
      ),
    },
    {
      key: 'diff', header: 'Details',
      render: (row) => row.diff ? <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{row.diff}</span> : <span className="text-slate-300">—</span>,
    },
    {
      key: 'ip', header: 'IP', render: (row) => <span className="text-[11px] font-mono text-slate-400">{row.ip}</span>,
    },
    {
      key: 'timestamp', header: 'Time', sortable: true, accessor: (r) => r.timestamp, render: (row) => <span className="text-[11px] text-slate-500">{row.timestamp}</span>,
    },
  ];

  return (
    <DashboardLayout role="admin" title="System Audit Logs" subtitle="Complete event history of all administrative actions and system changes">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable
        searchPlaceholder="Search by actor, action, or entity..."
        pageSize={15}
        emptyMessage="No audit logs match your filters."
        headerRight={
          <div className="flex items-center gap-2">
            <Badge variant="blue" size="sm">{filtered.length} events</Badge>
            <Button variant="outline" size="sm" leftIcon={<Filter className="w-3 h-3" />}>Export CSV</Button>
          </div>
        }
      />
    </DashboardLayout>
  );
}
