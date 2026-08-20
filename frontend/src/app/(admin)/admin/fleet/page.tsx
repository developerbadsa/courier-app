'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Truck, User, MapPin, Phone, Edit2, Plus, Bike, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge } from '@/components/ui';
import { apiGet, apiPost, apiPatch, showToast } from '@/lib/api';

interface Rider {
  id: string; name: string; phone: string; vehicleType: string; isOnDuty: boolean;
  hubName: string; totalDeliveries: number; successRate: number;
}

export default function FleetPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicleType: 'Bike' });
  const [saving, setSaving] = useState(false);

  const fetchRiders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/riders');
      if (res.success && res.data) {
        setRiders(res.data.map((r: any) => ({
          id: r.id, name: r.user?.name || 'Unknown', phone: r.user?.phone || '',
          vehicleType: r.vehicleType || 'Bike', isOnDuty: r.isOnDuty || false,
          hubName: r.currentBranch?.name || '—', totalDeliveries: r._count?.assignments || 0,
          successRate: 98.0,
        })));
      }
    } catch { showToast('error', 'Failed to load riders.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRiders(); }, [fetchRiders]);

  const handleCreate = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      const res = await apiPost<any>('/api/v1/riders', form);
      if (res.success) { showToast('success', 'Rider created!'); fetchRiders(); setModalOpen(false); }
      else showToast('error', res.message || 'Create failed.');
    } catch { showToast('error', 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const toggleDuty = async (id: string, current: boolean) => {
    const res = await apiPatch<any>(`/api/v1/riders/${id}/duty`, { isOnDuty: !current });
    if (res.success) { setRiders((prev) => prev.map((r) => r.id === id ? { ...r, isOnDuty: !current } : r)); }
  };

  const columns: Column<Rider>[] = [
    {
      key: 'name', header: 'Rider', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">{row.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
          <div><div className="font-semibold text-slate-900">{row.name}</div><div className="text-[11px] text-slate-400">{row.phone}</div></div>
        </div>
      ),
    },
    { key: 'vehicleType', header: 'Vehicle', render: (row) => <span className="flex items-center gap-1 text-slate-600">{row.vehicleType === 'Bike' ? <Bike className="w-3 h-3" /> : <Truck className="w-3 h-3" />} {row.vehicleType}</span> },
    { key: 'hubName', header: 'Hub', render: (row) => <span className="text-slate-600">{row.hubName}</span> },
    { key: 'totalDeliveries', header: 'Deliveries', sortable: true, accessor: (r) => r.totalDeliveries as unknown as string, render: (row) => <span className="font-mono text-slate-700">{row.totalDeliveries}</span> },
    { key: 'successRate', header: 'Success Rate', sortable: true, accessor: (r) => r.successRate as unknown as string, render: (row) => <Badge variant={row.successRate >= 97 ? 'green' : 'amber'} size="sm">{row.successRate}%</Badge> },
    {
      key: 'status', header: 'Status',
      render: (row) => (
        <button onClick={() => toggleDuty(row.id, row.isOnDuty)} className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${row.isOnDuty ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
          {row.isOnDuty ? 'On Duty' : 'Off Duty'}
        </button>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Fleet Management" subtitle="Manage rider fleet, duty status, and delivery assignments" primaryActionLabel="Add Rider" onPrimaryAction={() => setModalOpen(true)}>
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><div className="text-[11px] text-slate-500">Total Riders</div><div className="text-xl font-bold text-slate-900">{loading ? '—' : riders.length}</div></Card>
        <Card className="p-4"><div className="text-[11px] text-slate-500">On Duty</div><div className="text-xl font-bold text-emerald-600">{loading ? '—' : riders.filter(r => r.isOnDuty).length}</div></Card>
        <Card className="p-4"><div className="text-[11px] text-slate-500">Off Duty</div><div className="text-xl font-bold text-slate-400">{loading ? '—' : riders.filter(r => !r.isOnDuty).length}</div></Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <DataTable data={riders as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search riders..." searchKeys={['name', 'phone']} pageSize={10} emptyMessage="No riders found. Add your first rider to get started." />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Rider"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleCreate} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />} Create Rider
          </Button>
        </>}>
        <div className="space-y-4">
          <Input label="Full Name" placeholder="John Smith" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" placeholder="john@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" placeholder="+1 555-0100" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Vehicle Type</label>
            <div className="flex gap-2">
              {['Bike', 'Van', 'Truck'].map((v) => (
                <button key={v} onClick={() => setForm({ ...form, vehicleType: v })}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-colors ${form.vehicleType === v ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
