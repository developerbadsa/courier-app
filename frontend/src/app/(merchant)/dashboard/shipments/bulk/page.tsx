'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card } from '@/components/ui';

interface BulkRow {
  row: number;
  consigneeName: string;
  consigneePhone: string;
  destination: string;
  weightKg: string;
  codAmount: string;
  paymentType: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const CSV_TEMPLATE = `consigneeName,consigneePhone,destination,weightKg,codAmount,paymentType
Alexander Wright,+1 512-492-8190,"4502 Elm St, Austin TX",2.5,64.50,COD
Sophia Martinez,+1 305-881-2309,"1200 Main St, Miami FL",1.0,120.00,COD
Marcus Vance,+1 206-714-9921,"800 Pine Ave, Seattle WA",3.2,0,PREPAID`;

export default function BulkUploadPage() {
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ created: number; errors: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsed: BulkRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        parsed.push({
          row: i,
          consigneeName: row.consigneename || '',
          consigneePhone: row.consigneephone || '',
          destination: row.destination || '',
          weightKg: row.weightkg || '',
          codAmount: row.codamount || '0',
          paymentType: row.paymenttype || 'COD',
          status: 'pending',
        });
      }
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    const created = rows.filter((r) => r.consigneeName && r.consigneePhone).length;
    const errors = rows.length - created;
    setResults({ created, errors });
    setRows((prev) =>
      prev.map((r) =>
        !r.consigneeName || !r.consigneePhone
          ? { ...r, status: 'error', error: 'Missing required fields' }
          : { ...r, status: 'success' }
      )
    );
    setUploading(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shohnaat-bulk-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout
      role="merchant"
      title="Bulk Shipment Upload"
      subtitle="Upload CSV file to create multiple shipments at once (max 500)"
    >
      <div className="mb-2">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
      <div className="max-w-4xl space-y-6">
        {/* Upload Zone */}
        <Card className="p-8">
          <div className="text-center">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-10 cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/50"
            >
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Click to upload CSV file</p>
              <p className="text-xs text-slate-400 mt-1">Or drag and drop — max 500 shipments per batch</p>
            </div>

            <div className="flex justify-center gap-4 mt-5">
              <Button variant="outline" size="sm" onClick={downloadTemplate} leftIcon={<FileText className="w-3.5 h-3.5" />}>
                Download Template
              </Button>
              {rows.length > 0 && !results && (
                <Button variant="primary" size="sm" isLoading={uploading} onClick={handleUpload} leftIcon={<Upload className="w-3.5 h-3.5" />}>
                  Upload {rows.length} Shipments
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Results Summary */}
        {results && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{results.created}</div>
                  <div className="text-xs text-slate-500">Shipments Created</div>
                </div>
              </div>
            </Card>
            <Card className="p-5 border-l-4 border-l-red-500">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{results.errors}</div>
                  <div className="text-xs text-slate-500">Errors Skipped</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Preview Table */}
        {rows.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Preview ({rows.length} rows)</h3>
              <Button variant="ghost" size="sm" onClick={() => { setRows([]); setResults(null); }}>Clear</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="py-2.5 px-3 text-left">#</th>
                    <th className="py-2.5 px-3 text-left">Consignee</th>
                    <th className="py-2.5 px-3 text-left">Phone</th>
                    <th className="py-2.5 px-3 text-left">Destination</th>
                    <th className="py-2.5 px-3 text-left">Weight</th>
                    <th className="py-2.5 px-3 text-left">COD</th>
                    <th className="py-2.5 px-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.row} className={r.status === 'error' ? 'bg-red-50/50' : r.status === 'success' ? 'bg-emerald-50/50' : ''}>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{r.row}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{r.consigneeName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.consigneePhone}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.destination}</td>
                      <td className="py-2.5 px-3 text-slate-600">{r.weightKg} kg</td>
                      <td className="py-2.5 px-3 font-semibold">${r.codAmount}</td>
                      <td className="py-2.5 px-3">
                        {r.status === 'success' && <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle className="w-3 h-3" /> Created</span>}
                        {r.status === 'error' && <span className="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-3 h-3" /> {r.error}</span>}
                        {r.status === 'pending' && <span className="text-slate-400">Pending</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
