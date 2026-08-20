'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  ChevronDown,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { DataTable, Column, StatusBadge, Button, Input, Checkbox } from '@/components/ui';

interface ShipmentRow extends Record<string, unknown> {
  id: string;
  consigneeName: string;
  consigneeContact: string;
  avatarInitials: string;
  avatarBg: string;
  status: 'DELIVERED' | 'IN_TRANSIT' | 'PENDING' | 'FAILED';
  codAmount: number;
}

const FIGMA_EXACT_SHIPMENTS: ShipmentRow[] = [
  {
    id: 'SH-9082',
    consigneeName: 'Omar Khalid',
    consigneeContact: 'omar.k@example.com',
    avatarInitials: 'OK',
    avatarBg: 'bg-emerald-500',
    status: 'DELIVERED',
    codAmount: 45.0,
  },
  {
    id: 'SH-9081',
    consigneeName: 'Sara Ali',
    consigneeContact: 'sara.a@logistics.co',
    avatarInitials: 'SA',
    avatarBg: 'bg-slate-600',
    status: 'IN_TRANSIT',
    codAmount: 120.0,
  },
  {
    id: 'SH-9080',
    consigneeName: 'John Doe',
    consigneeContact: 'john.doe@email.com',
    avatarInitials: 'JD',
    avatarBg: 'bg-blue-200 text-blue-800',
    status: 'PENDING',
    codAmount: 85.0,
  },
  {
    id: 'SH-9079',
    consigneeName: 'Layla Hassan',
    consigneeContact: '+971 50 123 4567',
    avatarInitials: 'LH',
    avatarBg: 'bg-slate-800',
    status: 'FAILED',
    codAmount: 210.0,
  },
];

export default function ShipmentsPage() {
  const router = useRouter();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilterActive, setStatusFilterActive] = useState(true);
  const [dateFilterActive, setDateFilterActive] = useState(true);
  const [codOnly, setCodOnly] = useState(false);

  const columns: Column<ShipmentRow>[] = [
    {
      key: 'id',
      header: 'TRACKING NUMBER',
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
      render: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'codAmount',
      header: 'COD AMOUNT',
      align: 'right',
      headerClassName: 'pr-6',
      className: 'pr-6',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 text-[12px]">
          ${row.codAmount.toFixed(2)}
        </span>
      ),
    },
  ];

  const handleClearAll = () => {
    setStatusFilterActive(false);
    setDateFilterActive(false);
    setCodOnly(false);
    setSearchQuery('');
  };

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
              Manage and track your active deliveries
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
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[12px] font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <span>Status</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[12px] font-semibold px-3 py-1.5 rounded transition-colors"
              >
                <span>Date Range</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

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
            </div>
          </div>

          {(statusFilterActive || dateFilterActive || codOnly) && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {statusFilterActive && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span>Status: In Transit</span>
                  <button
                    onClick={() => setStatusFilterActive(false)}
                    className="hover:text-primary/70 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

              {dateFilterActive && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span>Date: Last 7 Days</span>
                  <button
                    onClick={() => setDateFilterActive(false)}
                    className="hover:text-primary/70 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

              {codOnly && (
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full">
                  <span>COD Only</span>
                  <button
                    onClick={() => setCodOnly(false)}
                    className="hover:text-primary/70 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

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
          data={FIGMA_EXACT_SHIPMENTS}
          columns={columns}
          selectable={true}
          selectedKeys={selectedIds}
          onSelectionChange={setSelectedIds}
          rowKey="id"
          pageSize={10}
        />
      </div>
    </DashboardLayout>
  );
}
