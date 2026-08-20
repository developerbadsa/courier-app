'use client';

import React, { useState } from 'react';
import {
  Truck, Plus, MapPin, Calendar, Package, Clock, CheckCircle,
  XCircle, AlertTriangle, User, ArrowLeft, Eye,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Tabs, Badge, StatusBadge, Modal } from '@/components/ui';

/* ── Types ── */
interface PickupRequest {
  id: string;
  address: string;
  addressLabel: string;
  city: string;
  requestedDate: string;
  timeSlot: string;
  parcelCount: number;
  vehicleType: string;
  driverNotes: string;
  status: string;
  riderName: string | null;
  createdAt: string;
}

/* ── Mock Data ── */
const MOCK_PICKUPS: PickupRequest[] = [
  {
    id: 'PK-001', address: '1200 Logistics Blvd, Dock #3', addressLabel: 'Main Warehouse',
    city: 'Austin, TX', requestedDate: 'Today, Aug 20', timeSlot: 'Morning (8AM–12PM)',
    parcelCount: 18, vehicleType: 'Van', driverNotes: 'Use loading dock entrance',
    status: 'ASSIGNED', riderName: 'David Miller', createdAt: '2h ago',
  },
  {
    id: 'PK-002', address: '456 Congress Ave, Suite 100', addressLabel: 'Downtown Store',
    city: 'Austin, TX', requestedDate: 'Today, Aug 20', timeSlot: 'Afternoon (1PM–5PM)',
    parcelCount: 5, vehicleType: 'Bike', driverNotes: 'Ring bell at front desk',
    status: 'PENDING', riderName: null, createdAt: '4h ago',
  },
  {
    id: 'PK-003', address: '3400 Comanche Trail', addressLabel: 'Weekend Warehouse',
    city: 'Austin, TX', requestedDate: 'Tomorrow, Aug 21', timeSlot: 'Morning (8AM–12PM)',
    parcelCount: 24, vehicleType: 'Truck', driverNotes: 'Call ahead for large shipment',
    status: 'PENDING', riderName: null, createdAt: 'Yesterday',
  },
  {
    id: 'PK-004', address: '1200 Logistics Blvd, Dock #3', addressLabel: 'Main Warehouse',
    city: 'Austin, TX', requestedDate: 'Aug 18', timeSlot: 'Morning (8AM–12PM)',
    parcelCount: 12, vehicleType: 'Van', driverNotes: '',
    status: 'COMPLETED', riderName: 'Sarah Johnson', createdAt: 'Aug 17',
  },
  {
    id: 'PK-005', address: '456 Congress Ave, Suite 100', addressLabel: 'Downtown Store',
    city: 'Austin, TX', requestedDate: 'Aug 17', timeSlot: 'Afternoon (1PM–5PM)',
    parcelCount: 3, vehicleType: 'Bike', driverNotes: 'Small items only',
    status: 'COMPLETED', riderName: 'Mike Chen', createdAt: 'Aug 16',
  },
];

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'COMPLETED', label: 'Completed' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'PENDING',
  APPROVED: 'PENDING',
  ASSIGNED: 'IN_TRANSIT',
  COMPLETED: 'DELIVERED',
  REJECTED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const VEHICLE_ICONS: Record<string, string> = {
  Bike: '🏍️',
  Van: '🚐',
  Truck: '🚛',
};

