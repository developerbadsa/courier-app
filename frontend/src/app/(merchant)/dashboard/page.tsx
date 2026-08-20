'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package, Truck, CheckCircle, DollarSign, ExternalLink,
  Copy, Check, Loader2, Download,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card, DataTable, Column, Tabs, Badge } from '@/components/ui';
import { downloadInvoicePDF } from '@/lib/invoicePdf';
import { showToast, apiGet } from '@/lib/api';

/* ── Types ── */
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

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

/* ── Columns ── */
function useColumns() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (id: string) => { navigator.clipboard.writeText(id); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'id', header: 'Tracking ID', sortable: true, accessor: (r) => r.id as string,
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-mono font-semibold text-primary">
            <span>{row.id as string}</span>
            <button onClick={(e) => { e.stopPropagation(); handleCopy(row.id as string); }} className="text-slate-400 hover:text-slate-600 p-0.5 rounded">
              {copiedId === row.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[10.5px] text-slate-400 mt-0.5">{row.createdAt as string}</div>
        </div>
      ),
    },
    {
      key: 'consignee', header: 'Consignee', sortable: true, accessor: (r) => r.consignee as string,
      render: (row) => (<div><div className="font-semibold text-slate-800">{row.consignee as string}</div><div className="text-[11px] text-slate-400">{row.phone as string}</div></div>),
    },
    { key: 'destination', header: 'Destination', sortable: true, accessor: (r) => r.destination as string, render: (row) => <span className="text-slate-600 font-medium">{row.destination as string}</span> },
    { key: 'cod', header: 'COD (USD)', sortable: true, accessor: (r) => r.cod as number, render: (row) => <span className="font-semibold text-slate-900">${(row.cod as number).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status as string} size="sm" /> },
    {
      key: 'action', header: '', headerClassName: 'text-right', className: 'text-right',
      render: (row) => (
        <Link href={`/track?id=${row.id}`} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline px-2 py-1 rounded transition-colors">
          Track <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];
  return columns;
}

/* ── Page ── */
export default function MerchantDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const columns = useColumns();

  /* ── API State ── */
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [stats, setStats] = useState({ total: 0, inTransit: 0, delivered: 0, codOutstanding: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [shipRes, statsRes] = await Promise.all([
        apiGet<any>('/api/v1/shipments?limit=5&sortBy=createdAt&sortOrder=desc'),
        apiGet<any>('/api/v1/shipments/stats'),
      ]);

      if (shipRes.success && shipRes.data) {
        setShipments(shipRes.data.map((s: any) => ({
          id: s.trackingNumber || s.id,
          consignee: s.consignee?.name || 'Unknown',
          phone: s.consignee?.phone || '',
          destination: s.deliveryAddressSnap?.city || s.deliveryAddress?.city || '—',
          cod: parseFloat(s.codAmount || 0),
          status: s.currentStatus || 'PENDING',
          paymentStatus: parseFloat(s.codAmount || 0) > 0 ? 'UNPAID' : 'PAID',
          createdAt: new Date(s.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        })));
      }

      if (statsRes.success && statsRes.data) {
        setStats({
          total: statsRes.data.totalShipments || 0,
          inTransit: statsRes.data.inTransit || 0,
          delivered: statsRes.data.delivered || 0,
          codOutstanding: statsRes.data.codCollected || 0,
        });
      }
    } catch {
      // Silent — graceful degradation
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = activeTab === 'all' ? shipments : shipments.filter((s) => s.status === activeTab);

  const handleDownloadStatement = () => {
    setDownloadingStatement(true);
    try {
      downloadInvoicePDF({
        invoiceNumber: `STMT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        invoiceDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        from: { name: 'Shohnaat Logistics Financial Clearinghouse', address: 'Headquarters Hub, USA', email: 'settlements@shohnaat.com', phone: '+1 (800) 555-SHAT' },
        to: { name: 'Merchant Partner Account', address: 'Verified Merchant Hub, USA' },
        items: [{ description: 'Weekly COD Remittance Collected', quantity: 1, unitPrice: stats.codOutstanding }],
        taxRate: 0, currency: 'USD',
        notes: 'Certified Financial Statement for weekly COD disbursement.',
      });
      showToast('success', 'Weekly settlement statement PDF downloaded!');
    } catch { showToast('error', 'Unable to generate statement PDF.'); }
    finally { setTimeout(() => setDownloadingStatement(false), 800); }
  };

  return (
    <DashboardLayout
      role="merchant" title="Merchant Dashboard"
      subtitle="Real-time parcel dispatch, COD settlements, and live logistics overview"
      primaryActionLabel="Create Shipment"
      onPrimaryAction={() => router.push('/dashboard/shipments/new')}
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Shipments" value={loading ? '—' : String(stats.total)} icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50 border-blue-100" subtext="All time" />
        <StatCard title="In Transit" value={loading ? '—' : String(stats.inTransit)} icon={Truck} iconColor="text-amber-600" iconBg="bg-amber-50 border-amber-100" subtext="Active shipments" />
        <StatCard title="Delivered" value={loading ? '—' : String(stats.delivered)} icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" subtext="Completed" />
        <StatCard title="COD Collected" value={loading ? '—' : `$${stats.codOutstanding.toLocaleString()}`} icon={DollarSign} iconColor="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" subtext="Total collected" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Shipments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest dispatches and delivery status</p>
            </div>
            <Badge variant="blue" size="sm">{shipments.length} parcels</Badge>
          </div>
          <Tabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : (
            <DataTable data={filtered as unknown as Record<string, unknown>[]} columns={columns} searchable searchPlaceholder="Filter shipments..." searchKeys={['id', 'consignee']} pageSize={5} emptyMessage="No shipments found. Create your first shipment to get started." />
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Scheduled Pickup</span>
              <Badge variant="blue" size="sm">Today 3:00 PM</Badge>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-3">Headquarters Hub</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Pending pickup assignment for current orders.</p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need immediate pickup?</span>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => router.push('/dashboard/pickups/new')}>Request Extra</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Settlement &amp; Payouts</h3>
              <Badge variant="green" size="sm" dot>Verified</Badge>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">COD Collected</span>
                <span className="font-bold text-slate-900">{loading ? '—' : `$${stats.codOutstanding.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold">
                <span className="text-slate-800">Total Delivered</span>
                <span className="font-bold text-emerald-600 text-base">{loading ? '—' : stats.delivered}</span>
              </div>
            </div>
            <div className="mt-5">
              <Button variant="primary" size="sm" className="w-full h-9 text-xs font-semibold" onClick={handleDownloadStatement} disabled={downloadingStatement}
                leftIcon={downloadingStatement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}>
                {downloadingStatement ? 'Generating PDF...' : 'Download Statement'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
