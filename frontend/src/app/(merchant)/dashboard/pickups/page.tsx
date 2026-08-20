'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, Bike, Plus, MapPin, Calendar, Package, Clock, CheckCircle,
  XCircle, AlertTriangle, User, ArrowLeft, Eye,
} from 'lucide-react';


import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Tabs, Badge, StatusBadge, Modal } from '@/components/ui';
import { api } from '@/lib/api';

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

const renderVehicle = (type: string) => {
  switch (type) {
    case 'Bike':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Bike className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Bike
        </span>
      );
    case 'Van':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Van
        </span>
      );
    case 'Truck':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> Truck
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" /> {type}
        </span>
      );
  }
};

/* ── Page ── */
export default function PickupsPage() {
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [detailModal, setDetailModal] = useState<PickupRequest | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      let apiItems: PickupRequest[] = [];
      try {
        const res = await api.get('/api/v1/pickups');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          apiItems = res.data.data.map((item: any) => ({
            id: item.id?.startsWith('PK-') ? item.id : `PK-${item.id?.slice(-4).toUpperCase() || '001'}`,
            address: item.pickupAddress?.line1 || item.address || 'Main Warehouse',
            addressLabel: item.pickupAddress?.label || item.addressLabel || 'Main Warehouse',
            city: item.pickupAddress?.city || item.city || 'Austin, TX',
            requestedDate: item.requestedDate ? new Date(item.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
            timeSlot: item.timeSlot || 'Morning (8AM–12PM)',
            parcelCount: item.parcelCount || 1,
            vehicleType: item.vehicleType || 'Van',
            driverNotes: item.driverNotes || '',
            status: item.status || 'PENDING',
            riderName: item.assignments?.[0]?.rider?.user?.name || item.riderName || null,
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
          }));
        }
      } catch {
        // Fallback
      }

      let localPickups: PickupRequest[] = [];
      try {
        const stored = localStorage.getItem('shohnaat_custom_pickups');
        if (stored) localPickups = JSON.parse(stored);
      } catch {}

      if (isMounted) {
        const seen = new Set<string>();
        const combined = [...localPickups, ...apiItems].filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setPickups(combined);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);


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
            <MapPin className="w-3 h-3 text-slate-400" /> {row.city}
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
            <Clock className="w-3 h-3 text-slate-400" /> {row.timeSlot}
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
      render: (row) => renderVehicle(row.vehicleType),
    },
    {
      key: 'rider', header: 'Rider',
      render: (row) => row.riderName
        ? <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700"><User className="w-3 h-3 text-slate-400" /> {row.riderName}</span>
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
                <div className="text-sm font-bold text-slate-900 flex justify-center items-center gap-1 mt-1">{renderVehicle(detailModal.vehicleType)}</div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Vehicle</div>
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
