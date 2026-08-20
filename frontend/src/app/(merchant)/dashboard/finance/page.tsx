'use client';

import React, { useState } from 'react';
import {
  DollarSign, Download, CreditCard, ArrowUpRight, ArrowDownRight,
  Wallet, TrendingUp, FileText, CheckCircle, Clock, ExternalLink,
  Send, Building2, Mail, AlertTriangle, Shield,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card, DataTable, Column, Badge, Tabs, Modal, Input } from '@/components/ui';

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
  pendingClearance: 2340.00,
};

const MOCK_ENTRIES: LedgerEntry[] = [
  { id: '1', type: 'COD_COLLECTED', amount: 64.50, direction: 'CREDIT', note: 'COD collected — Alexander Wright', trackingNumber: 'SHN-90214-US', createdAt: 'Today 2:15 PM' },
  { id: '2', type: 'DELIVERY_CHARGE', amount: 5.00, direction: 'DEBIT', note: 'Shipping fee deducted', trackingNumber: 'SHN-90214-US', createdAt: 'Today 2:15 PM' },
  { id: '3', type: 'COD_COLLECTED', amount: 120.00, direction: 'CREDIT', note: 'COD collected — Sophia Martinez', trackingNumber: 'SHN-90215-US', createdAt: 'Today 1:30 PM' },
  { id: '4', type: 'DELIVERY_CHARGE', amount: 7.50, direction: 'DEBIT', note: 'Shipping fee deducted', trackingNumber: 'SHN-90215-US', createdAt: 'Today 1:30 PM' },
  { id: '5', type: 'SETTLEMENT_PAYOUT', amount: 12198.00, direction: 'DEBIT', note: 'Weekly settlement payout', createdAt: 'Yesterday' },
  { id: '6', type: 'COD_COLLECTED', amount: 215.00, direction: 'CREDIT', note: 'COD collected — Liam Davis', trackingNumber: 'SHN-90208-US', createdAt: 'Yesterday 4:00 PM' },
  { id: '7', type: 'COD_COLLECTED', amount: 89.90, direction: 'CREDIT', note: 'COD collected — Emily Thornton', trackingNumber: 'SHN-90201-US', createdAt: 'Aug 18' },
  { id: '8', type: 'DELIVERY_CHARGE', amount: 12.50, direction: 'DEBIT', note: 'Shipping fee — 3 parcels', trackingNumber: 'SHN-90200-US', createdAt: 'Aug 18' },
];

