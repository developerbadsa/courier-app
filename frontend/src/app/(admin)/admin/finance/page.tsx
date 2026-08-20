'use client';

import React, { useState } from 'react';
import {
  DollarSign, CheckCircle2, Clock, AlertTriangle, Send, Users,
  TrendingUp, Wallet, ArrowRight, Zap, Shield, Building2, Mail,
  Filter, Download,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card, DataTable, Column, Badge, Tabs, Modal, Avatar } from '@/components/ui';

/* ── Types ── */
interface PayoutRequest {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  method: 'bank_transfer' | 'paypal';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  requestedAt: string;
  processedAt?: string;
}

interface MerchantBalance {
  id: string;
  name: string;
  balance: number;
  collected: number;
  fees: number;
  shipments: number;
}

/* ── Mock Data ── */
const MOCK_PAYOUTS: PayoutRequest[] = [
  { id: 'PAY-001', merchantName: 'Apex Global Imports LLC', merchantId: 'mc-1', amount: 8420.00, method: 'bank_transfer', status: 'PENDING', requestedAt: '2 hours ago' },
  { id: 'PAY-002', merchantName: 'Nordic Gear International', merchantId: 'mc-2', amount: 5640.00, method: 'paypal', status: 'PENDING', requestedAt: '5 hours ago' },
  { id: 'PAY-003', merchantName: 'Volt Electronics Hub', merchantId: 'mc-3', amount: 3200.00, method: 'bank_transfer', status: 'PROCESSING', requestedAt: 'Yesterday', processedAt: 'Today 9:00 AM' },
  { id: 'PAY-004', merchantName: 'Apex Global Imports LLC', merchantId: 'mc-1', amount: 12198.00, method: 'bank_transfer', status: 'PAID', requestedAt: 'Aug 17', processedAt: 'Aug 19' },
  { id: 'PAY-005', merchantName: 'Metro Goods Co.', merchantId: 'mc-4', amount: 9840.00, method: 'paypal', status: 'PAID', requestedAt: 'Aug 12', processedAt: 'Aug 14' },
  { id: 'PAY-006', merchantName: 'Nordic Gear International', merchantId: 'mc-2', amount: 7650.00, method: 'bank_transfer', status: 'FAILED', requestedAt: 'Aug 10' },
];

const MOCK_MERCHANT_BALANCES: MerchantBalance[] = [
  { id: 'mc-1', name: 'Apex Global Imports LLC', balance: 8420, collected: 24580, fees: 1642, shipments: 890 },
  { id: 'mc-2', name: 'Nordic Gear International', balance: 5640, collected: 18200, fees: 1280, shipments: 645 },
  { id: 'mc-3', name: 'Volt Electronics Hub', balance: 3200, collected: 9800, fees: 720, shipments: 312 },
  { id: 'mc-4', name: 'Metro Goods Co.', balance: 2100, collected: 7600, fees: 540, shipments: 234 },
  { id: 'mc-5', name: 'Pacific Trading LLC', balance: 1850, collected: 5400, fees: 380, shipments: 178 },
];

const MOCK_STATS = {
  activeMerchants: 342,
  totalPaidOut: 284500,
  payoutsCompleted: 156,
  pendingPayoutAmount: 17260,
  pendingPayoutCount: 2,
  totalCODCollected: 524000,
};

