'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  X,
  Calendar,
  Filter,
  Package,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { DataTable, Column, StatusBadge, Button, Checkbox, Card } from '@/components/ui';
import { apiGet, showToast } from '@/lib/api';

/* ── Types ── */
interface ShipmentRow extends Record<string, unknown> {
  id: string;

  trackingNumber: string;
  consigneeName: string;
  consigneeContact: string;
  avatarInitials: string;
  avatarBg: string;
  status: string;
  codAmount: number;
  createdAt: string;
  dateObj: Date;
}

/* ── Status Options ── */
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

/* ── Date Range Options ── */
const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const AVATAR_COLORS = ['bg-emerald-500', 'bg-slate-600', 'bg-blue-600', 'bg-slate-800', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-rose-500', 'bg-cyan-600', 'bg-violet-500', 'bg-orange-500'];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ────────────────────────────────────────────────────────────────
 *  Shipments Page
 * ──────────────────────────────────────────────────────────────── */
export default function ShipmentsPage() {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [codOnly, setCodOnly] = useState(false);

  /* ── API State ── */
  const [shipments, setShipments] = useState<ShipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<any>('/api/v1/shipments?limit=100');
      if (res.success && res.data) {
        const rows: ShipmentRow[] = res.data.map((s: any) => ({
          id: s.trackingNumber || s.id,
          trackingNumber: s.trackingNumber,
          consigneeName: s.consignee?.name || 'Unknown',
          consigneeContact: s.consignee?.phone || '',
          avatarInitials: getInitials(s.consignee?.name || 'UN'),
          avatarBg: getAvatarColor(s.consignee?.name || 'unknown'),
          status: s.currentStatus || 'PENDING',
          codAmount: parseFloat(s.codAmount || 0),
          createdAt: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dateObj: new Date(s.createdAt),
        }));
        setShipments(rows);
      } else {
        setShipments([]);
      }
    } catch {
      setError('Failed to load shipments. Please try again.');
      showToast('error', 'Could not load shipments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  /* ── Filter logic ── */
  const filteredData = useMemo(() => {
    let result = shipments;

    if (selectedStatus) {
      result = result.filter((r) => r.status === selectedStatus);
    }

    if (selectedDateRange && selectedDateRange !== 'all') {
      const now = new Date();
      result = result.filter((r) => {
        const diff = (now.getTime() - r.dateObj.getTime()) / (1000 * 60 * 60 * 24);
        if (selectedDateRange === 'today') return diff < 1;
        if (selectedDateRange === '7d') return diff <= 7;
        if (selectedDateRange === '30d') return diff <= 30;
        if (selectedDateRange === '90d') return diff <= 90;
        return true;
      });
    }

    if (codOnly) {
      result = result.filter((r) => r.codAmount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.consigneeName.toLowerCase().includes(q) ||
          r.consigneeContact.toLowerCase().includes(q),
      );
    }

    return result;
  }, [selectedStatus, selectedDateRange, codOnly, searchQuery, shipments]);

  const handleClearAll = () => {
    setSelectedStatus('');
    setSelectedDateRange('all');
    setCodOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters =
    Boolean(selectedStatus) || (selectedDateRange && selectedDateRange !== 'all') || codOnly || Boolean(searchQuery.trim());

  /* ── Active filter chips ── */
  const activeChips = [
    ...(selectedStatus
      ? [{ key: `status-${selectedStatus}`, label: `Status: ${STATUS_OPTIONS.find((o) => o.value === selectedStatus)?.label}`, onRemove: () => setSelectedStatus('') }]
      : []),
    ...(selectedDateRange && selectedDateRange !== 'all'
      ? [{ key: `date-${selectedDateRange}`, label: `Date: ${DATE_OPTIONS.find((o) => o.value === selectedDateRange)?.label}`, onRemove: () => setSelectedDateRange('all') }]
      : []),
    ...(codOnly ? [{ key: 'cod', label: 'COD Only', onRemove: () => setCodOnly(false) }] : []),
    ...(searchQuery.trim() ? [{ key: 'search', label: `Search: "${searchQuery}"`, onRemove: () => setSearchQuery('') }] : []),
  ];

  /* ── Columns ── */
  const columns: Column<ShipmentRow>[] = [
    {
      key: 'id', header: 'TRACKING #', sortable: true, accessor: (r) => r.id,
      render: (row) => (
        <Link href={`/dashboard/shipments/${row.id}`} className="font-mono text-[12px] font-bold text-primary hover:underline transition-colors">
          {row.id}
        </Link>
      ),
    },
    {
      key: 'consigneeName', header: 'CONSIGNEE', sortable: true, accessor: (r) => r.consigneeName,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${row.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}>
            {row.avatarInitials}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[13px] leading-tight">{row.consigneeName}</p>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">{row.consigneeContact}</p>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'STATUS', sortable: true, accessor: (r) => r.status, render: (row) => <StatusBadge status={row.status} size="sm" /> },
    { key: 'createdAt', header: 'DATE', sortable: true, accessor: (r) => r.createdAt, render: (row) => <span className="text-[12px] text-slate-500">{row.createdAt}</span> },
    {
      key: 'codAmount', header: 'COD', align: 'right', sortable: true, accessor: (r) => r.codAmount, headerClassName: 'pr-6', className: 'pr-6',
      render: (row) => <span className="font-mono font-bold text-slate-800 text-[12px]">{row.codAmount > 0 ? `$${row.codAmount.toFixed(2)}` : '—'}</span>,
    },
  ];

  return (
    <DashboardLayout
      role="merchant"
      title="Shipments Management"
      subtitle="Track, filter, and manage all consignments and deliveries in real time"
      primaryActionLabel="Create Shipment"
      onPrimaryAction={() => router.push('/dashboard/shipments/new')}
    >
      <div className="space-y-6 w-full font-sans">
        {/* ── Filter Bar ── */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1">
                  {STATUS_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>

              {/* Date Range Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date:</span>
                <select value={selectedDateRange} onChange={(e) => setSelectedDateRange(e.target.value)} className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1">
                  {DATE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>

              {/* COD Checkbox */}
              <div className="flex items-center pl-1">
                <Checkbox label="COD Only" checked={codOnly} onChange={(e) => setCodOnly(e.target.checked)} />
              </div>
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text" placeholder="Search tracking #, consignee, phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Active:</span>
              {activeChips.map((chip) => (
                <span key={chip.key} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <span>{chip.label}</span>
                  <button onClick={chip.onRemove} className="hover:text-primary/80 cursor-pointer" aria-label="Remove filter">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              ))}
              <button onClick={handleClearAll} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline ml-2 cursor-pointer">
                Clear All Filters
              </button>
            </div>
          )}
        </Card>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Loading shipments...</span>
            </div>
          </div>
        )}

        {/* ── Error State ── */}
        {error && !loading && (
          <Card className="p-8 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchShipments}>Retry</Button>
          </Card>
        )}

        {/* ── DataTable ── */}
        {!loading && !error && (
          <DataTable<ShipmentRow>
            data={filteredData}
            columns={columns}
            selectable={true}
            selectedKeys={selectedIds}
            onSelectionChange={setSelectedIds}
            rowKey="id"
            pageSize={10}
            emptyMessage={hasActiveFilters ? "No shipments match your filters. Try adjusting the status, date range, or search query." : "No shipments yet. Create your first shipment to get started."}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
