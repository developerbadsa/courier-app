'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Zap, CheckCircle2, XCircle, Package, Volume2, VolumeX,
  RotateCcw, ArrowLeft, AlertTriangle, BarChart3, Clock, Truck,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Input } from '@/components/ui';

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

    // TODO: POST /api/v1/operations/scan/receive
    // Simulate API response
    await new Promise((r) => setTimeout(r, 300));

    const result: ScanResult = {
      trackingNumber: tn,
      status: 'success',
      message: 'Received at hub',
      shipment: {
        id: `sh-${Date.now()}`,
        currentStatus: 'AT_HUB',
        weightKg: Math.round(Math.random() * 10 * 100) / 100,
        codAmount: Math.random() > 0.5 ? Math.round(Math.random() * 200 * 100) / 100 : 0,
      },
      timestamp: new Date().toLocaleTimeString(),
    };

    if (soundEnabled) playBeep();

    setScans((prev) => [result, ...prev]);
    setManualInput('');
    setIsScanning(false);
    inputRef.current?.focus();
  }, [soundEnabled]);

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
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{scans.length}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Total Scanned</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-600">{successCount}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Received</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{errorCount}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Errors</div>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">${totalCod.toFixed(0)}</div>
            <div className="text-[10px] text-slate-500 font-semibold">Total COD</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Input Area */}
        <div className="lg:col-span-1 space-y-4">
          {/* Camera/Scanner Zone */}
          <Card className="p-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600">Camera Scanner Zone</p>
              <p className="text-[11px] text-slate-400 mt-1">Point camera at barcode or QR code</p>
              <p className="text-[10px] text-slate-400 mt-2">Or use USB barcode scanner below</p>
            </div>
          </Card>

          {/* Manual / USB Scanner Input */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900">Manual Entry / USB Scanner</h3>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <form onSubmit={handleManualSubmit}>
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
              <p className="text-[10px] text-slate-400 mt-2">
                💡 USB scanner acts as keyboard — scan triggers Enter automatically
              </p>
            </form>
          </Card>

          {/* Sound Toggle */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Audio Feedback</div>
              <div className="text-[11px] text-slate-500">Beep on success / Buzz on error</div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-11 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </Card>
        </div>

        {/* Scan Results Log */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Scan Log ({scans.length})</h3>
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3 h-3" />} onClick={() => setScans([])}>
              Clear
            </Button>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {scans.length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No parcels scanned yet</p>
                <p className="text-[11px] text-slate-300 mt-1">Start scanning to receive inbound parcels</p>
              </Card>
            ) : (
              scans.map((scan, i) => (
                <div
                  key={`${scan.trackingNumber}-${i}`}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    scan.status === 'success'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    scan.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {scan.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{scan.trackingNumber}</span>
                      <Badge variant={scan.status === 'success' ? 'green' : 'default'} size="sm">
                        {scan.message}
                      </Badge>
                    </div>
                    {scan.shipment && (
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span>{scan.shipment.weightKg} kg</span>
                        {scan.shipment.codAmount > 0 && <span>COD: ${scan.shipment.codAmount.toFixed(2)}</span>}
                        <span>→ AT_HUB</span>
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3 inline" /> {scan.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
