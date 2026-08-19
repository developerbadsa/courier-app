'use client';

import React, { useState } from 'react';
import {
  Users,
  Truck,
  Package,
  Database,
  Check,
  X,
  Building2,
  DollarSign,
  MapPin,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import {
  StatCard,
  StatusBadge,
  Button,
  Card,
  DataTable,
  Column,
  Tabs,
  Modal,
  Avatar,
  Badge,
  EmptyState,
} from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Types & Mock Data                                                   */
/* ------------------------------------------------------------------ */
interface MerchantKYC {
  id: string;
  name: string;
  businessType: string;
  email: string;
  rateCard: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
}

const INITIAL_KYC: MerchantKYC[] = [
  {
    id: 'MC-101',
    name: 'Apex Global Imports LLC',
    businessType: 'Cross-Border E-Commerce',
    email: 'contact@apexglobal.com',
    rateCard: 'Standard Enterprise USD',
    status: 'PENDING',
    submittedAt: 'Today 10:15 AM',
  },
  {
    id: 'MC-102',
    name: 'Nordic Gear International',
    businessType: 'Retail & Apparel',
    email: 'support@nordicgear.com',
    rateCard: 'High-Volume Commercial',
    status: 'VERIFIED',
    submittedAt: 'Yesterday',
  },
  {
    id: 'MC-103',
    name: 'Volt Electronics Hub',
    businessType: 'Consumer Tech Distribution',
    email: 'ops@volthub.io',
    rateCard: 'Standard Enterprise USD',
    status: 'PENDING',
    submittedAt: 'Today 1:30 PM',
  },
];

const TABS = [
  { key: 'all', label: 'All', count: 3 },
  { key: 'PENDING', label: 'Pending', count: 2 },
  { key: 'VERIFIED', label: 'Verified', count: 1 },
  { key: 'REJECTED', label: 'Rejected', count: 0 },
];

/* ------------------------------------------------------------------ */
/*  KYC Table Columns                                                   */
/* ------------------------------------------------------------------ */
const KYC_COLUMNS: Column<MerchantKYC>[] = [
  {
    key: 'name',
    header: 'Merchant',
    sortable: true,
    accessor: (r) => r.name,
    render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <div>
          <div className="font-semibold text-slate-900">{row.name}</div>
          <div className="text-[11px] text-slate-400">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'businessType',
    header: 'Industry',
    sortable: true,
    accessor: (r) => r.businessType,
    render: (row) => <span className="text-slate-600">{row.businessType}</span>,
  },
  {
    key: 'rateCard',
    header: 'Rate Card',
    render: (row) => <span className="font-mono font-medium text-blue-600 text-[11px]">{row.rateCard}</span>,
  },
  {
    key: 'submittedAt',
    header: 'Submitted',
    sortable: true,
    accessor: (r) => r.submittedAt,
    render: (row) => <span className="text-slate-500">{row.submittedAt}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusBadge
        status={row.status === 'VERIFIED' ? 'DELIVERED' : row.status === 'REJECTED' ? 'FAILED' : 'PENDING'}
        size="sm"
      />
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const [kycList, setKycList] = useState<MerchantKYC[]>(INITIAL_KYC);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    merchantId: string;
    merchantName: string;
    action: 'VERIFIED' | 'REJECTED';
  }>({ open: false, merchantId: '', merchantName: '', action: 'VERIFIED' });

  const filtered = activeTab === 'all' ? kycList : kycList.filter((k) => k.status === activeTab);
  const pendingCount = kycList.filter((k) => k.status === 'PENDING').length;

  const handleConfirm = () => {
    setKycList((prev) =>
      prev.map((m) => (m.id === confirmModal.merchantId ? { ...m, status: confirmModal.action } : m))
    );
    setConfirmModal({ open: false, merchantId: '', merchantName: '', action: 'VERIFIED' });
  };

  /* ── KYC Table Actions Column ── */
  const kycWithActions: Column<MerchantKYC>[] = [
    ...KYC_COLUMNS,
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) =>
        row.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmModal({ open: true, merchantId: row.id, merchantName: row.name, action: 'VERIFIED' })}
              className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700"
              leftIcon={<Check className="w-3 h-3 stroke-[2.5]" />}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal({ open: true, merchantId: row.id, merchantName: row.name, action: 'REJECTED' })}
              className="h-7 px-2.5 text-[11px] text-red-600 hover:bg-red-50 border-red-200"
              leftIcon={<X className="w-3 h-3 stroke-[2.5]" />}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 capitalize">{row.status.toLowerCase()}</span>
        ),
    },
  ];

  return (
    <DashboardLayout
      role="admin"
      title="Superadmin Console"
      subtitle="System overview, merchant verifications, and fleet metrics"
      primaryActionLabel="New Branch Hub"
      onPrimaryAction={() => alert('Opening Create Branch Hub modal...')}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Merchants"
          value="342"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{ value: '+18 this week', isPositive: true }}
        />
        <StatCard
          title="On-Duty Riders"
          value="86"
          icon={Truck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          subtext="Across 14 hubs"
        />
        <StatCard
          title="Deliveries Today"
          value="5,420"
          icon={Package}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
          change={{ value: '+8.4%', isPositive: true, period: 'vs avg' }}
        />
        <StatCard
          title="System Health"
          value="100% OK"
          icon={Database}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          subtext="PostgreSQL & Redis synced"
        />
      </div>

      {/* KYC Verification */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">Merchant KYC Verification</h2>
          {pendingCount > 0 && (
            <Badge variant="amber" size="sm" dot>
              {pendingCount} Pending
            </Badge>
          )}
        </div>

        <Tabs tabs={TABS.map((t) => ({ ...t, count: t.key === 'all' ? kycList.length : kycList.filter((k) => k.status === t.key).length }))} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />

        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          columns={kycWithActions as Column<Record<string, unknown>>[]}
          searchable
          searchPlaceholder="Search merchants..."
          searchKeys={['name', 'email', 'businessType']}
          pageSize={10}
          emptyMessage="No merchants found for this filter."
        />
      </div>

      {/* Infrastructure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Main Logistics Center</div>
            <div className="text-sm font-bold text-slate-900">Headquarters Hub</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Operational (100% SLA)</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Coverage Zones</div>
            <div className="text-sm font-bold text-slate-900">8 Active Delivery Sectors</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Next-Day &amp; Same-Day</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Billing Gateway</div>
            <div className="text-sm font-bold text-slate-900">USD ($) &middot; Stripe &amp; PayPal</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Automated Settlements</div>
          </div>
        </Card>
      </div>

      {/* Confirm Action Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ ...confirmModal, open: false })}
        title={`${confirmModal.action === 'VERIFIED' ? 'Approve' : 'Reject'} Merchant`}
        description={`Are you sure you want to ${confirmModal.action === 'VERIFIED' ? 'approve' : 'reject'} ${confirmModal.merchantName}?`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmModal({ ...confirmModal, open: false })}>
              Cancel
            </Button>
            <Button
              variant={confirmModal.action === 'VERIFIED' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirm}
            >
              {confirmModal.action === 'VERIFIED' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
          {confirmModal.action === 'VERIFIED' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <p className="text-xs text-slate-600">
            {confirmModal.action === 'VERIFIED'
              ? 'This merchant will gain full access to create shipments and manage pickups.'
              : 'This merchant application will be rejected. They will be notified via email.'}
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
