'use client';

import React, { useState } from 'react';
import {
  MapPin, Package, Plus, Edit2, Trash2, Star, Home, Building2,
  ArrowLeft, Phone, User, FileText,
} from 'lucide-react';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Modal, Input, Badge } from '@/components/ui';

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

/* ── Mock Data ── */
const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1', type: 'PICKUP', label: 'Main Warehouse', line1: '1200 Logistics Blvd, Dock #3',
    area: 'East Industrial', city: 'Austin, TX 78704', contactPerson: 'Sarah Johnson', contactPhone: '+1 512-884-9021',
    instructions: 'Use loading dock entrance. Ask for warehouse manager.', isDefault: true, pickupCount: 142, shipmentCount: 890,
  },
  {
    id: 'addr-2', type: 'PICKUP', label: 'Downtown Store', line1: '456 Congress Ave, Suite 100',
    area: 'Downtown', city: 'Austin, TX 78701', contactPerson: 'Mike Chen', contactPhone: '+1 512-555-0199',
    instructions: 'Front entrance. Parking available on 7th Street.', isDefault: false, pickupCount: 34, shipmentCount: 210,
  },
  {
    id: 'addr-3', type: 'DELIVERY', label: 'Client Office', line1: '789 Lamar Blvd, Floor 5',
    area: 'North Central', city: 'Austin, TX 78703', contactPerson: 'Emily Davis', contactPhone: '+1 512-555-0345',
    instructions: 'Ring intercom for suite 500. Deliver to reception.', isDefault: true, pickupCount: 0, shipmentCount: 56,
  },
  {
    id: 'addr-4', type: 'PICKUP', label: 'Weekend Warehouse', line1: '3400 Comanche Trail',
    area: 'Southeast', city: 'Austin, TX 78702', contactPerson: 'James Wilson', contactPhone: '+1 512-555-0782',
    instructions: 'Open Saturdays 9AM-2PM only. Call ahead for large shipments.', isDefault: false, pickupCount: 18, shipmentCount: 95,
  },
];

const EMPTY_FORM = {
  type: 'PICKUP' as 'PICKUP' | 'DELIVERY',
  label: '',
  line1: '',
  area: '',
  city: '',
  contactPerson: '',
  contactPhone: '',
  instructions: '',
  isDefault: false,
};

/* ── Page ── */
export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [filterType, setFilterType] = useState<'ALL' | 'PICKUP' | 'DELIVERY'>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = filterType === 'ALL' ? addresses : addresses.filter((a) => a.type === filterType);
  const pickupCount = addresses.filter((a) => a.type === 'PICKUP').length;
  const deliveryCount = addresses.filter((a) => a.type === 'DELIVERY').length;

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      type: addr.type, label: addr.label, line1: addr.line1, area: addr.area, city: addr.city,
      contactPerson: addr.contactPerson, contactPhone: addr.contactPhone, instructions: addr.instructions,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label || !form.line1 || !form.city) return;

    if (editing) {
      setAddresses((prev) => prev.map((a) => (a.id === editing.id ? { ...a, ...form } : a)));
    } else {
      setAddresses((prev) => [...prev, {
        ...form, id: `addr-${Date.now()}`, pickupCount: 0, shipmentCount: 0,
      }]);
    }
    setModalOpen(false);
  };

  const handleSetDefault = (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    setAddresses((prev) => prev.map((a) =>
      a.id === id ? { ...a, isDefault: true } : (a.type === addr.type ? { ...a, isDefault: false } : a)
    ));
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    setDeleteConfirm(null);
  };

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <DashboardLayout
      role="merchant"
      title="Address Book"
      subtitle="Manage your saved pickup warehouses and delivery locations"
      primaryActionLabel="New Address"
      onPrimaryAction={openCreate}
    >
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
          <button
            key={key}
            onClick={() => setFilterType(key as typeof filterType)}
            className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
              filterType === key
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label} <span className="ml-1 opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((addr) => (
          <Card key={addr.id} className="p-5 relative group">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                  addr.type === 'PICKUP' ? 'bg-blue-50 border border-blue-100 text-blue-600' : 'bg-purple-50 border border-purple-100 text-purple-600'
                }`}>
                  {addr.type === 'PICKUP' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{addr.label}</div>
                  <Badge variant={addr.type === 'PICKUP' ? 'blue' : 'default'} size="sm">{addr.type}</Badge>
                </div>
              </div>
              {addr.isDefault && (
                <Badge variant="green" size="sm" dot>Default</Badge>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 mb-3">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{addr.line1}{addr.area ? `, ${addr.area}` : ''}, {addr.city}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{addr.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{addr.contactPhone}</span>
              </div>
              {addr.instructions && (
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded mt-2">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="italic">{addr.instructions}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-100 pt-3 mb-3">
              <span>{addr.pickupCount} pickups</span>
              <span>{addr.shipmentCount} shipments</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {!addr.isDefault && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <Star className="w-3 h-3" /> Set as Default
                </button>
              )}
              {addr.isDefault && <div />}
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(addr)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteConfirm(addr.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add New Card */}
        <button
          onClick={openCreate}
          className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded p-8 flex flex-col items-center justify-center gap-3 transition-colors bg-white hover:bg-blue-50/30 min-h-[240px]"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Plus className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-600">Add New Address</div>
        </button>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Address' : 'Add New Address'}
        size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!form.label || !form.line1 || !form.city}>
              {editing ? 'Save Changes' : 'Add Address'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Address Type</label>
            <div className="flex gap-2">
              {(['PICKUP', 'DELIVERY'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('type', t)}
                  className={`flex-1 py-2.5 rounded text-xs font-bold border-2 transition-colors ${
                    form.type === t
                      ? t === 'PICKUP' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {t === 'PICKUP' ? (
                      <>
                        <Package className="w-3.5 h-3.5" /> Pickup Location
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5" /> Delivery Address
                      </>
                    )}
                  </span>

                </button>
              ))}
            </div>
          </div>

          <Input label="Label" placeholder="e.g. Main Warehouse, Downtown Store" value={form.label} onChange={(e) => update('label', e.target.value)} />
          <Input label="Street Address" placeholder="1200 Logistics Blvd, Suite/Dock #" value={form.line1} onChange={(e) => update('line1', e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Area / District" placeholder="e.g. East Industrial" value={form.area} onChange={(e) => update('area', e.target.value)} />
            <Input label="City, State, Zip" placeholder="Austin, TX 78704" value={form.city} onChange={(e) => update('city', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Person" placeholder="e.g. John Smith" value={form.contactPerson} onChange={(e) => update('contactPerson', e.target.value)} leftIcon={<User className="w-4 h-4" />} />
            <Input label="Contact Phone" placeholder="+1 512-555-0100" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} leftIcon={<Phone className="w-4 h-4" />} />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Pickup Instructions</label>
            <textarea
              placeholder="e.g. Use loading dock entrance. Call before arrival."
              value={form.instructions}
              onChange={(e) => update('instructions', e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update('isDefault', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-[13px] font-semibold text-slate-700">Set as default {form.type === 'PICKUP' ? 'pickup' : 'delivery'} address</span>
          </label>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Address"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </>
        }
      >
        <p className="text-xs text-slate-600">
          Are you sure you want to delete this address? This action cannot be undone.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
