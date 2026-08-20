'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Zap, CheckCircle2, XCircle, Package, Volume2, VolumeX,
  RotateCcw, ArrowLeft, AlertTriangle, BarChart3, Clock, Truck, Info, Printer,
} from 'lucide-react';
import { printShippingLabel, type ShippingLabelData } from '@/lib/shippingLabelPdf';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Input } from '@/components/ui';
import { apiPost, apiGet, showToast } from '@/lib/api';

/* ── Types ── */
interface ScanResult {
  trackingNumber: string;
  status: 'success' | 'error';
  message: string;
  shipment?: {
    id: string;
    currentStatus: string;
    weightKg: number;
    codAmount: number;
  };
  timestamp: string;
}

/* ── Audio Feedback ── */
const playBeep = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* no-op */ }
};

const playBuzz = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 200;
    osc.type = 'sawtooth';
    gain.gain.value = 0.2;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* no-op */ }
};

/* ── Page ── */
export default function ScanInboundPage() {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [branchId] = useState('hq-001'); // Current hub branch
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount and after each scan
  useEffect(() => {
    inputRef.current?.focus();
  }, [scans]);

  const handleScan = useCallback(async (trackingNumber: string) => {
    if (!trackingNumber.trim()) return;

    setIsScanning(true);
    const tn = trackingNumber.trim().toUpperCase();

    try {
      const res = await apiPost<any>('/api/v1/operations/scan/receive', {
        trackingNumber: tn,
        branchId,
      });

      if (res.success && res.data) {
        if (soundEnabled) playBeep();

        const result: ScanResult = {
          trackingNumber: tn,
          status: 'success',
          message: res.data?.currentStatus === 'AT_HUB' ? 'Received at hub' : res.data?.currentStatus || 'Received',
          shipment: res.data,
          timestamp: new Date().toLocaleTimeString(),
        };
        setScans((prev) => [result, ...prev]);
        showToast('success', `Received: ${tn}`);
      } else {
        if (soundEnabled) playBuzz();

        const result: ScanResult = {
          trackingNumber: tn,
          status: 'error',
          message: res.message || 'Failed to receive parcel',
          timestamp: new Date().toLocaleTimeString(),
        };
        setScans((prev) => [result, ...prev]);
        showToast('error', res.message || `Failed: ${tn}`);
      }
    } catch (err: any) {
      if (soundEnabled) playBuzz();

      const result: ScanResult = {
        trackingNumber: tn,
        status: 'error',
        message: err?.message || 'Network error',
        timestamp: new Date().toLocaleTimeString(),
      };
      setScans((prev) => [result, ...prev]);
      showToast('error', `Scan failed: ${err?.message || 'Network error'}`);
    }

    setManualInput('');
    setIsScanning(false);
    inputRef.current?.focus();
  }, [soundEnabled, branchId]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && manualInput.trim()) {
      handleScan(manualInput);
    }
  };

  const successCount = scans.filter((s) => s.status === 'success').length;
  const errorCount = scans.filter((s) => s.status === 'error').length;
  const totalCod = scans
    .filter((s) => s.status === 'success')
    .reduce((sum, s) => sum + (s.shipment?.codAmount || 0), 0);

  return (
    <DashboardLayout role="admin" title="Inbound Hub Scanner" subtitle="Scan incoming parcels — barcode or QR code — to receive at this hub">
      <div className="mb-2">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Admin
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{scans.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Total Scanned</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{successCount}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Received</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{errorCount}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Errors</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">${totalCod.toFixed(0)}</div>
            <div className="text-[10px] text-slate-500 font-semibold">COD Value</div>
          </div>
        </Card>
      </div>

      {/* Scanner Input */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Scan barcode or type tracking number..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono text-sm"
              disabled={isScanning}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScans([])}
            title="Clear scan history"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        {isScanning && (
          <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Processing scan...
          </div>
        )}
      </Card>

      {/* Scan Results */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {scans.length === 0 ? (
          <Card className="p-12 text-center">
            <Camera className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No parcels scanned yet</p>
            <p className="text-[11px] text-slate-300 mt-1">Point your barcode scanner at a parcel or type the tracking number</p>
          </Card>
        ) : (
          scans.map((scan, i) => (
            <div
              key={`${scan.trackingNumber}-${i}`}
              className={`flex items-center gap-3 p-3 rounded border ${
                scan.status === 'success'
                  ? 'bg-white border-slate-200 hover:bg-slate-50'
                  : 'bg-red-50/50 border-red-200'
              }`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                scan.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}>
                {scan.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">{scan.trackingNumber}</span>
                  <Badge variant={scan.status === 'success' ? 'green' : 'default'} size="sm">{scan.message}</Badge>
                </div>
                {scan.shipment && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                    <span>{scan.shipment.weightKg} kg</span>
                    {scan.shipment.codAmount > 0 && <span>COD: ${scan.shipment.codAmount.toFixed(2)}</span>}
                    <span className="font-mono">{scan.timestamp}</span>
                  </div>
                )}
              </div>
              {scan.status === 'success' && (
                <button
                  onClick={() => {
                    printShippingLabel({
                      trackingNumber: scan.trackingNumber,
                      serviceType: 'STANDARD',
                      shipFromName: 'Shohnaat Hub',
                      shipFromAddress: 'HQ',
                      shipFromCity: 'Dhaka',
                      shipFromPhone: '',
                      shipToName: '',
                      shipToAddress: '',
                      shipToCity: '',
                      shipToPhone: '',
                      paymentType: (scan.shipment?.codAmount || 0) > 0 ? 'COD' : 'PREPAID',
                      codAmount: scan.shipment?.codAmount || 0,
                      weightKg: scan.shipment?.weightKg || 0,
                    });
                  }}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="Reprint Label"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
