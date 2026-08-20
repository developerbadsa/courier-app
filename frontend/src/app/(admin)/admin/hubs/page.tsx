'use client';

import React, { useState } from 'react';
import { Building2, Plus, MapPin, Users, Package, Edit2, Trash2, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge, StatusBadge } from '@/components/ui';

interface Hub {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  isHub: boolean;
  isActive: boolean;
  staffCount: number;
  shipmentCount: number;
  manager: string;
  zones: string[];
  capacity: number;
  utilization: number;
  avgProcessingHrs: number;
}

const MOCK_HUBS: Hub[] = [
  { id: '1', name: 'Headquarters Hub', code: 'HQ-001', city: 'Austin, TX', address: '100 Logistics Blvd', isHub: true, isActive: true, staffCount: 24, shipmentCount: 1840, manager: 'Sarah Chen', zones: ['Downtown', 'North', 'East'], capacity: 5000, utilization: 78, avgProcessingHrs: 2.1 },
  { id: '2', name: 'Miami Sorting Center', code: 'MIA-002', city: 'Miami, FL', address: '500 Port Ave', isHub: true, isActive: true, staffCount: 18, shipmentCount: 920, manager: 'Carlos Rivera', zones: ['South Beach', 'Doral', 'Coral Gables'], capacity: 3000, utilization: 65, avgProcessingHrs: 2.8 },
  { id: '3', name: 'Seattle Distribution', code: 'SEA-003', city: 'Seattle, WA', address: '300 Terminal Dr', isHub: true, isActive: true, staffCount: 12, shipmentCount: 640, manager: 'Emily Wong', zones: ['Capitol Hill', 'Ballard', 'Redmond'], capacity: 2500, utilization: 52, avgProcessingHrs: 3.2 },
  { id: '4', name: 'Chicago Satellite', code: 'CHI-004', city: 'Chicago, IL', address: '800 Industrial Park', isHub: false, isActive: false, staffCount: 6, shipmentCount: 210, manager: 'Mike Johnson', zones: ['Loop', 'Lincoln Park'], capacity: 1500, utilization: 35, avgProcessingHrs: 4.5 },
];

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>(MOCK_HUBS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [detailModal, setDetailModal] = useState<Hub | null>(null);
  const [form, setForm] = useState({ name: '', code: '', city: '', address: '', isHub: true, manager: '', zones: '' });

  const openCreate = () => {
    setEditingHub(null);
    setForm({ name: '', code: '', city: '', address: '', isHub: true, manager: '', zones: '' });
    setModalOpen(true);
  };

  const openEdit = (hub: Hub) => {
    setEditingHub(hub);
    setForm({ name: hub.name, code: hub.code, city: hub.city, address: hub.address, isHub: hub.isHub, manager: hub.manager, zones: hub.zones.join(', ') });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingHub) {
      setHubs((prev) => prev.map((h) => (h.id === editingHub.id ? { ...h, ...form, zones: form.zones.split(',').map(z => z.trim()).filter(Boolean) } : h)));
    } else {
      setHubs((prev) => [...prev, { ...form, id: String(Date.now()), isActive: true, staffCount: 0, shipmentCount: 0, zones: form.zones.split(',').map(z => z.trim()).filter(Boolean), capacity: 2000, utilization: 0, avgProcessingHrs: 0 }]);
    }
    setModalOpen(false);
  };

  const columns: Column<Hub>[] = [
    {
      key: 'name', header: 'Hub Name', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${row.isHub ? 'bg-blue-50 border border-blue-100 text-blue-600' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] font-mono text-slate-400">{row.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'manager', header: 'Manager', render: (row) => <span className="text-slate-600">{row.manager}</span> },
    {
      key: 'zones', header: 'Zone Coverage', render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.zones.slice(0, 2).map(z => <Badge key={z} variant="blue" size="sm">{z}</Badge>)}
          {row.zones.length > 2 && <Badge variant="default" size="sm">+{row.zones.length - 2}</Badge>}
        </div>
      )
    },
    {
      key: 'capacity', header: 'Capacity', sortable: true, accessor: (r) => r.capacity as unknown as string,
      render: (row) => (
        <div className="w-24">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-700">{row.utilization}%</span>
            <span className="text-slate-400">{row.shipmentCount}/{row.capacity}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${row.utilization > 80 ? 'bg-red-500' : row.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.utilization}%` }} />
          </div>
        </div>
      )
    },
    { key: 'avgProcessingHrs', header: 'Avg Time', sortable: true, accessor: (r) => r.avgProcessingHrs as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-600"><Clock className="w-3 h-3" /> {row.avgProcessingHrs}h</span> },
    { key: 'staffCount', header: 'Staff', sortable: true, accessor: (r) => r.staffCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Users className="w-3 h-3" /> {row.staffCount}</span> },
    { key: 'shipmentCount', header: 'Shipments', sortable: true, accessor: (r) => r.shipmentCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Package className="w-3 h-3" /> {row.shipmentCount.toLocaleString()}</span> },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={row.isHub ? 'blue' : 'default'} size="sm">{row.isHub ? 'Hub' : 'Branch'}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.isActive ? 'green' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setDetailModal(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><BarChart3 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setHubs((prev) => prev.filter((h) => h.id !== row.id)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Hub & Branch Management" subtitle="Manage logistics hubs, zone coverage, and operational capacity" primaryActionLabel="New Hub" onPrimaryAction={openCreate}>
      {/* Capacity Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Hubs', value: hubs.filter(h => h.isHub).length, icon: Building2, color: 'blue' },
          { label: 'Total Branches', value: hubs.filter(h => !h.isHub).length, icon: MapPin, color: 'slate' },
          { label: 'Avg Utilization', value: `${Math.round(hubs.reduce((s, h) => s + h.utilization, 0) / hubs.length)}%`, icon: TrendingUp, color: 'emerald' },
          { label: 'Total Staff', value: hubs.reduce((s, h) => s + h.staffCount, 0), icon: Users, color: 'purple' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">{stat.label}</div>
                <div className="text-lg font-bold text-slate-900">{stat.value}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataTable
        data={hubs as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable searchPlaceholder="Search hubs, managers, zones..." searchKeys={['name', 'code', 'city', 'manager']}
        pageSize={10}
        emptyMessage="No hubs found."
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHub ? 'Edit Hub' : 'Create New Hub'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>{editingHub ? 'Save Changes' : 'Create Hub'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Hub Name" placeholder="e.g. Miami Sorting Center" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Code" placeholder="e.g. MIA-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="City" placeholder="e.g. Miami" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Address" placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Hub Manager" placeholder="e.g. Sarah Chen" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
          <Input label="Zone Coverage" placeholder="e.g. Downtown, North, East" value={form.zones} onChange={(e) => setForm({ ...form, zones: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="text-[13px] font-semibold text-slate-700">Type:</label>
            <button onClick={() => setForm({ ...form, isHub: true })} className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${form.isHub ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Hub (Sorting Center)</button>
            <button onClick={() => setForm({ ...form, isHub: false })} className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${!form.isHub ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>Branch (Office)</button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={detailModal ? `${detailModal.name} — Hub Analytics` : ''}
        footer={<Button variant="outline" size="sm" onClick={() => setDetailModal(null)}>Close</Button>}
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Capacity Utilization</div>
                <div className="text-xl font-bold text-slate-900">{detailModal.utilization}%</div>
                <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full rounded-full ${detailModal.utilization > 80 ? 'bg-red-500' : detailModal.utilization > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${detailModal.utilization}%` }} />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Avg Processing</div>
                <div className="text-xl font-bold text-slate-900">{detailModal.avgProcessingHrs}h</div>
                <div className="text-[11px] text-slate-400 mt-1">Target: 3.0h</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Active Staff</div>
                <div className="text-xl font-bold text-slate-900">{detailModal.staffCount}</div>
                <div className="text-[11px] text-slate-400 mt-1">{detailModal.shipmentCount} shipments</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] text-slate-500 font-medium">Coverage Zones</div>
                <div className="text-xl font-bold text-slate-900">{detailModal.zones.length}</div>
                <div className="flex flex-wrap gap-1 mt-1">{detailModal.zones.map(z => <Badge key={z} variant="blue" size="sm">{z}</Badge>)}</div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-100">
              <div className="text-[11px] text-blue-600 font-semibold">Manager: {detailModal.manager}</div>
              <div className="text-[11px] text-blue-500 mt-1">{detailModal.address}, {detailModal.city}</div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