/* ── Page ── */
export default function PickupsPage() {
  const [pickups] = useState<PickupRequest[]>(MOCK_PICKUPS);
  const [activeTab, setActiveTab] = useState('all');
  const [detailModal, setDetailModal] = useState<PickupRequest | null>(null);

  const filtered = activeTab === 'all' ? pickups : pickups.filter((p) => p.status === activeTab);
  const summary = {
    pending: pickups.filter((p) => p.status === 'PENDING').length,
    assigned: pickups.filter((p) => p.status === 'ASSIGNED').length,
    completed: pickups.filter((p) => p.status === 'COMPLETED').length,
  };

  const columns: Column<PickupRequest>[] = [
    {
      key: 'id', header: 'Pickup ID', sortable: true, accessor: (r) => r.id,
      render: (row) => (
        <div>
          <div className="font-mono text-xs font-bold text-blue-600">{row.id}</div>
          <div className="text-[10px] text-slate-400">{row.createdAt}</div>
        </div>
      ),
    },
    {
      key: 'address', header: 'Location',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-900">{row.addressLabel}</div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <MapPin className="w-3 h-3" /> {row.city}
          </div>
        </div>
      ),
    },
    {
      key: 'requestedDate', header: 'Scheduled',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
            <Calendar className="w-3 h-3 text-slate-400" /> {row.requestedDate}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" /> {row.timeSlot}
          </div>
        </div>
      ),
    },
    {
      key: 'parcelCount', header: 'Parcels', sortable: true, accessor: (r) => r.parcelCount as unknown as string,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
          <Package className="w-3 h-3 text-slate-400" /> {row.parcelCount}
        </span>
      ),
    },
    {
      key: 'vehicleType', header: 'Vehicle',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">
          {VEHICLE_ICONS[row.vehicleType] || '🚗'} {row.vehicleType}
        </span>
      ),
    },
    {
      key: 'rider', header: 'Rider',
      render: (row) => row.riderName
        ? <span className="flex items-center gap-1 text-xs font-medium text-slate-700"><User className="w-3 h-3" /> {row.riderName}</span>
        : <span className="text-[11px] text-slate-400 italic">Unassigned</span>,
    },
    {
      key: 'status', header: 'Status',
      render: (row) => <StatusBadge status={STATUS_BADGE[row.status] || row.status} size="sm" />,
    },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDetailModal(row); }}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout
      role="merchant"
      title="Pickup Requests"
      subtitle="Schedule and manage parcel pickup requests from your warehouses"
      primaryActionLabel="New Pickup"
      onPrimaryAction={() => window.location.href = '/dashboard/pickups/new'}
    >
      <div className="mb-2">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{summary.pending}</div>
            <div className="text-[11px] text-slate-500 font-medium">Pending</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{summary.assigned}</div>
            <div className="text-[11px] text-slate-500 font-medium">Assigned</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{summary.completed}</div>
            <div className="text-[11px] text-slate-500 font-medium">Completed</div>
          </div>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Tabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} className="mb-0" />

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable
        searchPlaceholder="Search pickups..."
        searchKeys={['id', 'addressLabel', 'city', 'riderName']}
        pageSize={10}
        emptyMessage="No pickup requests match this filter."
        headerRight={<Badge variant="blue" size="sm">{filtered.length} pickups</Badge>}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Pickup ${detailModal?.id || ''}`}
        footer={
          <Button variant="outline" size="sm" onClick={() => setDetailModal(null)}>Close</Button>
        }
      >
        {detailModal && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Location</div>
                <div className="text-xs font-semibold text-slate-900 mt-0.5">{detailModal.addressLabel}</div>
                <div className="text-[11px] text-slate-500">{detailModal.address}, {detailModal.city}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Schedule</div>
                <div className="text-xs font-semibold text-slate-900 mt-0.5">{detailModal.requestedDate}</div>
                <div className="text-[11px] text-slate-500">{detailModal.timeSlot}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-lg font-bold text-slate-900">{detailModal.parcelCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Parcels</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-lg font-bold text-slate-900">{VEHICLE_ICONS[detailModal.vehicleType]} {detailModal.vehicleType}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Vehicle</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
                <div className="text-sm font-bold text-slate-900">{detailModal.riderName || '—'}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Rider</div>
              </div>
            </div>
            {detailModal.driverNotes && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">Driver Notes</div>
                <div className="text-xs text-blue-700">{detailModal.driverNotes}</div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Status:</span>
              <StatusBadge status={STATUS_BADGE[detailModal.status] || detailModal.status} size="sm" />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
