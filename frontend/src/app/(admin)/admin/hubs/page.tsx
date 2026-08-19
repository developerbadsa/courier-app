'use client';

import React, { useState } from 'react';
import { Building2, Plus, MapPin, Users, Package, Edit2, Trash2 } from 'lucide-react';
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
}

const MOCK_HUBS: Hub[] = [
  { id: '1', name: 'Headquarters Hub', code: 'HQ-001', city: 'Austin, TX', address: '100 Logistics Blvd', isHub: true, isActive: true, staffCount: 24, shipmentCount: 1840 },
  { id: '2', name: 'Miami Sorting Center', code: 'MIA-002', city: 'Miami, FL', address: '500 Port Ave', isHub: true, isActive: true, staffCount: 18, shipmentCount: 920 },
  { id: '3', name: 'Seattle Distribution', code: 'SEA-003', city: 'Seattle, WA', address: '300 Terminal Dr', isHub: true, isActive: true, staffCount: 12, shipmentCount: 640 },
  { id: '4', name: 'Chicago Satellite', code: 'CHI-004', city: 'Chicago, IL', address: '800 Industrial Park', isHub: false, isActive: false, staffCount: 6, shipmentCount: 210 },
];

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>(MOCK_HUBS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [form, setForm] = useState({ name: '', code: '', city: '', address: '', isHub: true });

  const openCreate = () => {
    setEditingHub(null);
    setForm({ name: '', code: '', city: '', address: '', isHub: true });
    setModalOpen(true);
  };

  const openEdit = (hub: Hub) => {
    setEditingHub(hub);
    setForm({ name: hub.name, code: hub.code, city: hub.city, address: hub.address, isHub: hub.isHub });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingHub) {
      setHubs((prev) => prev.map((h) => (h.id === editingHub.id ? { ...h, ...form } : h)));
    } else {
      setHubs((prev) => [...prev, { ...form, id: String(Date.now()), isActive: true, staffCount: 0, shipmentCount: 0 }]);
    }
    setModalOpen(false);
  };

  const columns: Column<Hub>[] = [
    {
      key: 'name', header: 'Hub Name', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.isHub ? 'bg-blue-50 border border-blue-100 text-blue-600' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] font-mono text-slate-400">{row.code}</div>
          </div>
        </div>
      ),
    },
    { key: 'city', header: 'City', sortable: true, accessor: (r) => r.city, render: (row) => <span className="flex items-center gap-1 text-slate-600"><MapPin className="w-3 h-3" /> {row.city}</span> },
    { key: 'staffCount', header: 'Staff', sortable: true, accessor: (r) => r.staffCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Users className="w-3 h-3" /> {row.staffCount}</span> },
    { key: 'shipmentCount', header: 'Shipments', sortable: true, accessor: (r) => r.shipmentCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Package className="w-3 h-3" /> {row.shipmentCount.toLocaleString()}</span> },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={row.isHub ? 'blue' : 'default'} size="sm">{row.isHub ? 'Hub' : 'Branch'}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.isActive ? 'green' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setHubs((prev) => prev.filter((h) => h.id !== row.id)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Hub & Branch Management" subtitle="Manage logistics hubs, sorting centers, and branch offices" primaryActionLabel="New Hub" onPrimaryAction={openCreate}>
      <DataTable
        data={hubs as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable searchPlaceholder="Search hubs..." searchKeys={['name', 'code', 'city']}
        pageSize={10}
        emptyMessage="No hubs found."
      />

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
          <div className="flex items-center gap-3">
            <label className="text-[13px] font-semibold text-slate-700">Type:</label>
            <button
              onClick={() => setForm({ ...form, isHub: true })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${form.isHub ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              Hub (Sorting Center)
            </button>
            <button
              onClick={() => setForm({ ...form, isHub: false })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${!form.isHub ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              Branch (Office)
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
