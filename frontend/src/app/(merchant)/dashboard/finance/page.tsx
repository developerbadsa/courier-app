'use client';

import React, { useState } from 'react';
import {
  DollarSign, Download, CreditCard, ArrowUpRight, ArrowDownRight,
  Wallet, TrendingUp, FileText, CheckCircle, Clock, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card, DataTable, Column, Badge, Tabs, EmptyState } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  direction: string;
  note: string;
  trackingNumber?: string;
  createdAt: string;
}

interface Settlement {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  status: string;
  entryCount: number;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                           */
/* ------------------------------------------------------------------ */
const MOCK_WALLET = {
  balance: 8420.00,
  collected: 24580.00,
  fees: 1642.00,
  pendingPayout: 12198.00,
  totalPaid: 3778.00,
};

const MOCK_ENTRIES: LedgerEntry[] = [
  { id: '1', type: 'COD_COLLECTED', amount: 64.50, direction: 'CREDIT', note: 'COD collected — Alexander Wright', trackingNumber: 'SHN-90214-US', createdAt: 'Today 2:15 PM' },
  { id: '2', type: 'DELIVERY_CHARGE', amount: 5.00, direction: 'DEBIT', note: 'Shipping fee deducted', trackingNumber: 'SHN-90214-US', createdAt: 'Today 2:15 PM' },
  { id: '3', type: 'COD_COLLECTED', amount: 120.00, direction: 'CREDIT', note: 'COD collected — Sophia Martinez', trackingNumber: 'SHN-90215-US', createdAt: 'Today 1:30 PM' },
  { id: '4', type: 'DELIVERY_CHARGE', amount: 7.50, direction: 'DEBIT', note: 'Shipping fee deducted', trackingNumber: 'SHN-90215-US', createdAt: 'Today 1:30 PM' },
  { id: '5', type: 'SETTLEMENT_PAYOUT', amount: 12198.00, direction: 'DEBIT', note: 'Weekly settlement payout', createdAt: 'Yesterday' },
  { id: '6', type: 'COD_COLLECTED', amount: 215.00, direction: 'CREDIT', note: 'COD collected — Liam Davis', trackingNumber: 'SHN-90208-US', createdAt: 'Yesterday 4:00 PM' },
  { id: '7', type: 'COD_COLLECTED', amount: 89.90, direction: 'CREDIT', note: 'COD collected — Emily Thornton', trackingNumber: 'SHN-90201-US', createdAt: 'Aug 18' },
];

const MOCK_SETTLEMENTS: Settlement[] = [
  { id: 'STL-042', periodStart: 'Aug 12, 2026', periodEnd: 'Aug 18, 2026', totalAmount: 12198.00, status: 'PAID', entryCount: 186, createdAt: 'Aug 19, 2026' },
  { id: 'STL-041', periodStart: 'Aug 5, 2026', periodEnd: 'Aug 11, 2026', totalAmount: 9840.00, status: 'PAID', entryCount: 152, createdAt: 'Aug 12, 2026' },
  { id: 'STL-040', periodStart: 'Jul 29, 2026', periodEnd: 'Aug 4, 2026', totalAmount: 11250.00, status: 'PAID', entryCount: 178, createdAt: 'Aug 5, 2026' },
  { id: 'STL-043', periodStart: 'Aug 19, 2026', periodEnd: 'Aug 25, 2026', totalAmount: 0, status: 'PENDING', entryCount: 24, createdAt: 'In Progress' },
];

/* ------------------------------------------------------------------ */
/*  Entry Type Config                                                   */
/* ------------------------------------------------------------------ */
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COD_COLLECTED: { label: 'COD Collected', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  DELIVERY_CHARGE: { label: 'Shipping Fee', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  SETTLEMENT_PAYOUT: { label: 'Payout', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  PAYABLE_TO_MERCHANT: { label: 'Payable', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  REFUND: { label: 'Refund', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const entryColumns: Column<LedgerEntry>[] = [
    {
      key: 'type', header: 'Type', sortable: true, accessor: (r) => r.type,
      render: (row) => {
        const cfg = TYPE_CONFIG[row.type] || { label: row.type, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: 'direction', header: 'Direction',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.direction === 'CREDIT' ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
          )}
          <span className={`text-xs font-semibold ${row.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
            {row.direction}
          </span>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount (USD)', sortable: true, accessor: (r) => r.amount,
      render: (row) => (
        <span className={`font-mono font-bold ${row.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>
          {row.direction === 'CREDIT' ? '+' : '-'}${row.amount.toFixed(2)}
        </span>
      ),
    },
    { key: 'note', header: 'Description', render: (row) => <span className="text-slate-600 text-[11px]">{row.note}</span> },
    {
      key: 'trackingNumber', header: 'Shipment',
      render: (row) => row.trackingNumber
        ? <span className="font-mono text-[11px] text-blue-600 font-semibold">{row.trackingNumber}</span>
        : <span className="text-slate-300">—</span>,
    },
    { key: 'createdAt', header: 'Time', sortable: true, accessor: (r) => r.createdAt, render: (row) => <span className="text-[11px] text-slate-500">{row.createdAt}</span> },
  ];

  const settlementColumns: Column<Settlement>[] = [
    { key: 'id', header: 'Settlement ID', render: (row) => <span className="font-mono text-xs font-semibold text-blue-600">{row.id}</span> },
    { key: 'period', header: 'Period', render: (row) => <span className="text-xs text-slate-600">{row.periodStart} — {row.periodEnd}</span> },
    { key: 'entryCount', header: 'Entries', render: (row) => <Badge variant="blue" size="sm">{row.entryCount}</Badge> },
    { key: 'totalAmount', header: 'Amount (USD)', sortable: true, accessor: (r) => r.totalAmount,
      render: (row) => <span className="font-mono font-bold text-slate-900">${row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status === 'PAID' ? 'DELIVERED' : 'PENDING'} size="sm" /> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
          <Download className="w-3 h-3" /> Export
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout role="merchant" title="Financial Overview" subtitle="COD settlements, wallet balance, and transaction history">
      {/* Wallet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available Balance" value={`$${MOCK_WALLET.balance.toLocaleString()}`} icon={Wallet} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" change={{ value: 'Ready for payout', isPositive: true }} />
        <StatCard title="COD Collected" value={`$${MOCK_WALLET.collected.toLocaleString()}`} icon={DollarSign} iconColor="text-blue-600" iconBg="bg-blue-50 border-blue-100" change={{ value: '+$1,240 this week', isPositive: true }} />
        <StatCard title="Shipping Fees" value={`-$${MOCK_WALLET.fees.toLocaleString()}`} icon={CreditCard} iconColor="text-red-600" iconBg="bg-red-50 border-red-100" subtext="Delivery charges" />
        <StatCard title="Total Paid Out" value={`$${MOCK_WALLET.totalPaid.toLocaleString()}`} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50 border-purple-100" subtext="All settlements" />
      </div>

      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <Link href="/dashboard/finance/topup">
            <Button variant="primary" size="sm" leftIcon={<Wallet className="w-3.5 h-3.5" />}>Top Up Wallet</Button>
          </Link>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>Export All</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'overview', label: 'Ledger Entries' },
          { key: 'settlements', label: 'Settlements' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-0"
      />

      {/* Ledger Entries Tab */}
      {activeTab === 'overview' && (
        <DataTable
          data={MOCK_ENTRIES as unknown as Record<string, unknown>[]}
          columns={entryColumns as unknown as Column<Record<string, unknown>>[]}
          searchable
          searchPlaceholder="Search transactions..."
          pageSize={10}
          emptyMessage="No transactions found."
          headerRight={<Badge variant="blue" size="sm">{MOCK_ENTRIES.length} entries</Badge>}
        />
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <DataTable
          data={MOCK_SETTLEMENTS as unknown as Record<string, unknown>[]}
          columns={settlementColumns as unknown as Column<Record<string, unknown>>[]}
          pageSize={10}
          emptyMessage="No settlements found."
          headerRight={<Badge variant="blue" size="sm">{MOCK_SETTLEMENTS.length} settlements</Badge>}
        />
      )}
    </DashboardLayout>
  );
}
