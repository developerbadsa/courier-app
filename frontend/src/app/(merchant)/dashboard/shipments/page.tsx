'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  ChevronDown,
  X,
  Calendar,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { DataTable, Column, StatusBadge, Button, Checkbox } from '@/components/ui';

/* ── Types ── */
interface ShipmentRow extends Record<string, unknown> {
  id: string;
  consigneeName: string;
  consigneeContact: string;
  avatarInitials: string;
  avatarBg: string;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'PENDING' | 'FAILED' | 'OUT_FOR_DELIVERY' | 'CANCELLED';
  codAmount: number;
  createdAt: string;
  dateObj: Date;
}

/* ── Status Options ── */
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

/* ── Date Range Options ── */
const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

/* ── Mock Data (realistic) ── */
const MOCK_SHIPMENTS: ShipmentRow[] = [
  { id: 'SH-9082', consigneeName: 'Omar Khalid', consigneeContact: 'omar.k@example.com', avatarInitials: 'OK', avatarBg: 'bg-emerald-500', status: 'DELIVERED', codAmount: 45.00, createdAt: 'Aug 20', dateObj: new Date('2026-08-20') },
  { id: 'SH-9081', consigneeName: 'Sara Ali', consigneeContact: 'sara.a@logistics.co', avatarInitials: 'SA', avatarBg: 'bg-slate-600', status: 'IN_TRANSIT', codAmount: 120.00, createdAt: 'Aug 20', dateObj: new Date('2026-08-20') },
  { id: 'SH-9080', consigneeName: 'John Doe', consigneeContact: 'john.doe@email.com', avatarInitials: 'JD', avatarBg: 'bg-blue-200 text-blue-800', status: 'PENDING', codAmount: 85.00, createdAt: 'Aug 19', dateObj: new Date('2026-08-19') },
  { id: 'SH-9079', consigneeName: 'Layla Hassan', consigneeContact: '+971 50 123 4567', avatarInitials: 'LH', avatarBg: 'bg-slate-800', status: 'FAILED', codAmount: 210.00, createdAt: 'Aug 19', dateObj: new Date('2026-08-19') },
  { id: 'SH-9078', consigneeName: 'Erik Lindqvist', consigneeContact: 'erik.l@company.se', avatarInitials: 'EL', avatarBg: 'bg-amber-500', status: 'OUT_FOR_DELIVERY', codAmount: 67.50, createdAt: 'Aug 18', dateObj: new Date('2026-08-18') },
  { id: 'SH-9077', consigneeName: 'Priya Sharma', consigneeContact: 'priya.s@email.com', avatarInitials: 'PS', avatarBg: 'bg-pink-500', status: 'DELIVERED', codAmount: 0, createdAt: 'Aug 18', dateObj: new Date('2026-08-18') },
  { id: 'SH-9076', consigneeName: 'Ahmed Rashid', consigneeContact: '+971 55 987 6543', avatarInitials: 'AR', avatarBg: 'bg-indigo-500', status: 'IN_TRANSIT', codAmount: 320.00, createdAt: 'Aug 17', dateObj: new Date('2026-08-17') },
  { id: 'SH-9075', consigneeName: 'Maria Garcia', consigneeContact: 'maria.g@mail.com', avatarInitials: 'MG', avatarBg: 'bg-teal-500', status: 'CANCELLED', codAmount: 0, createdAt: 'Aug 17', dateObj: new Date('2026-08-17') },
  { id: 'SH-9074', consigneeName: 'David Chen', consigneeContact: 'd.chen@work.com', avatarInitials: 'DC', avatarBg: 'bg-rose-500', status: 'DELIVERED', codAmount: 155.00, createdAt: 'Aug 16', dateObj: new Date('2026-08-16') },
  { id: 'SH-9073', consigneeName: 'Fatima Al-Sayed', consigneeContact: 'fatima.as@email.com', avatarInitials: 'FA', avatarBg: 'bg-cyan-600', status: 'PENDING', codAmount: 430.00, createdAt: 'Aug 16', dateObj: new Date('2026-08-16') },
  { id: 'SH-9072', consigneeName: 'Lucas Andersson', consigneeContact: 'lucas.a@se.se', avatarInitials: 'LA', avatarBg: 'bg-violet-500', status: 'IN_TRANSIT', codAmount: 89.90, createdAt: 'Aug 15', dateObj: new Date('2026-08-15') },
  { id: 'SH-9071', consigneeName: 'Nina Petrov', consigneeContact: 'nina.p@company.com', avatarInitials: 'NP', avatarBg: 'bg-orange-500', status: 'DELIVERED', codAmount: 25.00, createdAt: 'Aug 14', dateObj: new Date('2026-08-14') },
];

