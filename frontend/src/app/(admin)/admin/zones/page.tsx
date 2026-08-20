'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge } from '@/components/ui';
import { apiGet, apiPost, apiPatch, apiDelete, showToast } from '@/lib/api';

interface Zone {
  id: string; name: string; isActive: boolean;
}

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/zones');
      if (res.success && res.data) {
        setZones(res.data.map((z: any) => ({ id: z.id, name: z.name, isActive: z.isActive !== false })));
      }
    } catch { showToast('error', 'Failed to load zones.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchZones(); }, [fetchZones]);

  const openCreate = () => { setEditingZone(null); setName(''); setModalOpen(true); };
  const openEdit = (z: Zone) => { setEditingZone(z); setName(z.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingZone) {
        const res = await apiPatch<any>(`/api/v1/zones/${editingZone.id}`, { name });
        if (res.success) { showToast('success', 'Zone updated!'); fetchZones(); }
        else showToast('error', res.message || 'Update failed.');
      } else {
        const res = await apiPost<any>('/api/v1/zones', { name });
        if (res.success) { showToast('success', 'Zone created!'); fetchZones(); }
        else showToast('error', res.message || 'Create failed.');
      }
      setModalOpen(false);
    } catch { showToast('error', 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await apiDelete<any>(`/api/v1/zones/${id}`);
    if (res.success) { setZones((prev) => prev.filter((z) => z.id !== id)); showToast('success', 'Zone deleted.'); }
  };

  const columns: Column<Zone>[] = [
    {
      key: 'name', header: 'Zone Name', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0"><MapPin className="w-4 h-4" /></div>
          <span className="font-semibold text-slate-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.isActive ? 'green' : 'default'} size="sm" dot>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" title="Delivery Zone Management" subtitle="Define and manage geographic delivery coverage zones" primaryActionLabel="New Zone" onPrimaryAction={openCreate}>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <DataTable data={zones as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search zones..." searchKeys={['name']} pageSize={10} emptyMessage="No zones found. Create your first zone to get started." />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingZone ? 'Edit Zone' : 'Create New Zone'}
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {editingZone ? 'Save' : 'Create Zone'}
          </Button>
        </>}>
        <Input label="Zone Name" placeholder="e.g. Metro Austin" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </DashboardLayout>
  );
}
