'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Truck, Upload, FileSpreadsheet, Download, AlertTriangle,
  CheckCircle2, XCircle, Loader2, FileText, ChevronDown, Info,
} from 'lucide-react';

/* ── Types ── */
interface ParsedRow {
  consigneeName: string;
  consigneePhone: string;
  address: string;
  weightKg: string;
  codAmount: string;
  paymentType: string;
  [key: string]: string;
}

interface ImportResult {
  created: number;
  errors: { row: number; error: string }[];
}

/* ── Constants ── */
const CSV_HEADERS = [
  'consigneeName',
  'consigneePhone',
  'address',
  'weightKg',
  'codAmount',
  'paymentType',
];

const CSV_TEMPLATE = `consigneeName,consigneePhone,address,weightKg,codAmount,paymentType
John Doe,+1-555-0100,123 Main St Miami FL 33101,2.5,45.00,COD
Jane Smith,+1-555-0200,456 Oak Ave Austin TX 78701,1.2,0,PREPAID`;

export default function BulkImportPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── CSV Parser ── */
  const parseCSV = useCallback((text: string): ParsedRow[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');
    if (lines.length > 501) throw new Error('Maximum 500 rows allowed');

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
    const requiredHeaders = ['consigneename', 'consigneephone'];
    for (const h of requiredHeaders) {
      if (!headers.includes(h)) throw new Error(`Missing required column: ${h}`);
    }

    return lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const row: ParsedRow = {
        consigneeName: '',
        consigneePhone: '',
        address: '',
        weightKg: '',
        codAmount: '',
        paymentType: 'COD',
      };
      headers.forEach((h, i) => {
        if (CSV_HEADERS.includes(h)) {
          row[h] = values[i] || '';
        }
      });
      return row;
    });
  }, []);

  /* ── Handle File ── */
  const handleFile = useCallback(async (f: File) => {
    setParseError('');
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setParseError('Only CSV and Excel files are supported');
      return;
    }
    try {
      const text = await f.text();
      const rows = parseCSV(text);
      setParsedRows(rows);
      setFile(f);
      setStep('preview');
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file');
    }
  }, [parseCSV]);

  /* ── Drag & Drop ── */
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  /* ── Import ── */
  const handleImport = async () => {
    setImporting(true);
    try {
      const token = localStorage.getItem('shohnaat_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/shipments/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          shipments: parsedRows.map((row) => ({
            consigneeName: row.consigneeName,
            consigneePhone: row.consigneePhone,
            weightKg: row.weightKg ? parseFloat(row.weightKg) : undefined,
            codAmount: row.codAmount ? parseFloat(row.codAmount) : 0,
            paymentType: row.paymentType || 'COD',
          })),
        }),
      });
      const data = await res.json();
      setResult(data.data || { created: 0, errors: [] });
      setStep('result');
    } catch {
      setResult({ created: 0, errors: [{ row: 0, error: 'Network error — please try again' }] });
      setStep('result');
    }
    setImporting(false);
  };

  /* ── Download Template ── */
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Link href="/dashboard/shipments" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Shipments
          </Link>
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Shohnaat</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Bulk Import</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          {[
            { key: 'upload', label: 'Upload File', icon: Upload },
            { key: 'preview', label: 'Preview Data', icon: FileSpreadsheet },
            { key: 'result', label: 'Result', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              {i > 0 && <div className={`w-6 h-px ${step === s.key || (i === 1 && step === 'result') ? 'bg-blue-600' : 'bg-slate-300'}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${step === s.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <s.icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Step 1: Upload ── */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-1">Bulk Shipment Import</h2>
              <p className="text-sm text-slate-500 mb-6">Upload a CSV file to create multiple shipments at once.</p>

              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mb-6"
              >
                <Download className="w-4 h-4" /> Download CSV Template
              </button>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-10 transition-colors cursor-pointer ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Drag &amp; drop your file here, or{' '}
                  <span className="text-blue-600 font-semibold">browse</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">Supported: CSV, XLSX (max 500 rows)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>

              {parseError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {parseError}
                </div>
              )}
            </div>

            {/* Format Guide */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" /> CSV Format Guide
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Column', 'Required', 'Example'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { col: 'consigneeName', req: '✅ Yes', ex: 'John Doe' },
                      { col: 'consigneePhone', req: '✅ Yes', ex: '+1-555-0100' },
                      { col: 'address', req: 'Optional', ex: '123 Main St, Miami FL' },
                      { col: 'weightKg', req: 'Optional', ex: '2.5' },
                      { col: 'codAmount', req: 'Optional', ex: '45.00' },
                      { col: 'paymentType', req: 'COD/PREPAID', ex: 'COD' },
                    ].map((r) => (
                      <tr key={r.col} className="text-slate-700">
                        <td className="py-2 px-3 font-mono font-semibold">{r.col}</td>
                        <td className="py-2 px-3">{r.req}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{r.ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Preview Data</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    📄 {file?.name} — {parsedRows.length} shipments ready to import
                  </p>
                </div>
                <button
                  onClick={() => { setStep('upload'); setParsedRows([]); setFile(null); }}
                  className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Choose Different File
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">#</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Consignee</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Phone</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Address</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Weight</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">COD</th>
                      <th className="text-left py-2.5 px-3 font-semibold text-slate-600">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr key={i} className="text-slate-700 hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-400">{i + 1}</td>
                        <td className="py-2 px-3 font-semibold">{row.consigneeName}</td>
                        <td className="py-2 px-3 font-mono">{row.consigneePhone}</td>
                        <td className="py-2 px-3 max-w-[150px] truncate">{row.address || '—'}</td>
                        <td className="py-2 px-3">{row.weightKg ? `${row.weightKg}kg` : '—'}</td>
                        <td className="py-2 px-3 font-mono">{row.codAmount ? `$${row.codAmount}` : '$0'}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            row.paymentType === 'COD' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {row.paymentType || 'COD'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 10 && (
                  <div className="py-2 text-center text-[11px] text-slate-500 bg-slate-50 border-t border-slate-200">
                    + {parsedRows.length - 10} more rows
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setStep('upload'); setParsedRows([]); setFile(null); }}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? 'Importing...' : `Import ${parsedRows.length} Shipments`}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Result ── */}
        {step === 'result' && result && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            {result.errors.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Import Successful!</h2>
                <p className="text-sm text-slate-500 mb-6">
                  {result.created} shipments created successfully.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Import Completed with Errors</h2>
                <p className="text-sm text-slate-500 mb-4">
                  {result.created} shipments created, {result.errors.length} errors.
                </p>
                <div className="text-left max-w-md mx-auto bg-red-50 rounded-lg border border-red-200 p-4 mb-6 max-h-48 overflow-y-auto">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-red-600 py-1 border-b border-red-100 last:border-0">
                      <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Row {err.row}: {err.error}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard/shipments"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                View Shipments
              </Link>
              <button
                onClick={() => { setStep('upload'); setParsedRows([]); setFile(null); setResult(null); }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Import More
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