/* ── Page ── */
export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('payouts');
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);
  const [processModal, setProcessModal] = useState<PayoutRequest | null>(null);
  const [batchModal, setBatchModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleApprove = (id: string) => {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'PROCESSING' as const } : p));
    setProcessModal(null);
  };

  const handleProcess = (id: string) => {
    setPayouts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'PAID' as const, processedAt: 'Just now' } : p));
    setProcessModal(null);
  };

  const handleBatchProcess = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setPayouts((prev) => prev.map((p) => p.status === 'PROCESSING' ? { ...p, status: 'PAID' as const, processedAt: 'Just now' } : p));
    setProcessing(false);
    setBatchModal(false);
  };

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;
  const processingCount = payouts.filter((p) => p.status === 'PROCESSING').length;

  const payoutColumns: Column<PayoutRequest>[] = [
    {
      key: 'id', header: 'Request ID', render: (row) => <span className="font-mono text-xs font-semibold text-blue-600">{row.id}</span>,
    },
    {
      key: 'merchantName', header: 'Merchant', sortable: true, accessor: (r) => r.merchantName,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.merchantName} size="sm" />
          <span className="text-xs font-semibold text-slate-800">{row.merchantName}</span>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount (USD)', sortable: true, accessor: (r) => r.amount,
      render: (row) => <span className="font-mono font-bold text-slate-900">${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>,
    },
    {
      key: 'method', header: 'Method',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
          {row.method === 'bank_transfer' ? <Building2 className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
          {row.method === 'bank_transfer' ? 'Bank' : 'PayPal'}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'PAID' ? 'green' : row.status === 'PROCESSING' ? 'blue' : row.status === 'FAILED' ? 'default' : 'amber'}
          size="sm" dot
        >
          {row.status}
        </Badge>
      ),
    },
    { key: 'requestedAt', header: 'Requested', render: (row) => <span className="text-[11px] text-slate-500">{row.requestedAt}</span> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        row.status === 'PENDING' ? (
          <Button variant="primary" size="sm" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); setProcessModal(row); }}>
            Review
          </Button>
        ) : row.status === 'PROCESSING' ? (
          <Button variant="primary" size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700" onClick={(e) => { e.stopPropagation(); handleProcess(row.id); }}>
            <CheckCircle2 className="w-3 h-3 mr-1" /> Pay Now
          </Button>
        ) : row.status === 'FAILED' ? (
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={(e) => { e.stopPropagation(); handleApprove(row.id); }}>
            Retry
          </Button>
        ) : <span className="text-[11px] text-slate-400">{row.processedAt}</span>
      ),
    },
  ];

  const merchantColumns: Column<MerchantBalance>[] = [
    {
      key: 'name', header: 'Merchant', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name} size="sm" />
          <span className="text-xs font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
    },
    { key: 'balance', header: 'Available', sortable: true, accessor: (r) => r.balance as unknown as string,
      render: (row) => <span className="font-mono font-bold text-emerald-600">${row.balance.toLocaleString()}</span>,
    },
    { key: 'collected', header: 'COD Collected', sortable: true, accessor: (r) => r.collected as unknown as string,
      render: (row) => <span className="font-mono text-slate-700">${row.collected.toLocaleString()}</span>,
    },
    { key: 'fees', header: 'Fees', render: (row) => <span className="font-mono text-red-600">-${row.fees.toLocaleString()}</span> },
    { key: 'shipments', header: 'Shipments', sortable: true, accessor: (r) => r.shipments as unknown as string,
      render: (row) => <span className="text-xs font-semibold text-slate-600">{row.shipments}</span>,
    },
  ];

  return (
    <DashboardLayout role="admin" title="Settlement Clearinghouse" subtitle="Merchant payouts, batch processing, and financial operations">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Paid Out" value={`$${MOCK_STATS.totalPaidOut.toLocaleString()}`} icon={TrendingUp} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" subtext={`${MOCK_STATS.payoutsCompleted} settlements`} />
        <StatCard title="Pending Payouts" value={`$${MOCK_STATS.pendingPayoutAmount.toLocaleString()}`} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 border-amber-100" subtext={`${MOCK_STATS.pendingPayoutCount} requests`} />
        <StatCard title="Total COD Collected" value={`$${MOCK_STATS.totalCODCollected.toLocaleString()}`} icon={DollarSign} iconColor="text-blue-600" iconBg="bg-blue-50 border-blue-100" subtext="All merchants" />
        <StatCard title="Active Merchants" value={String(MOCK_STATS.activeMerchants)} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50 border-purple-100" subtext="With balances" />
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {processingCount > 0 && (
            <Button variant="primary" size="sm" onClick={() => setBatchModal(true)} leftIcon={<Zap className="w-3.5 h-3.5" />}>
              Batch Process ({processingCount})
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
            <Shield className="w-3.5 h-3.5" /> Stripe Connect: <span className={MOCK_STATS.totalPaidOut > 0 ? 'text-emerald-600' : 'text-slate-400'}>{MOCK_STATS.totalPaidOut > 0 ? 'Sandbox Active' : 'Not Configured'}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700">
            <Shield className="w-3.5 h-3.5" /> PayPal Payouts: <span className="text-blue-600">Sandbox Active</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'payouts', label: 'Payout Queue', count: pendingCount + processingCount },
          { key: 'merchants', label: 'Merchant Balances' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-0"
      />

      {activeTab === 'payouts' && (
        <DataTable
          data={payouts as unknown as Record<string, unknown>[]}
          columns={payoutColumns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search payouts..."
          searchKeys={['id', 'merchantName']}
          pageSize={10}
          emptyMessage="No payout requests found."
          headerRight={<Badge variant="blue" size="sm">{payouts.length} requests</Badge>}
        />
      )}

      {activeTab === 'merchants' && (
        <DataTable
          data={MOCK_MERCHANT_BALANCES as unknown as Record<string, unknown>[]}
          columns={merchantColumns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search merchants..."
          searchKeys={['name']}
          pageSize={10}
          emptyMessage="No merchant balances found."
          headerRight={<Badge variant="blue" size="sm">{MOCK_MERCHANT_BALANCES.length} merchants</Badge>}
        />
      )}

      {/* ═══ Approve & Process Modal ═══ */}
      <Modal
        isOpen={!!processModal}
        onClose={() => setProcessModal(null)}
        title="Review Payout Request"
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setProcessModal(null)}>Cancel</Button>
            <Button variant="outline" size="sm" onClick={() => processModal && handleApprove(processModal.id)}>
              Approve
            </Button>
            <Button variant="primary" size="sm" onClick={() => processModal && handleProcess(processModal.id)} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Process & Pay
            </Button>
          </>
        }
      >
        {processModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Merchant</div>
                <div className="flex items-center gap-2">
                  <Avatar name={processModal.merchantName} size="sm" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">{processModal.merchantName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{processModal.merchantId}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-center">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Payout Amount</div>
                <div className="text-2xl font-bold text-emerald-700 mt-1">${processModal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-[10px] text-emerald-500 font-semibold">USD</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Method</div>
                <div className="text-xs font-bold text-slate-800 mt-1">{processModal.method === 'bank_transfer' ? '🏦 Bank' : '📧 PayPal'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Requested</div>
                <div className="text-xs font-bold text-slate-800 mt-1">{processModal.requestedAt}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Provider</div>
                <div className="text-xs font-bold text-slate-800 mt-1">{processModal.method === 'bank_transfer' ? 'Stripe Connect' : 'PayPal Payouts'}</div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-700">
              <strong>Processing:</strong> The payout will be routed through {processModal.method === 'bank_transfer' ? 'Stripe Connect Transfers API' : 'PayPal Payouts Batch API'}. Funds typically arrive in 2-3 business days (bank) or instantly (PayPal).
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ Batch Process Modal ═══ */}
      <Modal
        isOpen={batchModal}
        onClose={() => setBatchModal(false)}
        title="Batch Process Settlements"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setBatchModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={processing} onClick={handleBatchProcess} leftIcon={<Zap className="w-3.5 h-3.5" />}>
              Process All ({processingCount})
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            This will process all {processingCount} approved settlements through their respective payout providers (Stripe Connect / PayPal Payouts).
          </p>
          <div className="p-4 bg-amber-50 rounded border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">Batch Processing Details</span>
            </div>
            <div className="text-[11px] text-amber-600 space-y-1">
              <div>• {processingCount} settlements will be processed</div>
              <div>• Total amount: ${payouts.filter((p) => p.status === 'PROCESSING').reduce((s, p) => s + p.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</div>
              <div>• Each payout routes through the merchant&apos;s configured provider</div>
              <div>• Failed payouts will be marked and retryable</div>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
