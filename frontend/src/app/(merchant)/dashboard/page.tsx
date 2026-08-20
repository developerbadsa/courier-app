'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  ExternalLink,
  Copy,
  Check,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card, DataTable, Column, Tabs, Badge } from '@/components/ui';
import { downloadInvoicePDF } from '@/lib/invoicePdf';
import { showToast } from '@/lib/api';



/* ------------------------------------------------------------------ */
/*  Types & Mock Data                                                   */
/* ------------------------------------------------------------------ */
interface Shipment {
  id: string;
  consignee: string;
  phone: string;
  destination: string;
  cod: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const SHIPMENTS: Shipment[] = [
  { id: 'SHN-98421-US', consignee: 'Alexander Wright', phone: '+1 (512) 492-8190', destination: 'Austin, TX', cod: 64.5, status: 'IN_TRANSIT', paymentStatus: 'UNPAID', createdAt: '12 min ago' },
  { id: 'SHN-98422-US', consignee: 'Sophia Martinez', phone: '+1 (305) 881-2309', destination: 'Miami, FL', cod: 120, status: 'OUT_FOR_DELIVERY', paymentStatus: 'UNPAID', createdAt: '45 min ago' },
  { id: 'SHN-98423-US', consignee: 'Marcus Vance', phone: '+1 (206) 714-9921', destination: 'Seattle, WA', cod: 32, status: 'DELIVERED', paymentStatus: 'PAID', createdAt: '2h ago' },
  { id: 'SHN-98424-US', consignee: 'Emily Thornton', phone: '+1 (415) 309-1184', destination: 'San Francisco, CA', cod: 89.9, status: 'PENDING', paymentStatus: 'UNPAID', createdAt: '3h ago' },
  { id: 'SHN-98425-US', consignee: 'Liam Davis', phone: '+1 (773) 612-4091', destination: 'Chicago, IL', cod: 215, status: 'PICKED_UP', paymentStatus: 'UNPAID', createdAt: '4h ago' },
];

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

/* ------------------------------------------------------------------ */
/*  Shipment Table Columns                                              */
/* ------------------------------------------------------------------ */
function useColumns() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'id',
      header: 'Tracking ID',
      sortable: true,
      accessor: (r) => r.id as string,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-mono font-semibold text-blue-600">
            <span>{row.id as string}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(row.id as string);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              {copiedId === row.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5">{row.createdAt as string}</div>
        </div>
      ),
    },
    {
      key: 'consignee',
      header: 'Consignee',
      sortable: true,
      accessor: (r) => r.consignee as string,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.consignee as string}</div>
          <div className="text-[11px] text-slate-400">{row.phone as string}</div>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      sortable: true,
      accessor: (r) => r.destination as string,
      render: (row) => <span className="text-slate-600 font-medium">{row.destination as string}</span>,
    },
    {
      key: 'cod',
      header: 'COD (USD)',
      sortable: true,
      accessor: (r) => r.cod as number,
      render: (row) => <span className="font-semibold text-slate-900">${(row.cod as number).toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status as string} size="sm" />,
    },
    {
      key: 'action',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <Link
          href={`/track?id=${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
        >
          Track <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  return columns;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function MerchantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const columns = useColumns();

  const filtered = activeTab === 'all' ? SHIPMENTS : SHIPMENTS.filter((s) => s.status === activeTab);

  const handleDownloadStatement = () => {
    setDownloadingStatement(true);
    try {
      downloadInvoicePDF({
        invoiceNumber: `STMT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        invoiceDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        from: {
          name: 'Shohnaat Logistics Financial Clearinghouse',
          address: 'Headquarters Hub, USA',
          email: 'settlements@shohnaat.com',
          phone: '+1 (800) 555-SHAT',
        },
        to: {
          name: 'Merchant Partner Account',
          address: 'Verified Merchant Hub, USA',
        },
        items: [
          { description: 'Weekly COD Remittance Collected (5 shipments)', quantity: 1, unitPrice: 12840.00 },
          { description: 'Platform Delivery & Fulfillment Fees (Deduction)', quantity: 1, unitPrice: -642.00 },
        ],
        taxRate: 0,
        currency: 'USD',
        notes: 'Certified Financial Statement for weekly COD disbursement. Net payable processed to primary settlement account.',
      });
      showToast('success', 'Weekly settlement statement PDF downloaded successfully!');
    } catch {
      showToast('error', 'Unable to generate statement PDF.');
    } finally {
      setTimeout(() => setDownloadingStatement(false), 800);
    }
  };

  return (
    <DashboardLayout
      role="merchant"
      title="Merchant Dashboard"
      subtitle="Real-time parcel dispatch, COD settlements, and live logistics overview"
      primaryActionLabel="Create Shipment"
      onPrimaryAction={() => router.push('/dashboard/shipments/new')}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Shipments"
          value="128"
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{ value: '+14.2%', isPositive: true, period: 'vs yesterday' }}
        />
        <StatCard
          title="In Transit"
          value="45"
          icon={Truck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          subtext="Across 3 hubs"
        />
        <StatCard
          title="Delivered Today"
          value="84"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          change={{ value: '98.6%', isPositive: true, period: 'on-time rate' }}
        />
        <StatCard
          title="COD Outstanding"
          value="$4,250"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          subtext="Next settlement: Tomorrow"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Shipments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Live status and dispatch timeline for current orders</p>
            </div>
            <Badge variant="blue" size="sm">{SHIPMENTS.length} parcels</Badge>
          </div>

          <Tabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />

          <DataTable
            data={filtered as unknown as Record<string, unknown>[]}
            columns={columns}
            searchable
            searchPlaceholder="Filter shipments..."
            searchKeys={['id', 'consignee', 'destination']}
            pageSize={5}
            emptyMessage="No shipments match this filter."
          />
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Pickup Schedule */}
          <Card className="p-6 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Scheduled Pickup</span>
              <Badge variant="blue" size="sm">Today 3:00 PM</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">Headquarters Hub Van #4</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Rider <strong>David Miller</strong> assigned for 18 parcel pickups.
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need immediate pickup?</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold"
                onClick={() => router.push('/dashboard/pickups/new')}
              >
                Request Extra
              </Button>
            </div>
          </Card>

          {/* Settlement Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Settlement &amp; Payouts</h3>
              <Badge variant="green" size="sm" dot>Verified</Badge>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Collected This Week</span>
                <span className="font-bold text-slate-900">$12,840.00</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Delivery Fees</span>
                <span className="font-bold text-slate-700">-$642.00</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold">
                <span className="text-slate-800">Net Payable</span>
                <span className="font-bold text-emerald-600 text-base">$12,198.00</span>
              </div>
            </div>
            <div className="mt-5">
              <Button
                variant="primary"
                size="sm"
                className="w-full h-9 text-xs font-semibold"
                onClick={handleDownloadStatement}
                disabled={downloadingStatement}
                leftIcon={downloadingStatement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              >
                {downloadingStatement ? 'Generating PDF...' : 'Download Statement'}
              </Button>
            </div>
          </Card>
        </div>
      </div>


    </DashboardLayout>
  );
}
