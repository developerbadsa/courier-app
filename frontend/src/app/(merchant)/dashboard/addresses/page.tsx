'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Package, Plus, Edit2, Trash2, Star, Home, Building2,
  ArrowLeft, Phone, User, FileText, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Modal, Input, Badge } from '@/components/ui';
import { apiGet, apiPost, apiPatch, apiDelete, showToast } from '@/lib/api';

/* ── Types ── */
interface Address {
  id: string;
  type: 'PICKUP' | 'DELIVERY';
  label: string;
  line1: string;
  area: string;
  city: string;
  contactPerson: string;
  contactPhone: string;
  instructions: string;
  isDefault: boolean;
  pickupCount: number;
  shipmentCount: number;
}

const EMPTY_FORM = {
  type: 'PICKUP' as 'PICKUP' | 'DELIVERY', label: '', line1: '', area: '', city: '',
  contactPerson: '', contactPhone: '', instructions: '', isDefault: false,
};

/* ── Page ── */
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'PICKUP' | 'DELIVERY'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/addresses');
      if (res.success && res.data) {
        setAddresses(res.data.map((a: any) => ({
          id: a.id, type: a.type, label: a.label || 'Unnamed', line1: a.line1, area: a.area || '',
          city: a.city, contactPerson: '', contactPhone: '', instructions: '',
          isDefault: a.isDefault, pickupCount: a._count?.pickupRequests || 0,
          shipmentCount: (a._count?.shipmentPickupFor || 0) + (a._count?.shipmentDeliveryFor || 0),
        })));
      }
    } catch { showToast('error', 'Failed to load addresses.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const filtered = filterType === 'ALL' ? addresses : addresses.filter((a) => a.type === filterType);
  const pickupCount = addresses.filter((a) => a.type === 'PICKUP').length;
  const deliveryCount = addresses.filter((a) => a.type === 'DELIVERY').length;

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({ type: addr.type, label: addr.label, line1: addr.line1, area: addr.area, city: addr.city,
      contactPerson: addr.contactPerson, contactPhone: addr.contactPhone, instructions: addr.instructions, isDefault: addr.isDefault });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.label || !form.line1 || !form.city) return;
    setSaving(true);
    try {
      const payload = { type: form.type, label: form.label, line1: form.line1, area: form.area, city: form.city, isDefault: form.isDefault };
      if (editing) {
        const res = await apiPatch<any>(`/api/v1/addresses/${editing.id}`, payload);
        if (res.success) { showToast('success', 'Address updated!'); fetchAddresses(); }
        else { showToast('error', res.message || 'Update failed.'); }
      } else {
        const res = await apiPost<any>('/api/v1/addresses', payload);
        if (res.success) { showToast('success', 'Address created!'); fetchAddresses(); }
        else { showToast('error', res.message || 'Create failed.'); }
      }
      setModalOpen(false);
    } catch { showToast('error', 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const handleSetDefault = async (id: string) => {
    const res = await apiPatch<any>(`/api/v1/addresses/${id}/default`);
    if (res.success) { fetchAddresses(); showToast('success', 'Default address updated!'); }
  };

  const handleDelete = async (id: string) => {
    const res = await apiDelete<any>(`/api/v1/addresses/${id}`);
    if (res.success) { setAddresses((prev) => prev.filter((a) => a.id !== id)); showToast('success', 'Address deleted.'); }
    setDeleteConfirm(null);
  };

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <DashboardLayout role="merchant" title="Address Book" subtitle="Manage your saved pickup warehouses and delivery locations" primaryActionLabel="New Address" onPrimaryAction={openCreate}>
      <div className="mb-2">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {[
          { key: 'ALL', label: 'All', count: addresses.length },
          { key: 'PICKUP', label: 'Pickup Locations', count: pickupCount },
          { key: 'DELIVERY', label: 'Delivery Addresses', count: deliveryCount },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilterType(key as typeof filterType)}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${filterType === key ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}>
            {label} <span className="ml-1 opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>}

      {/* Address Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((addr) => (
            <Card key={addr.id} className="p-5 relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${addr.type === 'PICKUP' ? 'bg-blue-50 border border-blue-100 text-blue-600' : 'bg-purple-50 border border-purple-100 text-purple-600'}`}>
                    {addr.type === 'PICKUP' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{addr.label}</div>
                    <Badge variant={addr.type === 'PICKUP' ? 'blue' : 'default'} size="sm">{addr.type}</Badge>
                  </div>
                </div>
                {addr.isDefault && <Badge variant="green" size="sm" dot>Default</Badge>}
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{addr.line1}{addr.area ? `, ${addr.area}` : ''}, {addr.city}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-3 mb-3">
                <span>{addr.pickupCount} pickups</span>
                <span>{addr.shipmentCount} shipments</span>
              </div>
              <div className="flex items-center justify-between">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                    <Star className="w-3 h-3" /> Set as Default
                  </button>
                )}
                {addr.isDefault && <div />}
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(addr)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleteConfirm(addr.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </Card>
          ))}
          <button onClick={openCreate} className="border-2 border-dashed border-slate-300 hover:border-primary rounded p-8 flex flex-col items-center justify-center gap-3 transition-colors bg-white hover:bg-primary/5 min-h-[240px]">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><Plus className="w-5 h-5" /></div>
            <div className="text-xs font-bold text-slate-600">Add New Address</div>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Address' : 'Add New Address'} size="lg"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!form.label || !form.line1 || !form.city || saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
            {editing ? 'Save Changes' : 'Add Address'}
          </Button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Address Type</label>
            <div className="flex gap-2">
              {(['PICKUP', 'DELIVERY'] as const).map((t) => (
                <button key={t} onClick={() => update('type', t)}
                  className={`flex-1 py-2.5 rounded text-xs font-bold border-2 transition-colors ${form.type === t ? (t === 'PICKUP' ? 'border-primary bg-primary/5 text-primary' : 'border-purple-600 bg-purple-50 text-purple-700') : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                  <span className="flex items-center justify-center gap-1.5">
                    {t === 'PICKUP' ? <><Package className="w-3.5 h-3.5" /> Pickup Location</> : <><MapPin className="w-3.5 h-3.5" /> Delivery Address</>}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <Input label="Label" placeholder="e.g. Main Warehouse, Downtown Store" value={form.label} onChange={(e) => update('label', e.target.value)} />
          <Input label="Street Address" placeholder="1200 Logistics Blvd, Suite/Dock #" value={form.line1} onChange={(e) => update('line1', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Area / District" placeholder="e.g. East Industrial" value={form.area} onChange={(e) => update('area', e.target.value)} />
            <Input label="City" placeholder="Austin, TX 78704" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => update('isDefault', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <span className="text-[13px] font-semibold text-slate-700">Set as default {form.type === 'PICKUP' ? 'pickup' : 'delivery'} address</span>
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Address"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </>}>
        <p className="text-xs text-slate-600">Are you sure you want to delete this address? This action cannot be undone.</p>
      </Modal>
    </DashboardLayout>
  );
}
