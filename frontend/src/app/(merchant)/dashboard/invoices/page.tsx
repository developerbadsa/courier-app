'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Download, Calendar, DollarSign,
  Package, Loader2, CheckCircle2, Clock, Plus, Filter, ChevronDown,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, Button, Badge, Card, Modal, ExpandableCard } from '@/components/ui';

import { downloadInvoicePDF } from '@/lib/invoicePdf';

/* ── Types ── */
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  merchantName: string;
  merchantAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  shipmentCount: number;
  period: string;
}

/* ── Mock Data ── */
const MOCK_INVOICES: Invoice[] = [
  {
    id: '1', number: 'INV-2026-001', date: '2026-08-15', dueDate: '2026-08-30',
    status: 'PAID', merchantName: 'Acme Merchant LLC', merchantAddress: '1200 Logistics Blvd, Austin, TX',
    items: [
      { description: 'Shipment Delivery — 12 parcels', quantity: 12, unitPrice: 8.50 },
      { description: 'COD Processing Fee', quantity: 12, unitPrice: 1.50 },
      { description: 'Insurance Surcharge', quantity: 12, unitPrice: 0.75 },
    ],
    subtotal: 132.00, tax: 10.56, total: 142.56, shipmentCount: 12, period: 'Aug 1–15, 2026',
  },
  {
    id: '2', number: 'INV-2026-002', date: '2026-08-01', dueDate: '2026-08-15',
    status: 'PAID', merchantName: 'Acme Merchant LLC', merchantAddress: '1200 Logistics Blvd, Austin, TX',
    items: [
      { description: 'Shipment Delivery — 24 parcels', quantity: 24, unitPrice: 8.50 },
      { description: 'COD Processing Fee', quantity: 24, unitPrice: 1.50 },
      { description: 'Express Upgrade (3 shipments)', quantity: 3, unitPrice: 5.00 },
    ],
    subtotal: 282.00, tax: 22.56, total: 304.56, shipmentCount: 24, period: 'Jul 16–31, 2026',
  },
  {
    id: '3', number: 'INV-2026-003', date: '2026-08-16', dueDate: '2026-08-31',
    status: 'PENDING', merchantName: 'Acme Merchant LLC', merchantAddress: '1200 Logistics Blvd, Austin, TX',
    items: [
      { description: 'Shipment Delivery — 8 parcels', quantity: 8, unitPrice: 8.50 },
      { description: 'COD Processing Fee', quantity: 8, unitPrice: 1.50 },
    ],
    subtotal: 80.00, tax: 6.40, total: 86.40, shipmentCount: 8, period: 'Aug 16–present',
  },
];

export default function InvoicesPage() {
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [statementCycle, setStatementCycle] = useState('Current Bi-Weekly');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filtered = filter === 'ALL' ? invoices : invoices.filter((inv) => inv.status === filter);
  const totalPaid = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === 'PENDING').reduce((s, i) => s + i.total, 0);

  const handleDownloadPDF = (invoice: Invoice) => {
    setDownloading(invoice.id);
    try {
      downloadInvoicePDF({
        invoiceNumber: invoice.number,
        invoiceDate: new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDate: new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        from: { name: 'Shohnaat Logistics', address: 'Headquarters Hub, USA', email: 'billing@shohnaat.com', phone: '+1 (800) 555-SHAT' },
        to: { name: invoice.merchantName, address: invoice.merchantAddress },
        items: invoice.items,
        taxRate: 8,
        currency: 'USD',
        notes: `Invoice for ${invoice.period}. Payment due within 15 days.`,
      });
    } catch {
      // Handled
    }
    setTimeout(() => setDownloading(null), 1000);
  };

  const statusStyle = (s: string) => {
    switch (s) {
      case 'PAID': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OVERDUE': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <DashboardLayout
      role="merchant"
      title="Invoices & Statements"
      subtitle="Download PDF billing statements, tax receipts, and payment breakdowns"
    >
      {/* ── Summary Stat Cards with generous spacing ── */}
      <div className="my-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Total Invoices"
            value={String(invoices.length)}
            icon={FileText}
            iconColor="text-blue-600"
            iconBg="bg-blue-50 border-blue-100"
            subtext="All billing cycles"
          />
          <StatCard
            title="Total Paid"
            value={`$${totalPaid.toFixed(2)}`}
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 border-emerald-100"
            change={{ value: 'Cleared', isPositive: true }}
          />
          <StatCard
            title="Pending Due"
            value={`$${totalPending.toFixed(2)}`}
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-50 border-amber-100"
            subtext="Due in 15 days"
          />
        </div>
      </div>

      {/* ── Action Toolbar & Filters with my-8 spacing ── */}
      <div className="my-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded border border-slate-200 shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded border transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f === 'ALL' ? 'All Invoices' : f}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-blue-600" />}
          >
            Generate Statement
          </Button>
          <Link href="/dashboard/finance">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Financial Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Invoice Cards List using Reusable ExpandableCard ── */}
      <div className="my-8 space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded border border-slate-200 p-16 text-center shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-700">No invoices found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no invoices matching the selected status filter.</p>
          </div>
        ) : (
          filtered.map((invoice) => (
            <ExpandableCard
              key={invoice.id}
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              title={invoice.number}
              badge={
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyle(invoice.status)}`}>
                  {invoice.status}
                </span>
              }
              subtitle={
                <>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /> {invoice.period}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Package className="w-3 h-3 text-slate-400" /> {invoice.shipmentCount} parcels</span>
                </>
              }
              highlight={`$${invoice.total.toFixed(2)}`}
              highlightSubtext={`Due ${new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              headerActions={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => handleDownloadPDF(invoice)}
                  disabled={downloading === invoice.id}
                  leftIcon={downloading === invoice.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                >
                  PDF
                </Button>
              }
            >
              {/* Expandable Body */}
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>Issued: <strong>{new Date(invoice.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                <span>Recipient: <strong>{invoice.merchantName}</strong> ({invoice.merchantAddress})</span>
              </div>

              <div className="bg-slate-50 rounded p-4 border border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Itemized Breakdown</div>
                {invoice.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                    <span>{item.description} (x{item.quantity})</span>
                    <span className="font-mono font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
                  <span>Subtotal</span>
                  <span className="font-mono">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-mono">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="font-mono text-emerald-600 font-black">${invoice.total.toFixed(2)}</span>
                </div>
              </div>

              {invoice.status === 'PENDING' && (
                <div className="flex justify-end pt-2">
                  <Link href="/dashboard/finance/topup">
                    <Button variant="primary" size="sm" leftIcon={<DollarSign className="w-3.5 h-3.5" />}>
                      Pay Now (${invoice.total.toFixed(2)})
                    </Button>
                  </Link>
                </div>
              )}
            </ExpandableCard>
          ))
        )}
      </div>


      {/* ── Generate Statement Modal ── */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Generate Billing Statement"
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setCreateModal(false);
                if (invoices.length > 0) handleDownloadPDF(invoices[0]);
              }}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Generate & Download
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select the billing period to compile all completed shipments, shipping fees, COD processing deductions, and generate a certified tax invoice.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Billing Cycle</label>
            <select
              value={statementCycle}
              onChange={(e) => setStatementCycle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Current Bi-Weekly">Current Bi-Weekly (Aug 16 – Aug 31, 2026)</option>
              <option value="Previous Bi-Weekly">Previous Bi-Weekly (Aug 1 – Aug 15, 2026)</option>
              <option value="Last Month">Last Month (July 2026 Full)</option>
            </select>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
