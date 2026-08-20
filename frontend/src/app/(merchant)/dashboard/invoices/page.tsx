'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Download, Calendar, DollarSign,
  Package, Printer, Loader2, CheckCircle2, Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, Button, Badge, Card } from '@/components/ui';
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
      // Error handled
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
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All Invoices' : f}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded border border-slate-200 p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No invoices found for this filter.</p>
          </div>
        ) : (
          filtered.map((invoice) => (
            <Card key={invoice.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-slate-900">{invoice.number}</div>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${statusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {invoice.period}</span>
                    <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {invoice.shipmentCount} shipments</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span>Issued: {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-slate-900">${invoice.total.toFixed(2)}</div>
                  <div className="text-[11px] font-semibold text-slate-400">USD</div>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded">
                <div className="space-y-1.5">
                  {invoice.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                      <span>{item.description}</span>
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
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-600">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(invoice)}
                  disabled={downloading === invoice.id}
                  leftIcon={downloading === invoice.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Download Tax PDF
                </Button>
                {invoice.status === 'PENDING' && (
                  <Link href="/dashboard/finance/topup">
                    <Button variant="primary" size="sm" leftIcon={<DollarSign className="w-3.5 h-3.5" />}>
                      Pay Now
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
