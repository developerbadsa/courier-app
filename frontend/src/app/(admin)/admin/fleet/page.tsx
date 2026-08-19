'use client';

import React, { useState } from 'react';
import {
  Truck,
  User,
  MapPin,
  Package,
  Phone,
  Edit2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Bike,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge, StatusBadge } from '@/components/ui';

/* ── Types ── */
interface Rider {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'Bike' | 'Van' | 'Truck';
  isOnDuty: boolean;
  hubName: string;
  totalDeliveries: number;
  successRate: number;
  avgDeliveryTime: number;
  codCollected: number;
  lastActive: string;
}

/* ── Mock Data ── */
const MOCK_RIDERS: Rider[] = [
  { id: 'R001', name: 'Marcus Thompson', phone: '+1 512-555-0101', email: 'marcus@shohnaat.com', vehicleType: 'Van', isOnDuty: true, hubName: 'HQ-001 Austin', totalDeliveries: 1247, successRate: 98.2, avgDeliveryTime: 1.8, codCollected: 45200, lastActive: '2 min ago' },
  { id: 'R002', name: 'Aisha Patel', phone: '+1 305-555-0202', email: 'aisha@shohnaat.com', vehicleType: 'Bike', isOnDuty: true, hubName: 'MIA-002 Miami', totalDeliveries: 892, successRate: 96.8, avgDeliveryTime: 1.2, codCollected: 28900, lastActive: '5 min ago' },
  { id: 'R003', name: 'Derek Williams', phone: '+1 206-555-0303', email: 'derek@shohnaat.com', vehicleType: 'Truck', isOnDuty: true, hubName: 'SEA-003 Seattle', totalDeliveries: 634, successRate: 97.5, avgDeliveryTime: 2.4, codCollected: 67800, lastActive: '12 min ago' },
  { id: 'R004', name: 'Sofia Garcia', phone: '+1 512-555-0404', email: 'sofia@shohnaat.com', vehicleType: 'Bike', isOnDuty: false, hubName: 'HQ-001 Austin', totalDeliveries: 543, successRate: 99.1, avgDeliveryTime: 1.0, codCollected: 12300, lastActive: 'Yesterday' },
  { id: 'R005', name: 'James Rodriguez', phone: '+1 312-555-0505', email: 'james@shohnaat.com', vehicleType: 'Van', isOnDuty: true, hubName: 'CHI-004 Chicago', totalDeliveries: 321, successRate: 95.3, avgDeliveryTime: 2.1, codCollected: 18700, lastActive: '8 min ago' },
  { id: 'R006', name: 'Kenji Tanaka', phone: '+1 512-555-0606', email: 'kenji@shohnaat.com', vehicleType: 'Truck', isOnDuty: false, hubName: 'HQ-001 Austin', totalDeliveries: 1102, successRate: 98.8, avgDeliveryTime: 2.6, codCollected: 89400, lastActive: '2 days ago' },
  { id: 'R007', name: 'Fatima Al-Hassan', phone: '+1 305-555-0707', email: 'fatima@shohnaat.com', vehicleType: 'Bike', isOnDuty: true, hubName: 'MIA-002 Miami', totalDeliveries: 678, successRate: 97.2, avgDeliveryTime: 1.1, codCollected: 21500, lastActive: '3 min ago' },
  { id: 'R008', name: 'Trevor Washington', phone: '+1 206-555-0808', email: 'trevor@shohnaat.com', vehicleType: 'Van', isOnDuty: true, hubName: 'SEA-003 Seattle', totalDeliveries: 456, successRate: 96.0, avgDeliveryTime: 1.9, codCollected: 34200, lastActive: '7 min ago' },
];

const VEHICLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bike: Bike,
  Van: Truck,
  Truck: Package,
};

