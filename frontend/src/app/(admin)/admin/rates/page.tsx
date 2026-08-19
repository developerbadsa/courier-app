'use client';

import React, { useState } from 'react';
import { DollarSign, Plus, Edit2, Trash2, Copy, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, DataTable, Column, Modal, Input, Badge, Tabs } from '@/components/ui';

interface RateCard {
  id: string;
  name: string;
  isDefault: boolean;
  merchantCount: number;
  rules: { zone: string; service: string; baseCharge: number; extraPerKg: number }[];
  createdAt: string;
}

const MOCK_CARDS: RateCard[] = [
  {
    id: '1', name: 'Standard Enterprise USD', isDefault: true, merchantCount: 180, createdAt: 'Aug 19, 2026',
    rules: [
      { zone: 'Metro Austin', service: 'STANDARD', baseCharge: 5.00, extraPerKg: 2.50 },
      { zone: 'Metro Miami', service: 'STANDARD', baseCharge: 6.00, extraPerKg: 3.00 },
      { zone: 'Suburban - Nationwide', service: 'STANDARD', baseCharge: 8.00, extraPerKg: 4.00 },
    ],
  },
  {
    id: '2', name: 'High-Volume Commercial', isDefault: false, merchantCount: 45, createdAt: 'Aug 19, 2026',
    rules: [
      { zone: 'Metro Austin', service: 'STANDARD', baseCharge: 3.50, extraPerKg: 1.80 },
      { zone: 'Metro Miami', service: 'STANDARD', baseCharge: 4.25, extraPerKg: 2.20 },
      { zone: 'Cross-Border Canada', service: 'EXPRESS', baseCharge: 15.00, extraPerKg: 8.00 },
    ],
  },
  {
    id: '3', name: 'Express Premium', isDefault: false, merchantCount: 12, createdAt: 'Aug 19, 2026',
    rules: [
      { zone: 'Metro Austin', service: 'EXPRESS', baseCharge: 12.00, extraPerKg: 5.00 },
      { zone: 'Metro Miami', service: 'EXPRESS', baseCharge: 14.00, extraPerKg: 6.00 },
      { zone: 'International - Express', service: 'EXPRESS', baseCharge: 35.00, extraPerKg: 15.00 },
    ],
  },
];

export default function RatesPage() {
  const [cards, setCards] = useState<RateCard[]>(MOCK_CARDS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', isDefault: false });
  const [ruleForm, setRuleForm] = useState({ zone: '', service: 'STANDARD', baseCharge: '', extraPerKg: '' });
  const [showRuleModal, setShowRuleModal] = useState(false);

  const openCreate = () => { setEditingCard(null); setForm({ name: '', isDefault: false }); setModalOpen(true); };
  const openEdit = (c: RateCard) => { setEditingCard(c); setForm({ name: c.name, isDefault: c.isDefault }); setModalOpen(true); };

  const handleSave = () => {
    if (editingCard) {
      setCards((prev) => prev.map((c) => (c.id === editingCard.id ? { ...c, ...form } : c)));
    } else {
      setCards((prev) => [...prev, { id: String(Date.now()), ...form, merchantCount: 0, rules: [], createdAt: 'Just now' }]);
    }
    setModalOpen(false);
  };

  const columns: Column<RateCard>[] = [
    {
      key: 'name', header: 'Rate Card', sortable: true, accessor: (r) => r.name,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{row.name}</div>
            <div className="text-[11px] text-slate-400">{row.rules.length} rules</div>
          </div>
        </div>
      ),
    },
    { key: 'merchants', header: 'Merchants', sortable: true, accessor: (r) => r.merchantCount as unknown as string, render: (row) => <span className="flex items-center gap-1 text-slate-600"><Users className="w-3 h-3" /> {row.merchantCount}</span> },
    { key: 'default', header: 'Default', render: (row) => row.isDefault ? <Badge variant="green" size="sm" dot>Default</Badge> : <Badge variant="default" size="sm">Custom</Badge> },
    { key: 'created', header: 'Created', render: (row) => <span className="text-[11px] text-slate-500">{row.createdAt}</span> },
    {
      key: 'actions', header: '', className: 'text-right', headerClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setActiveCard(activeCard === row.id ? null : row.id); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); const dupe = { ...row, id: String(Date.now()), name: row.name + ' (Copy)', merchantCount: 0, isDefault: false }; setCards((prev) => [...prev, dupe]); }} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"><Copy className="w-3.5 h-3.5" /></button>
          <button onClick={(e) => { e.stopPropagation(); setCards((prev) => prev.filter((c) => c.id !== row.id)); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  // Expanded rules for active card
  const expandedCard = cards.find((c) => c.id === activeCard);

  return (
    <DashboardLayout role="admin" title="Rate Card Builder" subtitle="Manage shipping rate rules, zone-based pricing, and merchant rate assignments" primaryActionLabel="New Rate Card" onPrimaryAction={openCreate}>
      <DataTable
        data={cards as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchable searchPlaceholder="Search rate cards..." searchKeys={['name']}
        pageSize={10}
        emptyMessage="No rate cards found."
      />

      {/* Expanded Rules View */}
      {expandedCard && (
        <Card className="mt-4 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {expandedCard.name} — Rate Rules ({expandedCard.rules.length})
            </h3>
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-3 h-3" />} onClick={() => setShowRuleModal(true)}>
              Add Rule
            </Button>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b">
              <tr>
                <th className="py-2.5 px-4 text-left">Zone</th>
                <th className="py-2.5 px-4 text-left">Service</th>
                <th className="py-2.5 px-4 text-left">Base Charge (USD)</th>
                <th className="py-2.5 px-4 text-left">Extra per Kg</th>
              </tr>
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
            </tbody>
          </table>
        </Card>
      )}

      {/* Create/Edit Card Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCard ? 'Edit Rate Card' : 'Create Rate Card'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave}>{editingCard ? 'Save' : 'Create Card'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Card Name" placeholder="e.g. Standard Enterprise USD" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <label className="text-[13px] font-semibold text-slate-700">Set as default rate card for new merchants</label>
          </div>
        </div>
      </Modal>

      {/* Add Rule Modal */}
      <Modal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        title="Add Rate Rule"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setShowRuleModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (expandedCard && ruleForm.zone && ruleForm.baseCharge) {
                setCards((prev) => prev.map((c) => c.id === expandedCard.id
                  ? { ...c, rules: [...c.rules, { zone: ruleForm.zone, service: ruleForm.service, baseCharge: parseFloat(ruleForm.baseCharge), extraPerKg: parseFloat(ruleForm.extraPerKg || '0') }] }
                  : c));
                setRuleForm({ zone: '', service: 'STANDARD', baseCharge: '', extraPerKg: '' });
                setShowRuleModal(false);
              }
            }}>Add Rule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Zone Name" placeholder="e.g. Metro Austin" value={ruleForm.zone} onChange={(e) => setRuleForm({ ...ruleForm, zone: e.target.value })} />
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Service Type</label>
            <select value={ruleForm.service} onChange={(e) => setRuleForm({ ...ruleForm, service: e.target.value })} className="w-full h-[42px] px-3.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600">
              <option value="STANDARD">Standard</option>
              <option value="EXPRESS">Express</option>
              <option value="ECONOMY">Economy</option>
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