/* ────────────────────────────────────────────────────────────────
 *  Dropdown Popover Component
 * ──────────────────────────────────────────────────────────────── */
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  icon: Icon,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = selected.length > 0;
  const displayText = isActive
    ? selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? label
      : `${selected.length} selected`
    : label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          inline-flex items-center gap-1.5 border text-[12px] font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer
          ${isActive
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }
        `}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span>{displayText}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-lg z-50 py-1">
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className="w-full flex items-center justify-between px-3 py-2 text-[12px] text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
 *  Shipments Page
 * ──────────────────────────────────────────────────────────────── */
export default function ShipmentsPage() {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string[]>([]);
  const [codOnly, setCodOnly] = useState(false);

  /* ── Filter logic ── */
  const filteredData = useMemo(() => {
    let result = MOCK_SHIPMENTS;

    // Status filter
    if (selectedStatuses.length > 0) {
      result = result.filter((r) => selectedStatuses.includes(r.status));
    }

    // Date range filter
    if (selectedDateRange.length > 0 && !selectedDateRange.includes('all')) {
      const now = new Date('2026-08-20');
      result = result.filter((r) => {
        return selectedDateRange.some((range) => {
          const diff = (now.getTime() - r.dateObj.getTime()) / (1000 * 60 * 60 * 24);
          if (range === 'today') return diff < 1;
          if (range === '7d') return diff <= 7;
          if (range === '30d') return diff <= 30;
          if (range === '90d') return diff <= 90;
          return true;
        });
      });
    }

    // COD Only filter
    if (codOnly) {
      result = result.filter((r) => r.codAmount > 0);
    }

    // Search filter
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
  }, [selectedStatuses, selectedDateRange, codOnly, searchQuery]);

  /* ── Toggle helpers ── */
  const toggleStatus = (value: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleDateRange = (value: string) => {
    setSelectedDateRange((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleClearAll = () => {
    setSelectedStatuses([]);
    setSelectedDateRange([]);
    setCodOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedDateRange.length > 0 || codOnly;

  /* ── Active filter chips ── */
  const activeChips = [
    ...selectedStatuses.map((s) => ({
      key: `status-${s}`,
      label: `Status: ${STATUS_OPTIONS.find((o) => o.value === s)?.label}`,
      onRemove: () => toggleStatus(s),
    })),
    ...selectedDateRange.map((d) => ({
      key: `date-${d}`,
      label: `Date: ${DATE_OPTIONS.find((o) => o.value === d)?.label}`,
      onRemove: () => toggleDateRange(d),
    })),
    ...(codOnly
      ? [{ key: 'cod', label: 'COD Only', onRemove: () => setCodOnly(false) }]
      : []),
  ];

  /* ── Columns ── */
  const columns: Column<ShipmentRow>[] = [
    {
      key: 'id',
      header: 'TRACKING #',
      sortable: true,
      accessor: (r) => r.id,
      render: (row) => (
        <Link
          href={`/dashboard/shipments/${row.id}`}
          className="font-mono text-[12px] font-bold text-slate-800 hover:text-primary hover:underline transition-colors"
        >
          {row.id}
        </Link>
      ),
    },
    {
      key: 'consigneeName',
      header: 'CONSIGNEE',
      sortable: true,
      accessor: (r) => r.consigneeName,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${row.avatarBg} text-white flex items-center justify-center font-bold text-[11px] shrink-0`}
          >
            {row.avatarInitials}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[13px] leading-tight">
              {row.consigneeName}
            </p>
            <p className="text-[11px] text-slate-400 font-normal mt-0.5">
              {row.consigneeContact}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      accessor: (r) => r.status,
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'DATE',
      sortable: true,
      accessor: (r) => r.createdAt,
      render: (row) => (
        <span className="text-[12px] text-slate-500">{row.createdAt}</span>
      ),
    },
    {
      key: 'codAmount',
      header: 'COD',
      align: 'right',
      sortable: true,
      accessor: (r) => r.codAmount,
      headerClassName: 'pr-6',
      className: 'pr-6',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 text-[12px]">
          {row.codAmount > 0 ? `$${row.codAmount.toFixed(2)}` : '—'}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout role="merchant">
      <div className="space-y-4 w-full font-sans pb-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Shipments
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredData.length} shipment{filteredData.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' (filtered)' : ''}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push('/dashboard/shipments/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Shipment
          </Button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-primary/5 border border-primary/10 rounded p-3 sm:p-4 space-y-2.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown
                label="Status"
                options={STATUS_OPTIONS}
                selected={selectedStatuses}
                onToggle={toggleStatus}
              />

              <FilterDropdown
                label="Date Range"
                options={DATE_OPTIONS}
                selected={selectedDateRange}
                onToggle={toggleDateRange}
                icon={Calendar}
              />

              <Checkbox
                label="COD Only"
                checked={codOnly}
                onChange={(e) => setCodOnly(e.target.checked)}
              />
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tracking #, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:text-primary/70 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline ml-1 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── DataTable ── */}
        <DataTable<ShipmentRow>
          data={filteredData}
          columns={columns}
          selectable={true}
          selectedKeys={selectedIds}
          onSelectionChange={setSelectedIds}
          rowKey="id"
          pageSize={10}
          emptyMessage="No shipments match your filters. Try adjusting the status or date range."
        />
      </div>
    </DashboardLayout>
  );
}
