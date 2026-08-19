'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Plus,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, DataTable, Column, Tabs, StatusBadge } from '@/components/ui';

interface Shipment {
  id: string;
  consignee: string;
  phone: string;
  destination: string;
  category: string;
  weight: string;
  cod: number;
  status: string;
  createdAt: string;
}

const ALL_SHIPMENTS: Shipment[] = [
  { id: 'SHN-98421-US', consignee: 'Alexander Wright', phone: '+1 (512) 492-8190', destination: 'Austin, TX', category: 'Electronics', weight: '2.4 kg', cod: 64.5, status: 'IN_TRANSIT', createdAt: '12 min ago' },
  { id: 'SHN-98422-US', consignee: 'Sophia Martinez', phone: '+1 (305) 881-2309', destination: 'Miami, FL', category: 'Apparel', weight: '1.1 kg', cod: 120, status: 'OUT_FOR_DELIVERY', createdAt: '45 min ago' },
  { id: 'SHN-98423-US', consignee: 'Marcus Vance', phone: '+1 (206) 714-9921', destination: 'Seattle, WA', category: 'Documents', weight: '0.5 kg', cod: 32, status: 'DELIVERED', createdAt: '2h ago' },
  { id: 'SHN-98424-US', consignee: 'Emily Thornton', phone: '+1 (415) 309-1184', destination: 'San Francisco, CA', category: 'Health & Beauty', weight: '3.0 kg', cod: 89.9, status: 'PENDING', createdAt: '3h ago' },
  { id: 'SHN-98425-US', consignee: 'Liam Davis', phone: '+1 (773) 612-4091', destination: 'Chicago, IL', category: 'General', weight: '4.5 kg', cod: 215, status: 'PICKED_UP', createdAt: '4h ago' },
  { id: 'SHN-98426-US', consignee: 'Olivia Brown', phone: '+1 (404) 991-3412', destination: 'Atlanta, GA', category: 'Automotive', weight: '5.2 kg', cod: 150.0, status: 'IN_TRANSIT', createdAt: '5h ago' },
  { id: 'SHN-98427-US', consignee: 'Ethan Hunt', phone: '+1 (212) 808-7654', destination: 'New York, NY', category: 'Electronics', weight: '1.8 kg', cod: 310.0, status: 'DELIVERED', createdAt: '6h ago' },
];

const STATUS_TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending Dispatch' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

export default function ShipmentsListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = activeTab === 'all' 
    ? ALL_SHIPMENTS 
    : ALL_SHIPMENTS.filter((s) => s.status === activeTab);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'id',
      header: 'Tracking ID',
      sortable: true,
      accessor: (r) => r.id as string,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/track?id=${row.id}`}
            className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.id as string}
          </Link>
          <button
            onClick={() => handleCopy(row.id as string)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded"
            title="Copy ID"
          >
            {copiedId === row.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      ),
    },
    {
      key: 'consignee',
      header: 'Recipient',
      sortable: true,
      accessor: (r) => r.consignee as string,
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-slate-900">{row.consignee as string}</p>
          <p className="text-xs text-slate-500">{row.phone as string}</p>
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      sortable: true,
      accessor: (r) => r.destination as string,
      render: (row) => <span className="text-xs text-slate-700 font-medium">{row.destination as string}</span>,
    },
    {
      key: 'category',
      header: 'Package',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800">{row.category as string}</span>
          <p className="text-[11px] text-slate-400">{row.weight as string}</p>
        </div>
      ),
    },
    {
      key: 'cod',
      header: 'COD Amount',
      sortable: true,
      accessor: (r) => r.cod as number,
      render: (row) => (
        <span className="text-sm font-bold text-slate-900">
          ${(row.cod as number).toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USD</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (r) => r.status as string,
      render: (row) => <StatusBadge status={row.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Link
            href={`/track?id=${row.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Track Live"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      role="merchant"
      title="Shipments Management"
      subtitle="Track, filter, and manage domestic and international dispatched packages"
      primaryActionLabel="Book New Shipment"
      onPrimaryAction={() => router.push('/dashboard/shipments/new')}
    >
      <div className="space-y-6">
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />
          
          <div className="flex items-center space-x-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/shipments/new')}
              className="hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Book Parcel
            </Button>
          </div>
        </div>

        {/* Shipments Data Table */}
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          columns={columns}
          searchable
          searchPlaceholder="Search by tracking number, recipient, city..."
          searchKeys={['id', 'consignee', 'destination', 'category']}
          pageSize={10}
          emptyMessage="No shipments found for this status."
        />
      </div>
    </DashboardLayout>
  );
}