export default function FleetPage() {
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [filter, setFilter] = useState<'all' | 'on-duty' | 'off-duty' | 'bike' | 'van' | 'truck'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicleType: 'Van' as Rider['vehicleType'], hubName: '' });

  const filtered = riders.filter((r) => {
    if (filter === 'on-duty') return r.isOnDuty;
    if (filter === 'off-duty') return !r.isOnDuty;
    if (filter === 'bike') return r.vehicleType === 'Bike';
    if (filter === 'van') return r.vehicleType === 'Van';
    if (filter === 'truck') return r.vehicleType === 'Truck';
    return true;
  });

  const stats = {
    total: riders.length,
    onDuty: riders.filter((r) => r.isOnDuty).length,
    bikes: riders.filter((r) => r.vehicleType === 'Bike').length,
    vans: riders.filter((r) => r.vehicleType === 'Van').length,
    trucks: riders.filter((r) => r.vehicleType === 'Truck').length,
    totalDeliveries: riders.reduce((s, r) => s + r.totalDeliveries, 0),
    avgSuccessRate: Math.round(riders.reduce((s, r) => s + r.successRate, 0) / riders.length * 10) / 10,
    totalCOD: riders.reduce((s, r) => s + r.codCollected, 0),
  };

  const openCreate = () => {
    setEditingRider(null);
    setForm({ name: '', phone: '', email: '', vehicleType: 'Van', hubName: '' });
    setModalOpen(true);
  };

  const openEdit = (rider: Rider) => {
    setEditingRider(rider);
    setForm({ name: rider.name, phone: rider.phone, email: rider.email, vehicleType: rider.vehicleType, hubName: rider.hubName });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingRider) {
      setRiders((prev) => prev.map((r) => (r.id === editingRider.id ? { ...r, ...form } : r)));
    } else {
      setRiders((prev) => [...prev, { ...form, id: `R${Date.now()}`, isOnDuty: false, totalDeliveries: 0, successRate: 0, avgDeliveryTime: 0, codCollected: 0, lastActive: 'Never' }]);
    }
    setModalOpen(false);
  };

  const toggleDuty = (riderId: string) => {
    setRiders((prev) => prev.map((r) => r.id === riderId ? { ...r, isOnDuty: !r.isOnDuty } : r));
  };

  const columns: Column<Rider>[] = [
    {
      key: 'name', header: 'Rider', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${row.isOnDuty ? 'bg-emerald-500' : 'bg-slate-300'}`}>
            {row.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-400 font-mono">{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (row) => <span className="flex items-center gap-1 text-slate-600 text-sm"><Phone className="w-3 h-3" /> {row.phone}</span> },
    {
      key: 'vehicleType', header: 'Vehicle', sortable: true, accessor: (r) => r.vehicleType,
      render: (row) => {
        const Icon = VEHICLE_ICONS[row.vehicleType] || Truck;
        return (
          <Badge variant={row.vehicleType === 'Truck' ? 'purple' : row.vehicleType === 'Van' ? 'blue' : 'amber'} size="sm">
            <Icon className="w-3 h-3 mr-1 inline" /> {row.vehicleType}
          </Badge>
        );
      }
    },
    { key: 'hubName', header: 'Hub', render: (row) => <span className="flex items-center gap-1 text-slate-600 text-sm"><MapPin className="w-3 h-3" /> {row.hubName}</span> },
    { key: 'totalDeliveries', header: 'Deliveries', sortable: true, accessor: (r) => r.totalDeliveries as unknown as string, render: (row) => <span className="font-semibold text-slate-900">{row.totalDeliveries.toLocaleString()}</span> },
    {
      key: 'successRate', header: 'Success', sortable: true, accessor: (r) => r.successRate as unknown as string,
      render: (row) => (
        <span className={`font-semibold ${row.successRate >= 98 ? 'text-emerald-600' : row.successRate >= 96 ? 'text-amber-600' : 'text-red-600'}`}>
          {row.successRate}%
        </span>
      )
    },
    { key: 'avgDeliveryTime', header: 'Avg Time', sortable: true, accessor: (r) => r.avgDeliveryTime as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-600"><Clock className="w-3 h-3" /> {row.avgDeliveryTime}h</span> },
    { key: 'codCollected', header: 'COD Collected', sortable: true, accessor: (r) => r.codCollected as unknown as string, render: (row) => <span className="font-mono font-semibold text-slate-900">${row.codCollected.toLocaleString()}</span> },
    { key: 'lastActive', header: 'Last Active', sortable: true, accessor: (r) => r.lastActive, render: (row) => <span className="text-slate-500 text-sm">{row.lastActive}</span> },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <Badge variant={row.isOnDuty ? 'green' : 'default'} size="sm" dot>{row.isOnDuty ? 'On Duty' : 'Off Duty'}</Badge>
      )
    },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); toggleDuty(row.id); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title={row.isOnDuty ? 'Go Off Duty' : 'Go On Duty'}>
            {row.isOnDuty ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Fleet & Rider Management" subtitle="Track rider activity, vehicle assignments, and delivery performance" primaryActionLabel="Add Rider" onPrimaryAction={openCreate}>
      {/* Fleet Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><Truck className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Total Riders</div>
              <div className="text-lg font-bold text-slate-900">{stats.total}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">On Duty</div>
              <div className="text-lg font-bold text-slate-900">{stats.onDuty}/{stats.total}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600"><BarChart3 className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Success Rate</div>
              <div className="text-lg font-bold text-slate-900">{stats.avgSuccessRate}%</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600"><Package className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Total COD</div>
              <div className="text-lg font-bold text-slate-900">${stats.totalCOD.toLocaleString()}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Vehicle Breakdown */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-slate-400" />
        {(['all', 'on-duty', 'off-duty', 'bike', 'van', 'truck'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${filter === f ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            {f === 'all' ? `All (${stats.total})` : f === 'on-duty' ? `On Duty (${stats.onDuty})` : f === 'off-duty' ? `Off Duty (${stats.total - stats.onDuty})` : f === 'bike' ? `🏍️ Bike (${stats.bikes})` : f === 'van' ? `🚐 Van (${stats.vans})` : `🚛 Truck (${stats.trucks})`}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable searchPlaceholder="Search riders by name, phone, hub..." searchKeys={['name', 'phone', 'hubName']}
        pageSize={10}
        emptyMessage="No riders found."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRider ? 'Edit Rider' : 'Add New Rider'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>{editingRider ? 'Save Changes' : 'Add Rider'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" placeholder="e.g. +1 512-555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" placeholder="e.g. john@shohnaat.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Assigned Hub" placeholder="e.g. HQ-001 Austin" value={form.hubName} onChange={(e) => setForm({ ...form, hubName: e.target.value })} />
          <div>
            <label className="text-[13px] font-semibold text-slate-700 mb-2 block">Vehicle Type</label>
            <div className="flex gap-2">
              {(['Bike', 'Van', 'Truck'] as const).map((v) => (
                <button key={v} onClick={() => setForm({ ...form, vehicleType: v })} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-colors ${form.vehicleType === v ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  {v === 'Bike' ? '🏍️' : v === 'Van' ? '🚐' : '🚛'} {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
