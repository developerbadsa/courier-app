'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Copy, Users, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge } from '@/components/ui';
import { apiGet, apiPost, apiPatch, apiDelete, showToast } from '@/lib/api';

interface RateCard {
  id: string; name: string; isDefault: boolean; rules: { zone: string; service: string; baseCharge: number; extraPerKg: number }[];
}

export default function RatesPage() {
  const [cards, setCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', isDefault: false });
  const [ruleForm, setRuleForm] = useState({ zone: '', service: 'STANDARD', baseCharge: '', extraPerKg: '' });
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>('/api/v1/rates/cards');
      if (res.success && res.data) {
        setCards(res.data.map((c: any) => ({
          id: c.id, name: c.name, isDefault: c.isDefault || false,
          rules: (c.rules || []).map((r: any) => ({
            zone: r.zoneName || r.zone || '', service: r.serviceType || r.service || 'STANDARD',
            baseCharge: parseFloat(r.baseCharge || 0), extraPerKg: parseFloat(r.extraPerKg || 0),
          })),
        })));
      }
    } catch { showToast('error', 'Failed to load rate cards.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openCreate = () => { setEditingCard(null); setForm({ name: '', isDefault: false }); setModalOpen(true); };
  const openEdit = (c: RateCard) => { setEditingCard(c); setForm({ name: c.name, isDefault: c.isDefault }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editingCard) {
        const res = await apiPatch<any>(`/api/v1/rates/cards/${editingCard.id}`, form);
        if (res.success) { showToast('success', 'Rate card updated!'); fetchCards(); }
        else showToast('error', res.message || 'Update failed.');
      } else {
        const res = await apiPost<any>('/api/v1/rates/cards', form);
        if (res.success) { showToast('success', 'Rate card created!'); fetchCards(); }
        else showToast('error', res.message || 'Create failed.');
      }
      setModalOpen(false);
    } catch { showToast('error', 'Operation failed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await apiDelete<any>(`/api/v1/rates/cards/${id}`);
    if (res.success) { setCards((prev) => prev.filter((c) => c.id !== id)); showToast('success', 'Rate card deleted.'); }
  };

  const columns: Column<RateCard>[] = [
    {
      key: 'name', header: 'Rate Card', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><DollarSign className="w-4 h-4" /></div>
          <div><div className="font-semibold text-slate-900">{row.name}</div><div className="text-[11px] text-slate-400">{row.rules.length} rules</div></div>
        </div>
      ),
    },
    { key: 'default', header: 'Default', render: (row) => row.isDefault ? <Badge variant="green" size="sm" dot>Default</Badge> : <Badge variant="default" size="sm">Custom</Badge> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setActiveCard(activeCard === row.id ? null : row.id); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  const expandedCard = cards.find((c) => c.id === activeCard);

  return (
    <DashboardLayout role="admin" title="Rate Card Builder" subtitle="Manage shipping rate rules, zone-based pricing, and merchant rate assignments" primaryActionLabel="New Rate Card" onPrimaryAction={openCreate}>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <DataTable data={cards as unknown as Record<string, unknown>[]} columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchable searchPlaceholder="Search rate cards..." searchKeys={['name']} pageSize={10} emptyMessage="No rate cards found." />
      )}

      {expandedCard && (
        <Card className="mt-4 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">{expandedCard.name} — Rate Rules ({expandedCard.rules.length})</h3>
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-3 h-3" />} onClick={() => setShowRuleModal(true)}>Add Rule</Button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b">
              <tr><th className="py-2.5 px-4 text-left">Zone</th><th className="py-2.5 px-4 text-left">Service</th><th className="py-2.5 px-4 text-left">Base Charge</th><th className="py-2.5 px-4 text-left">Extra per Kg</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expandedCard.rules.map((rule, i) => (
                <tr key={i} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-800">{rule.zone}</td>
                  <td className="py-3 px-4"><Badge variant={rule.service === 'EXPRESS' ? 'amber' : 'blue'} size="sm">{rule.service}</Badge></td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">${rule.baseCharge.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">${rule.extraPerKg.toFixed(2)}/kg</td>
                </tr>
              ))}
              {expandedCard.rules.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-400">No rules yet. Add your first rate rule.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCard ? 'Edit Rate Card' : 'Create Rate Card'}
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            {editingCard ? 'Save' : 'Create Card'}
          </Button>
        </>}>
        <div className="space-y-4">
          <Input label="Card Name" placeholder="e.g. Standard Enterprise USD" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
            <span className="text-[13px] font-semibold text-slate-700">Set as default rate card</span>
          </label>
        </div>
      </Modal>

      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title="Add Rate Rule"
        footer={<>
          <Button variant="outline" size="sm" onClick={() => setShowRuleModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => {
            if (expandedCard && ruleForm.zone && ruleForm.baseCharge) {
              setCards((prev) => prev.map((c) => c.id === expandedCard.id ? { ...c, rules: [...c.rules, { zone: ruleForm.zone, service: ruleForm.service, baseCharge: parseFloat(ruleForm.baseCharge), extraPerKg: parseFloat(ruleForm.extraPerKg || '0') }] } : c));
              setRuleForm({ zone: '', service: 'STANDARD', baseCharge: '', extraPerKg: '' }); setShowRuleModal(false);
            }
          }}>Add Rule</Button>
        </>}>
        <div className="space-y-4">
          <Input label="Zone Name" placeholder="e.g. Metro Austin" value={ruleForm.zone} onChange={(e) => setRuleForm({ ...ruleForm, zone: e.target.value })} />
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Service Type</label>
            <select value={ruleForm.service} onChange={(e) => setRuleForm({ ...ruleForm, service: e.target.value })} className="w-full h-[42px] px-3.5 text-sm bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-primary">
              <option value="STANDARD">Standard</option><option value="EXPRESS">Express</option><option value="ECONOMY">Economy</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Charge (USD)" type="number" placeholder="5.00" value={ruleForm.baseCharge} onChange={(e) => setRuleForm({ ...ruleForm, baseCharge: e.target.value })} />
            <Input label="Extra per Kg (USD)" type="number" placeholder="2.50" value={ruleForm.extraPerKg} onChange={(e) => setRuleForm({ ...ruleForm, extraPerKg: e.target.value })} />
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
