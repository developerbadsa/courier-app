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
import { DataTable, Column, StatusBadge } from '@/components/ui';

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
    avatarBg: 'bg-[#22C55E]',
    status: 'DELIVERED',
    codAmount: 45.0,
  },
  {
    id: 'SH-9081',
    consigneeName: 'Sara Ali',
    consigneeContact: 'sara.a@logistics.co',
    avatarInitials: 'SA',
    avatarBg: 'bg-[#334155]',
    status: 'IN_TRANSIT',
    codAmount: 120.0,
  },
  {
    id: 'SH-9080',
    consigneeName: 'John Doe',
    consigneeContact: 'john.doe@email.com',
    avatarInitials: 'JD',
    avatarBg: 'bg-[#93C5FD] text-[#1E3A8A]',
    status: 'PENDING',
    codAmount: 85.0,
  },
  {
    id: 'SH-9079',
    consigneeName: 'Layla Hassan',
    consigneeContact: '+971 50 123 4567',
    avatarInitials: 'LH',
    avatarBg: 'bg-[#1E293B]',
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
          className="font-mono text-[13px] font-bold text-slate-800 hover:text-blue-600 hover:underline transition-colors"
        >
          {row.id}
        </Link>
      ),
    },
    {
      key: 'consigneeName',
      header: 'CONSIGNEE',
      render: (row) => (
        <div className="flex items-center gap-3.5">
          <div
            className={`w-9 h-9 rounded-full ${row.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}
          >
            {row.avatarInitials}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[13.5px] leading-tight">
              {row.consigneeName}
            </p>
            <p className="text-xs text-slate-400 font-normal mt-0.5">
              {row.consigneeContact}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (row) => <StatusBadge status={row.status} size="md" />,
    },
    {
      key: 'codAmount',
      header: 'COD AMOUNT',
      align: 'right',
      headerClassName: 'pr-8',
      className: 'pr-8',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800 text-[13.5px]">
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
      <div className="space-y-7 w-full font-sans pb-12">
        {/* ── Top Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Shipments
            </h1>
            <p className="text-[14px] font-medium text-slate-500 mt-1">
              Manage and track your active deliveries
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard/shipments/new')}
            className="inline-flex items-center justify-center gap-2 bg-[#1D68F2] hover:bg-blue-700 text-white text-[13.5px] font-bold px-5 py-2.5 rounded-xl shadow-sm shadow-blue-600/25 transition-all active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>Create Shipment</span>
          </button>
        </div>

        {/* ── Soft Blue Filter Container (Figma Match) ── */}
        <div className="bg-[#EEF4FF] border border-[#DCE8FF] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                <span>Status</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white border border-slate-200/90 hover:border-slate-300 text-slate-800 text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                <span>Date Range</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <label className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-slate-700 cursor-pointer ml-1 select-none">
                <input
                  type="checkbox"
                  checked={codOnly}
                  onChange={(e) => setCodOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>COD Only</span>
              </label>
            </div>

            <div className="relative w-full md:w-84">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tracking #, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 shadow-xs transition-all font-medium"
              />
            </div>
          </div>

          {(statusFilterActive || dateFilterActive || codOnly) && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {statusFilterActive && (
                <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
                  <span>Status: In Transit</span>
                  <button
                    onClick={() => setStatusFilterActive(false)}
                    className="hover:text-blue-950 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

              {dateFilterActive && (
                <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
                  <span>Date: Last 7 Days</span>
                  <button
                    onClick={() => setDateFilterActive(false)}
                    className="hover:text-blue-950 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

              {codOnly && (
                <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1E40AF] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-2xs">
                  <span>COD Only</span>
                  <button
                    onClick={() => setCodOnly(false)}
                    className="hover:text-blue-950 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* ── Reusable Unified DataTable Component ── */}
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
