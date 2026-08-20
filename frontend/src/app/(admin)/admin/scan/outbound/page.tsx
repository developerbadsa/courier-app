'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Package, Truck, CheckCircle2, XCircle, MapPin, ArrowLeft,
  Plus, Send, AlertTriangle, Box, Hash,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';
import { apiGet } from '@/lib/api';

/* ── Types ── */
interface ScannedParcel {
  trackingNumber: string;
  weightKg: number;
  codAmount: number;
  status: 'added' | 'error';
  message: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

/* ── Page ── */
export default function ScanOutboundPage() {
  const [destination, setDestination] = useState('');
  const [parcels, setParcels] = useState<ScannedParcel[]>([]);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    apiGet<any>('/api/v1/hubs').then((res) => {
      if (res.success && res.data) setBranches(res.data.map((b: any) => ({ id: b.id, name: b.name, code: b.code })));
    }).catch(() => {});
  }, []);

  const handleScan = async (tn: string) => {
    if (!tn.trim()) return;
    setIsScanning(true);
    const trackingNumber = tn.trim().toUpperCase();

    // Simulate API
    await new Promise((r) => setTimeout(r, 250));

    // Check duplicate
    if (parcels.some((p) => p.trackingNumber === trackingNumber)) {
      setParcels((prev) => [
        { trackingNumber, weightKg: 0, codAmount: 0, status: 'error', message: 'Already scanned' },
        ...prev,
      ]);
      setManualInput('');
      setIsScanning(false);
      return;
    }

    const parcel: ScannedParcel = {
      trackingNumber,
      weightKg: Math.round(Math.random() * 10 * 100) / 100,
      codAmount: Math.random() > 0.5 ? Math.round(Math.random() * 200 * 100) / 100 : 0,
      status: 'added',
      message: 'Added to manifest',
    };

    setParcels((prev) => [parcel, ...prev]);
    setManualInput('');
    setIsScanning(false);
    inputRef.current?.focus();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(manualInput);
  };

  const handleRemove = (tn: string) => {
    setParcels((prev) => prev.filter((p) => p.trackingNumber !== tn));
  };

  const handleDispatch = () => {
    setDispatched(true);
    setDispatchModal(false);
  };

  const addedParcels = parcels.filter((p) => p.status === 'added');
  const totalWeight = addedParcels.reduce((sum, p) => sum + p.weightKg, 0);
  const totalCod = addedParcels.reduce((sum, p) => sum + p.codAmount, 0);

  if (dispatched) {
    return (
      <DashboardLayout role="admin" title="Manifest Dispatched" subtitle="Outbound bag has been dispatched successfully">
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Outbound Manifest Dispatched</h2>
          <p className="text-sm text-slate-500 mt-1">{addedParcels.length} parcels dispatched to {branches.find((b) => b.id === destination)?.name}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="text-lg font-bold text-slate-900">{addedParcels.length}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Parcels</div>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="text-lg font-bold text-slate-900">{totalWeight.toFixed(1)}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Total kg</div>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-center">
              <div className="text-lg font-bold text-slate-900">${totalCod.toFixed(0)}</div>
              <div className="text-[10px] text-slate-500 font-semibold">Total COD</div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <Link href="/admin">
              <Button variant="outline" size="sm">Back to Admin</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => { setDispatched(false); setParcels([]); setDestination(''); }}>
              Create Another Manifest
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" title="Outbound Bagging & Manifest" subtitle="Scan parcels and create outbound manifest for linehaul dispatch">
      <div className="mb-2">
        <Link href="/admin/scan" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Inbound Scanner
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Setup & Scanner */}
        <div className="lg:col-span-1 space-y-4">
          {/* Destination Selection */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Destination Hub
            </h3>
            <div className="space-y-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setDestination(branch.id)}
                  className={`w-full text-left p-3 rounded border-2 transition-all ${
                    destination === branch.id
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 ${destination === branch.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{branch.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{branch.code}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Scanner Input */}
          <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-600" /> Scan Parcels
            </h3>
            <form onSubmit={handleManualSubmit}>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Scan or type tracking number..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && manualInput.trim() && handleScan(manualInput)}
                className="font-mono text-sm"
                disabled={isScanning || !destination}
              />
            </form>
            {!destination && (
              <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Select a destination hub first
              </p>
            )}
          </Card>

          {/* Summary */}
          {parcels.length > 0 && (
            <Card className="p-4">
              <h3 className="text-xs font-bold text-slate-900 mb-3">Manifest Summary</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <div className="text-lg font-bold text-blue-700">{addedParcels.length}</div>
                  <div className="text-[10px] text-blue-500 font-semibold">Parcels</div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-700">{totalWeight.toFixed(1)}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">kg</div>
                </div>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                  <div className="text-lg font-bold text-emerald-700">${totalCod.toFixed(0)}</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">COD</div>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4"
                disabled={addedParcels.length === 0 || !destination}
                onClick={() => setDispatchModal(true)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Dispatch Manifest ({addedParcels.length} parcels)
              </Button>
            </Card>
          )}
        </div>

        {/* Right: Scanned Parcels List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Scanned Parcels ({parcels.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => setParcels([])}>Clear All</Button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {parcels.length === 0 ? (
              <Card className="p-12 text-center">
                <Box className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No parcels scanned</p>
                <p className="text-[11px] text-slate-300 mt-1">Select destination then start scanning</p>
              </Card>
            ) : (
              parcels.map((parcel, i) => (
                <div
                  key={`${parcel.trackingNumber}-${i}`}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    parcel.status === 'added'
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                    parcel.status === 'added' ? 'bg-blue-50 text-blue-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {parcel.status === 'added' ? <Package className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{parcel.trackingNumber}</span>
                      <Badge variant={parcel.status === 'added' ? 'blue' : 'default'} size="sm">{parcel.message}</Badge>
                    </div>
                    {parcel.status === 'added' && (
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
                        <span>{parcel.weightKg} kg</span>
                        {parcel.codAmount > 0 && <span>COD: ${parcel.codAmount.toFixed(2)}</span>}
                      </div>
                    )}
                  </div>
                  {parcel.status === 'added' && (
                    <button
                      onClick={() => handleRemove(parcel.trackingNumber)}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Confirmation Modal */}
      <Modal
        isOpen={dispatchModal}
        onClose={() => setDispatchModal(false)}
        title="Dispatch Outbound Manifest"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDispatchModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDispatch} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Confirm Dispatch
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs font-bold text-blue-700 mb-1">Dispatch Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-blue-500">Destination:</span> <span className="font-semibold">{branches.find((b) => b.id === destination)?.name}</span></div>
              <div><span className="text-blue-500">Parcels:</span> <span className="font-semibold">{addedParcels.length}</span></div>
              <div><span className="text-blue-500">Total Weight:</span> <span className="font-semibold">{totalWeight.toFixed(1)} kg</span></div>
              <div><span className="text-blue-500">Total COD:</span> <span className="font-semibold">${totalCod.toFixed(2)}</span></div>
            </div>
          </div>
          <p className="text-xs text-slate-500">This will create a manifest and transition all scanned parcels to IN_TRANSIT status. The manifest will be ready for linehaul dispatch.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