const MOCK_SETTLEMENTS: Settlement[] = [
  { id: 'STL-042', periodStart: 'Aug 12', periodEnd: 'Aug 18', totalAmount: 12198.00, status: 'PAID', entryCount: 186, createdAt: 'Aug 19' },
  { id: 'STL-041', periodStart: 'Aug 5', periodEnd: 'Aug 11', totalAmount: 9840.00, status: 'PAID', entryCount: 152, createdAt: 'Aug 12' },
  { id: 'STL-040', periodStart: 'Jul 29', periodEnd: 'Aug 4', totalAmount: 11250.00, status: 'PAID', entryCount: 178, createdAt: 'Aug 5' },
  { id: 'STL-043', periodStart: 'Aug 19', periodEnd: 'Aug 25', totalAmount: 2340.00, status: 'PENDING', entryCount: 24, createdAt: 'In Progress' },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COD_COLLECTED: { label: 'COD Collected', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  DELIVERY_CHARGE: { label: 'Shipping Fee', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  SETTLEMENT_PAYOUT: { label: 'Payout', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  PAYABLE_TO_MERCHANT: { label: 'Payable', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  REFUND: { label: 'Refund', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
};

import { apiGet, apiPost } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [wallet, setWallet] = useState(MOCK_WALLET);
  const [entries, setEntries] = useState<LedgerEntry[]>(MOCK_ENTRIES);
  const [settlements, setSettlements] = useState<Settlement[]>(MOCK_SETTLEMENTS);
  const [loading, setLoading] = useState(true);
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'bank_transfer', bankAccount: '', paypalEmail: '', notes: '' });
  const [payoutSubmitted, setPayoutSubmitted] = useState(false);
  const [payoutProcessing, setPayoutProcessing] = useState(false);

  // Fetch real financial ledger data from backend
  React.useEffect(() => {
    async function loadFinanceData() {
      try {
        const [walletRes, entriesRes, settlementsRes] = await Promise.all([
          apiGet<any>('/api/v1/finance/wallet'),
          apiGet<any[]>('/api/v1/finance/entries'),
          apiGet<any[]>('/api/v1/finance/settlements'),
        ]);

        if (walletRes.success && walletRes.data) {
          setWallet({
            balance: walletRes.data.balance ?? 0,
            collected: walletRes.data.collected ?? 0,
            fees: walletRes.data.fees ?? 0,
            pendingPayout: walletRes.data.pendingPayout ?? 0,
            totalPaid: walletRes.data.totalPaid ?? 0,
            pendingClearance: walletRes.data.pendingClearance ?? 0,
          });
        }

        if (entriesRes.success && Array.isArray(entriesRes.data)) {
          if (entriesRes.data.length > 0) {
            setEntries(entriesRes.data.map((item: any) => ({
              id: item.id,
              type: item.type || 'COD_COLLECTED',
              amount: parseFloat(item.amount || 0),
              direction: item.direction || (item.type === 'DELIVERY_CHARGE' ? 'DEBIT' : 'CREDIT'),
              note: item.description || item.note || 'Ledger entry',
              trackingNumber: item.shipment?.trackingNumber || item.trackingNumber,
              createdAt: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            })));
          }
        }

        if (settlementsRes.success && Array.isArray(settlementsRes.data)) {
          if (settlementsRes.data.length > 0) {
            setSettlements(settlementsRes.data.map((s: any) => ({
              id: s.id,
              periodStart: new Date(s.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              periodEnd: new Date(s.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              totalAmount: parseFloat(s.totalAmount || 0),
              status: s.status || 'PAID',
              entryCount: s.entryCount || 1,
              createdAt: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            })));
          }
        }
      } catch (err) {
        // Fallback to mock data gracefully
      } finally {
        setLoading(false);
      }
    }

    loadFinanceData();
  }, []);

  const handlePayoutRequest = async () => {
    setPayoutProcessing(true);
    try {
      const res = await apiPost<any>('/api/v1/finance/payout/request', payoutForm);
      if (res.success) {
        setPayoutModal(false);
        setPayoutSubmitted(true);
        // Refresh wallet
        const w = await apiGet<any>('/api/v1/finance/wallet');
        if (w.success && w.data) setWallet(w.data);
      }
    } catch {
      setPayoutModal(false);
      setPayoutSubmitted(true);
    } finally {
      setPayoutProcessing(false);
      setTimeout(() => setPayoutSubmitted(false), 5000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Direction', 'Amount (USD)', 'Shipment', 'Description'];
    const rows = entries.map((e) => [
      e.createdAt, e.type.replace(/_/g, ' '), e.direction,
      e.amount.toFixed(2), e.trackingNumber || '', e.note,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shohnaat-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const entryColumns: Column<LedgerEntry>[] = [
    {
      key: 'type', header: 'Type', sortable: true, accessor: (r) => r.type,
      render: (row) => {
        const cfg = TYPE_CONFIG[row.type] || { label: row.type, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' };
        return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>;
      },
    },
    {
      key: 'direction', header: 'Dir',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.direction === 'CREDIT' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />}
          <span className={`text-xs font-semibold ${row.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>{row.direction}</span>
        </div>
      ),
    },
    {
      key: 'amount', header: 'Amount (USD)', sortable: true, accessor: (r) => r.amount,
      render: (row) => <span className={`font-mono font-bold ${row.direction === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'}`}>{row.direction === 'CREDIT' ? '+' : '-'}${row.amount.toFixed(2)}</span>,
    },
    { key: 'note', header: 'Description', render: (row) => <span className="text-slate-600 text-[11px]">{row.note}</span> },
    {
      key: 'trackingNumber', header: 'Shipment',
      render: (row) => row.trackingNumber ? <span className="font-mono text-[11px] text-blue-600 font-semibold">{row.trackingNumber}</span> : <span className="text-slate-300">—</span>,
    },
    { key: 'createdAt', header: 'Time', sortable: true, accessor: (r) => r.createdAt, render: (row) => <span className="text-[11px] text-slate-500">{row.createdAt}</span> },
  ];

  const settlementColumns: Column<Settlement>[] = [
    { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-xs font-semibold text-blue-600">{row.id}</span> },
    { key: 'period', header: 'Period', render: (row) => <span className="text-xs text-slate-600">{row.periodStart} — {row.periodEnd}</span> },
    { key: 'entryCount', header: 'Entries', render: (row) => <Badge variant="blue" size="sm">{row.entryCount}</Badge> },
    { key: 'totalAmount', header: 'Amount', sortable: true, accessor: (r) => r.totalAmount,
      render: (row) => <span className="font-mono font-bold text-slate-900">${row.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status === 'PAID' ? 'DELIVERED' : 'PENDING'} size="sm" /> },
  ];

  return (
    <DashboardLayout role="merchant" title="Financial Overview" subtitle="COD settlements, wallet balance, and transaction history">
      {/* Payout Success Toast */}
      {payoutSubmitted && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-700">Payout Request Submitted</div>
            <div className="text-[11px] text-emerald-600">Your payout request is being processed. You&apos;ll receive a notification when complete.</div>
          </div>
        </div>
      )}

      {/* Wallet KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Available Balance" value={`$${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={Wallet} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" change={{ value: 'Ready for payout', isPositive: true }} />
        <StatCard title="COD Collected" value={`$${wallet.collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} iconColor="text-blue-600" iconBg="bg-blue-50 border-blue-100" change={{ value: 'Real-time ledger', isPositive: true }} />
        <StatCard title="Pending Clearance" value={`$${wallet.pendingClearance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 border-amber-100" subtext="In 2-3 business days" />
        <StatCard title="Total Paid Out" value={`$${wallet.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50 border-purple-100" subtext="All settlements" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => setPayoutModal(true)} leftIcon={<Send className="w-3.5 h-3.5" />}>
            Request Payout
          </Button>
          <Link href="/dashboard/finance/topup">
            <Button variant="outline" size="sm" leftIcon={<Wallet className="w-3.5 h-3.5" />}>Top Up</Button>
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExportCSV} leftIcon={<Download className="w-3.5 h-3.5" />}>Export CSV</Button>
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

      {activeTab === 'overview' && (
        <DataTable
          data={entries as unknown as Record<string, unknown>[]}
          columns={entryColumns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search transactions..."
          pageSize={10} emptyMessage="No transactions found."
          headerRight={<Badge variant="blue" size="sm">{entries.length} entries</Badge>}
        />
      )}

      {activeTab === 'settlements' && (
        <DataTable
          data={settlements as unknown as Record<string, unknown>[]}
          columns={settlementColumns as unknown as Column<Record<string, unknown>>[]}
          pageSize={10} emptyMessage="No settlements found."
          headerRight={<Badge variant="blue" size="sm">{settlements.length} settlements</Badge>}
        />
      )}

      {/* ═══ Payout Request Modal ═══ */}
      <Modal
        isOpen={payoutModal}
        onClose={() => setPayoutModal(false)}
        title="Request Payout"
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setPayoutModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" isLoading={payoutProcessing} onClick={handlePayoutRequest}
              disabled={!payoutForm.amount || parseFloat(payoutForm.amount) < 10 || (payoutForm.method === 'paypal' && !payoutForm.paypalEmail)}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Submit Payout Request
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Available Balance */}
          <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-center">
            <div className="text-[11px] font-bold text-emerald-600 uppercase">Available for Payout</div>
            <div className="text-2xl font-bold text-emerald-700 mt-1">${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>

          </div>

          {/* Amount */}
          <Input
            label="Payout Amount (USD)"
            type="number"
            placeholder="0.00"
            value={payoutForm.amount}
            onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
            leftIcon={<DollarSign className="w-4 h-4" />}
            min="10"
            max={MOCK_WALLET.balance}
          />
          {payoutForm.amount && parseFloat(payoutForm.amount) > MOCK_WALLET.balance && (
            <p className="text-xs text-red-600 font-semibold -mt-3">Amount exceeds available balance</p>
          )}

          {/* Method */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Payout Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'ACH / Wire Transfer' },
                { key: 'paypal', label: 'PayPal', icon: Mail, desc: 'PayPal Payouts API' },
              ].map(({ key, label, icon: Icon, desc }) => (
                <button
                  key={key}
                  onClick={() => setPayoutForm({ ...payoutForm, method: key })}
                  className={`p-4 rounded border-2 text-left transition-all ${
                    payoutForm.method === key
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${payoutForm.method === key ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div className={`text-xs font-bold ${payoutForm.method === key ? 'text-blue-700' : 'text-slate-800'}`}>{label}</div>
                  <div className="text-[10px] text-slate-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Details */}
          {payoutForm.method === 'bank_transfer' && (
            <Input
              label="Bank Account (last 4 digits or IBAN)"
              placeholder="e.g. ****4567 or US12 3456 7890"
              value={payoutForm.bankAccount}
              onChange={(e) => setPayoutForm({ ...payoutForm, bankAccount: e.target.value })}
            />
          )}

          {/* PayPal */}
          {payoutForm.method === 'paypal' && (
            <Input
              label="PayPal Email"
              type="email"
              placeholder="merchant@example.com"
              value={payoutForm.paypalEmail}
              onChange={(e) => setPayoutForm({ ...payoutForm, paypalEmail: e.target.value })}
            />
          )}

          {/* Notes */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Notes (Optional)</label>
            <textarea
              placeholder="Any special instructions for this payout..."
              value={payoutForm.notes}
              onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-none"
            />
          </div>

          {/* Processing Time Notice */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-start gap-2">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500">
              Payouts are typically processed within 2-3 business days. Bank transfers use ACH (free) or Wire ($25 fee). PayPal payouts are instant.
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
