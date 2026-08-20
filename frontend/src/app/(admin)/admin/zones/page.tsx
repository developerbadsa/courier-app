'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge } from '@/components/ui';

interface Zone {
  id: string;
  name: string;
  isActive: boolean;
  addressCount: number;
  rateRuleCount: number;
}

const MOCK_ZONES: Zone[] = [
  { id: '1', name: 'Metro Austin', isActive: true, addressCount: 142, rateRuleCount: 3 },
  { id: '2', name: 'Metro Miami', isActive: true, addressCount: 98, rateRuleCount: 3 },
  { id: '3', name: 'Metro Seattle', isActive: true, addressCount: 67, rateRuleCount: 2 },
  { id: '4', name: 'Metro Chicago', isActive: true, addressCount: 85, rateRuleCount: 2 },
  { id: '5', name: 'Suburban - Nationwide', isActive: true, addressCount: 210, rateRuleCount: 4 },
  { id: '6', name: 'Remote / Rural', isActive: false, addressCount: 34, rateRuleCount: 1 },
  { id: '7', name: 'Cross-Border Canada', isActive: true, addressCount: 45, rateRuleCount: 5 },
  { id: '8', name: 'International - Express', isActive: true, addressCount: 22, rateRuleCount: 6 },
];

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [name, setName] = useState('');

  const openCreate = () => { setEditingZone(null); setName(''); setModalOpen(true); };
  const openEdit = (z: Zone) => { setEditingZone(z); setName(z.name); setModalOpen(true); };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingZone) {
      setZones((prev) => prev.map((z) => (z.id === editingZone.id ? { ...z, name } : z)));
    } else {
      setZones((prev) => [...prev, { id: String(Date.now()), name, isActive: true, addressCount: 0, rateRuleCount: 0 }]);
    }
    setModalOpen(false);
  };

  const columns: Column<Zone>[] = [
    {
      key: 'name', header: 'Zone Name', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'addressCount', header: 'Addresses', sortable: true, accessor: (r) => r.addressCount as unknown as string, render: (row) => <span className="text-slate-600">{row.addressCount}</span> },
    { key: 'rateRuleCount', header: 'Rate Rules', sortable: true, accessor: (r) => r.rateRuleCount as unknown as string, render: (row) => <Badge variant="blue" size="sm">{row.rateRuleCount} rules</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.isActive ? 'green' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setZones((prev) => prev.filter((z) => z.id !== row.id)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Delivery Zone Management" subtitle="Define and manage geographic delivery coverage zones" primaryActionLabel="New Zone" onPrimaryAction={openCreate}>
      <DataTable
        data={zones as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable searchPlaceholder="Search zones..." searchKeys={['name']}
        pageSize={10}
        emptyMessage="No zones found."
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingZone ? 'Edit Zone' : 'Create New Zone'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>{editingZone ? 'Save' : 'Create Zone'}</Button>
          </>
        }
      >
        <Input label="Zone Name" placeholder="e.g. Metro Austin" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </DashboardLayout>
  );
}
