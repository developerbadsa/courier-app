'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, MapPin, Users, Package, Edit2, Trash2, TrendingUp, BarChart3, Clock, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge } from '@/components/ui';
import { apiGet, apiPost, apiPatch, apiDelete, showToast } from '@/lib/api';

interface Hub {
  id: string; name: string; code: string; city: string; address: string;
  isHub: boolean; isActive: boolean; staffCount: number; shipmentCount: number;
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);
  const [form, setForm] = useState({ name: '', code: '', city: '', address: '', isHub: true });
  const [saving, setSaving] = useState(false);

  const fetchHubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/hubs');
      if (res.success && res.data) {
        setHubs(res.data.map((h: any) => ({
          id: h.id, name: h.name, code: h.code, city: h.city || '', address: h.address || '',
          isHub: h.isHub, isActive: h.isActive !== false,
          staffCount: h._count?.users || 0, shipmentCount: h._count?.shipmentsHere || 0,
        })));
      }
    } catch { showToast('error', 'Failed to load hubs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHubs(); }, [fetchHubs]);

  const openCreate = () => { setEditingHub(null); setForm({ name: '', code: '', city: '', address: '', isHub: true }); setModalOpen(true); };
  const openEdit = (hub: Hub) => { setEditingHub(hub); setForm({ name: hub.name, code: hub.code, city: hub.city, address: hub.address, isHub: hub.isHub }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      if (editingHub) {
        const res = await apiPatch<any>(`/api/v1/hubs/${editingHub.id}`, form);
        if (res.success) { showToast('success', 'Hub updated!'); fetchHubs(); }
        else showToast('error', res.message || 'Update failed.');
      } else {
        const res = await apiPost<any>('/api/v1/hubs', form);
        if (res.success) { showToast('success', 'Hub created!'); fetchHubs(); }
        else showToast('error', res.message || 'Create failed.');
      }
      setModalOpen(false);
    } catch { showToast('error', 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await apiDelete<any>(`/api/v1/hubs/${id}`);
    if (res.success) { setHubs((prev) => prev.filter((h) => h.id !== id)); showToast('success', 'Hub deleted.'); }
  };

  const columns: Column<Hub>[] = [
    {
      key: 'name', header: 'Hub Name', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${row.isHub ? 'bg-blue-50 border border-blue-100 text-blue-600' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
            <Building2 className="w-4 h-4" />
          </div>
          <div><div className="font-semibold text-slate-900">{row.name}</div><div className="text-[11px] font-mono text-slate-400">{row.code}</div></div>
        </div>
      ),
    },
    { key: 'city', header: 'City', render: (row) => <span className="text-slate-600">{row.city}</span> },
    { key: 'staffCount', header: 'Staff', sortable: true, accessor: (r) => r.staffCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Users className="w-3 h-3" /> {row.staffCount}</span> },
    { key: 'shipmentCount', header: 'Shipments', sortable: true, accessor: (r) => r.shipmentCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-700"><Package className="w-3 h-3" /> {row.shipmentCount.toLocaleString()}</span> },
    { key: 'type', header: 'Type', render: (row) => <Badge variant={row.isHub ? 'blue' : 'default'} size="sm">{row.isHub ? 'Hub' : 'Branch'}</Badge> },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.isActive ? 'green' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Hub & Branch Management" subtitle="Manage logistics hubs, zone coverage, and operational capacity" primaryActionLabel="New Hub" onPrimaryAction={openCreate}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Hubs', value: hubs.filter(h => h.isHub).length, icon: Building2, color: 'blue' },
          { label: 'Total Branches', value: hubs.filter(h => !h.isHub).length, icon: MapPin, color: 'slate' },
          { label: 'Total Staff', value: hubs.reduce((s, h) => s + h.staffCount, 0), icon: Users, color: 'purple' },
          { label: 'Total Shipments', value: hubs.reduce((s, h) => s + h.shipmentCount, 0).toLocaleString(), icon: Package, color: 'emerald' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded bg-${stat.color}-50 border border-${stat.color}-100 flex items-center justify-center text-${stat.color}-600`}><stat.icon className="w-5 h-5" /></div>
              <div><div className="text-[11px] text-slate-500 font-medium">{stat.label}</div><div className="text-lg font-bold text-slate-900">{loading ? '—' : stat.value}</div></div>
            </div>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <DataTable data={hubs as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search hubs..." searchKeys={['name', 'code', 'city']} pageSize={10} emptyMessage="No hubs found. Create your first hub to get started." />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingHub ? 'Edit Hub' : 'Create New Hub'}
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {editingHub ? 'Save Changes' : 'Create Hub'}
          </Button>
        </>}>
        <div className="space-y-4">
          <Input label="Hub Name" placeholder="e.g. Miami Sorting Center" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Code" placeholder="e.g. MIA-001" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="City" placeholder="e.g. Miami" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Address" placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="text-[13px] font-semibold text-slate-700">Type:</label>
            <button onClick={() => setForm({ ...form, isHub: true })} className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${form.isHub ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-slate-200 text-slate-500'}`}>Hub</button>
            <button onClick={() => setForm({ ...form, isHub: false })} className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${!form.isHub ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-slate-200 text-slate-500'}`}>Branch</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
