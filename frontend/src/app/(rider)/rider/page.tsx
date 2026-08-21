'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  ArrowLeft, 
  Navigation,
  Check,
  Camera,
  AlertTriangle,
  Clock,
  History,
  Wallet,
  Sparkles,
  Wifi,
  WifiOff,
  ScanLine,
  Route,
} from 'lucide-react';
import { StatusBadge, Button, Card, Modal, Badge } from '@/components/ui';
import { apiGet, apiPost, showToast } from '@/lib/api';
import { initOfflineSync, isOnline, enqueueAction, getPendingCount } from '@/lib/offlineQueue';
import CameraBarcodeScanner from '@/components/scanner/CameraBarcodeScanner';
import DownloadAppBanner from '@/components/DownloadAppBanner';
import AppSuggestionPopup from '@/components/AppSuggestionPopup';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface DeliveryTask {
  id: string;
  type: 'DELIVERY' | 'PICKUP';
  name: string;
  phone: string;
  address: string;
  cod: number;
  status: 'OUT_FOR_DELIVERY' | 'PICKED_UP' | 'DELIVERED' | 'FAILED';
}

interface CODHistoryEntry {
  trackingNumber: string;
  consignee: string;
  amount: number;
  time: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */
const FAILED_REASONS = [
  { code: 'CONSIGNEE_UNREACHABLE', label: 'Consignee Unreachable', desc: 'Customer not answering calls or at location' },
  { code: 'ADDRESS_NOT_FOUND', label: 'Address Not Found', desc: 'Delivery address does not exist or is incorrect' },
  { code: 'CUSTOMER_REFUSED', label: 'Customer Refused', desc: 'Consignee declined to accept the parcel' },
  { code: 'NO_ONE_HOME', label: 'No One Home', desc: 'No one available at delivery address' },
  { code: 'RESCHEDULE_REQUESTED', label: 'Reschedule Requested', desc: 'Customer asked for a different delivery time' },
  { code: 'DAMAGED_IN_TRANSIT', label: 'Damaged in Transit', desc: 'Parcel arrived damaged' },
  { code: 'WRONG_ADDRESS', label: 'Wrong Address', desc: 'Consignee provided incorrect address' },
];



/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function RiderPage() {
  // Register service worker + offline sync
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    // Initialize offline sync
    initOfflineSync();
  }, []);

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [codHistory, setCodHistory] = useState<CODHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'balance'>('tasks');

  // Fetch rider tasks and COD summary from backend
  React.useEffect(() => {
    async function loadData() {
      try {
        const tasksRes = await apiGet<any>('/api/v1/riders/me/tasks');
        if (tasksRes.success && tasksRes.data) {
          const mapped = tasksRes.data.map((a: any) => ({
            id: a.shipment?.trackingNumber || a.id,
            type: 'DELIVERY' as const,
            name: a.shipment?.consignee?.name || 'Unknown',
            phone: a.shipment?.consignee?.phone || '',
            address: a.shipment?.deliveryAddress?.line1 || a.shipment?.deliveryAddressSnap?.street || '',
            cod: parseFloat(a.shipment?.codAmount || 0),
            status: (a.shipment?.currentStatus || 'OUT_FOR_DELIVERY') as DeliveryTask['status'],
          }));
          setTasks(mapped);
        }
      } catch { /* graceful */ }
      try {
        const codRes = await apiGet<any>('/api/v1/riders/me/cod-summary');
        if (codRes.success && codRes.data?.shipments) {
          const mapped = codRes.data.shipments.map((s: any) => ({
            trackingNumber: s.trackingNumber,
            consignee: s.consignee?.name || 'Unknown',
            amount: parseFloat(s.codAmount || 0),
            time: new Date(s.deliveredAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          }));
          setCodHistory(mapped);
        }
      } catch { /* graceful */ }
    }
    loadData();
  }, []);

  // Failed delivery modal state
  const [failedModal, setFailedModal] = useState<{ open: boolean; taskId: string }>({ open: false, taskId: '' });
  const [selectedReason, setSelectedReason] = useState('');
  const [failedNotes, setFailedNotes] = useState('');

  // COD modal state
  const [codModal, setCodModal] = useState<{ open: boolean; taskId: string; amount: number }>({ open: false, taskId: '', amount: 0 });
  const [codCollected, setCodCollected] = useState('');

  // Sprint 16: AI Route Optimization
  const [routeResult, setRouteResult] = useState<any>(null);
  const [optimizing, setOptimizing] = useState(false);

  // Sprint 16: Offline Mode
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [online, setOnline] = useState(true);

  // Sprint 16: Camera Scanner
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTaskId, setScannerTaskId] = useState('');

  const pendingCount = tasks.filter((t) => t.status !== 'DELIVERED' && t.status !== 'FAILED').length;
  const totalCod = tasks.filter((t) => t.type === 'DELIVERY').reduce((s, t) => s + t.cod, 0);
  const collectedCod = codHistory.reduce((s, e) => s + e.amount, 0);

  // Track online/offline status
  React.useEffect(() => {
    const checkOnline = () => {
      setOnline(navigator.onLine);
      getPendingCount().then(setOfflinePendingCount);
    };
    window.addEventListener('online', checkOnline);
    window.addEventListener('offline', checkOnline);
    checkOnline();
    return () => {
      window.removeEventListener('online', checkOnline);
      window.removeEventListener('offline', checkOnline);
    };
  }, []);

  /* ── AI Route Optimization ── */
  const handleOptimizeRoute = async () => {
    setOptimizing(true);
    try {
      const res = await apiPost<any>('/api/v1/riders/optimize-route', { hubLat: 23.8103, hubLng: 90.4125 });
      if (res.success && res.data) {
        setRouteResult(res.data);
        showToast('success', `Route optimized: Saves ${res.data.saved?.minutes || 0} mins & ${res.data.saved?.distanceKm || 0} km`);
      } else {
        showToast('error', res.message || 'Optimization failed');
      }
    } catch {
      showToast('error', 'Failed to optimize route — check connection');
    } finally {
      setOptimizing(false);
    }
  };

  const openGoogleMapsRoute = () => {
    if (!routeResult?.optimized?.length) return;
    const origin = '23.8103,90.4125'; // Hub
    const waypoints = routeResult.optimized.map((s: any) => `${s.lat},${s.lng}`).join('|');
    const url = `https://www.google.com/maps/dir/${origin}/${waypoints.replace(/\|/g, '/')}?travelmode=driving`;
    window.open(url, '_blank');
  };

  /* ── Handle Delivery Complete (with offline support) ── */
  const handleDeliver = async (id: string, cod: number) => {
    if (cod > 0) {
      setCodModal({ open: true, taskId: id, amount: cod });
    } else {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'DELIVERED' } : t)));
      if (isOnline()) {
        apiPost('/api/v1/riders/complete-delivery', { shipmentId: id, codCollected: 0 }).catch(() => {});
      } else {
        await enqueueAction('DELIVERED', id, { codCollected: 0 });
        const count = await getPendingCount();
        setOfflinePendingCount(count);
      }
    }
  };

  const confirmCOD = async () => {
    setTasks((prev) => prev.map((t) => (t.id === codModal.taskId ? { ...t, status: 'DELIVERED' } : t)));
    if (isOnline()) {
      apiPost('/api/v1/riders/complete-delivery', { shipmentId: codModal.taskId, codCollected: codModal.amount, otpVerified: true }).catch(() => {});
    } else {
      await enqueueAction('CASH_COLLECTED', codModal.taskId, { amount: codModal.amount });
      await enqueueAction('DELIVERED', codModal.taskId, { otpVerified: true });
      const count = await getPendingCount();
      setOfflinePendingCount(count);
    }
    setCodModal({ open: false, taskId: '', amount: 0 });
    setCodCollected('');
  };

  /* ── Handle Failed Delivery (with offline support) ── */
  const handleFailed = (id: string) => {
    setFailedModal({ open: true, taskId: id });
    setSelectedReason('');
    setFailedNotes('');
  };

  const confirmFailed = async () => {
    setTasks((prev) => prev.map((t) => (t.id === failedModal.taskId ? { ...t, status: 'FAILED' } : t)));
    if (isOnline()) {
      apiPost('/api/v1/riders/report-failure', { shipmentId: failedModal.taskId, reasonCode: selectedReason, notes: failedNotes }).catch(() => {});
    } else {
      await enqueueAction('FAILED', failedModal.taskId, { reasonCode: selectedReason, notes: failedNotes });
      const count = await getPendingCount();
      setOfflinePendingCount(count);
    }
    setFailedModal({ open: false, taskId: '' });
    setSelectedReason('');
    setFailedNotes('');
  };

  /* ── Camera Scanner Handlers ── */
  const handleScannerScan = (code: string) => {
    // Find task matching scanned code
    const task = tasks.find((t) => t.id === code || t.id.includes(code));
    if (task) {
      setScannerTaskId(code);
      showToast('success', `Scanned: ${code}`);
    } else {
      showToast('warning', `No task found for: ${code}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-100">
      <div className="w-full max-w-md bg-slate-50 border-x border-slate-200 flex flex-col min-h-screen shadow-lg">
        {/* Top Header */}
        <header className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Shohnaat Rider
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Headquarters Hub #4</div>
            </div>
          </div>
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              isOnDuty
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                : 'bg-slate-100 text-slate-500 border-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isOnDuty ? 'ON DUTY' : 'OFF DUTY'}</span>
          </button>
        </header>

        {/* Sprint 16: Offline Mode Banner */}
        {!online && (
          <div className="px-3 py-2 bg-amber-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-bold">Offline Mode</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="amber" size="sm" className="bg-amber-600 text-white border-amber-400">
                {offlinePendingCount} queued
              </Badge>
            </div>
          </div>
        )}
        {online && offlinePendingCount > 0 && (
          <div className="px-3 py-2 bg-blue-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="text-xs font-bold">Syncing {offlinePendingCount} offline action{offlinePendingCount !== 1 ? 's' : ''}...</span>
            </div>
          </div>
        )}

        {/* Download App Banner */}
        <div className="px-3 pt-3">
          <DownloadAppBanner />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white border-b border-slate-200">
          <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
            <div className="text-lg font-bold text-blue-700">{pendingCount}</div>
            <div className="text-[10px] font-semibold text-blue-500 uppercase">Pending</div>
          </div>
          <div className="text-center p-2 bg-emerald-50 rounded border border-emerald-100">
            <div className="text-lg font-bold text-emerald-700">${collectedCod.toFixed(0)}</div>
            <div className="text-[10px] font-semibold text-emerald-500 uppercase">Collected</div>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded border border-amber-100">
            <div className="text-lg font-bold text-amber-700">${totalCod.toFixed(0)}</div>
            <div className="text-[10px] font-semibold text-amber-500 uppercase">Total COD</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white">
          {[
            { key: 'tasks', icon: Truck, label: 'Tasks' },
            { key: 'history', icon: History, label: 'History' },
            { key: 'balance', icon: Wallet, label: 'Balance' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === key
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="p-4 flex-1 space-y-4 overflow-y-auto pb-24">
          {/* ── Tasks Tab ── */}
          {activeTab === 'tasks' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">Assigned Field Tasks</h1>
                <Badge variant="blue" size="sm">{pendingCount} Pending</Badge>
              </div>

              {/* Sprint 16: AI Route Optimizer */}
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 h-9 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={handleOptimizeRoute}
                  isLoading={optimizing}
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  {optimizing ? 'Optimizing...' : 'AI Optimize Route'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[11px] font-semibold"
                  onClick={() => { setScannerOpen(true); setScannerTaskId(''); }}
                  leftIcon={<ScanLine className="w-3.5 h-3.5" />}
                >
                  Scan
                </Button>
              </div>

              {/* Route Optimization Result */}
              {routeResult && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[11px] font-bold text-blue-800">Optimized Route</span>
                    </div>
                    <span className="text-[10px] text-blue-600 font-mono">
                      {routeResult.totalDistanceKm} km &middot; ~{routeResult.estimatedDriveMinutes} min
                    </span>
                  </div>
                  {routeResult.saved && routeResult.saved.minutes > 0 && (
                    <div className="text-[10px] text-emerald-700 font-semibold mb-2">
                      Saves {routeResult.saved.minutes} mins & {routeResult.saved.distanceKm} km vs unoptimized
                    </div>
                  )}
                  <div className="space-y-1">
                    {routeResult.optimized?.map((stop: any) => (
                      <div key={stop.shipmentId} className="flex items-center gap-2 text-[11px]">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {stop.sequence}
                        </span>
                        <span className="font-mono text-slate-700 truncate">{stop.trackingNumber}</span>
                        {stop.segmentDistanceKm > 0 && (
                          <span className="text-slate-400 ml-auto shrink-0">{stop.segmentDistanceKm} km</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px] w-full" onClick={openGoogleMapsRoute} leftIcon={<Navigation className="w-3 h-3" />}>
                    Open Full Route in Google Maps
                  </Button>
                </Card>
              )}

              {tasks.map((task) => (
                <Card key={task.id} className="p-4 space-y-3.5 border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        task.type === 'DELIVERY'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {task.type}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">{task.id}</span>
                    </div>
                    <StatusBadge status={task.status} size="sm" />
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900">{task.name}</div>
                    <a href={`tel:${task.phone}`} className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1">
                      <Phone className="w-3.5 h-3.5" /> {task.phone} (Tap to Call)
                    </a>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="flex-1 font-medium">{task.address}</span>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`} target="_blank" rel="noopener noreferrer" className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="GPS Navigation">
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>

                  {task.type === 'DELIVERY' && task.status !== 'DELIVERED' && task.status !== 'FAILED' && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 font-medium">Cash to Collect (COD):</span>
                      <span className="text-sm font-bold text-emerald-600 font-mono">${task.cod.toFixed(2)} USD</span>
                    </div>
                  )}

                  {task.status !== 'DELIVERED' && task.status !== 'FAILED' && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <Button variant="primary" size="sm" onClick={() => handleDeliver(task.id, task.cod)} className="h-9 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700" leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                        Delivered
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleFailed(task.id)} className="h-9 text-[11px] font-semibold text-red-600 border-red-200 hover:bg-red-50" leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                        Failed
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9 text-[11px] font-semibold text-slate-500" leftIcon={<Camera className="w-3.5 h-3.5" />} onClick={() => { setScannerOpen(true); setScannerTaskId(task.id); }}>
                        POD
                      </Button>
                    </div>
                  )}

                  {task.status === 'DELIVERED' && (
                    <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 stroke-[2.5]" /> Successfully Delivered
                    </div>
                  )}

                  {task.status === 'FAILED' && (
                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center justify-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Delivery Failed — Awaiting Reschedule
                    </div>
                  )}
                </Card>
              ))}
            </>
          )}

          {/* ── History Tab ── */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h1 className="text-sm font-bold text-slate-900">Today&apos;s Activity</h1>
              {tasks.filter((t) => t.status === 'DELIVERED' || t.status === 'FAILED').length === 0 ? (
                <Card className="p-8 text-center">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No completed tasks yet today</p>
                </Card>
              ) : (
                tasks.filter((t) => t.status === 'DELIVERED' || t.status === 'FAILED').map((task) => (
                  <Card key={task.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{task.id}</span>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{task.name} — {task.address.slice(0, 40)}...</div>
                    </div>
                    {task.type === 'DELIVERY' && task.cod > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-600">${task.cod.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">COD</div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* ── Balance Tab ── */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <h1 className="text-sm font-bold text-slate-900">COD Cash Summary</h1>
              
              <Card className="p-5 bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                <div className="text-center">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Cash Collected Today</div>
                  <div className="text-3xl font-bold text-emerald-700 mt-1">${collectedCod.toFixed(2)}</div>
                  <div className="text-xs text-emerald-500 mt-0.5">USD — {codHistory.length} deliveries</div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Collection History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {codHistory.map((entry) => (
                    <div key={entry.trackingNumber} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-semibold text-blue-600">{entry.trackingNumber}</div>
                        <div className="text-[11px] text-slate-500">{entry.consignee}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">${entry.amount.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 font-medium">Pending COD (Not Yet Collected)</div>
                  <div className="text-sm font-bold text-amber-600">${(totalCod - collectedCod).toFixed(2)}</div>
                </div>
                <Button variant="primary" size="sm" className="w-full mt-3 h-9 text-xs" leftIcon={<DollarSign className="w-3.5 h-3.5" />}>
                  End of Day — Submit Cash Handover
                </Button>
              </Card>
            </div>
          )}
        </main>

        {/* ── App Suggestion Popup (after 3s delay) ── */}
        <AppSuggestionPopup />

        {/* ── Bottom Nav ── */}
        <nav className="h-14 border-t border-slate-200 bg-white grid grid-cols-3 fixed bottom-0 max-w-md w-full z-30 shadow-md">
          <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center justify-center text-xs font-semibold gap-0.5 ${activeTab === 'tasks' ? 'text-blue-600' : 'text-slate-500'}`}>
            <Truck className="w-4 h-4" />
            <span>Tasks</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center justify-center text-xs font-semibold gap-0.5 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-500'}`}>
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
          <button onClick={() => setActiveTab('balance')} className={`flex flex-col items-center justify-center text-xs font-semibold gap-0.5 ${activeTab === 'balance' ? 'text-blue-600' : 'text-slate-500'}`}>
            <Wallet className="w-4 h-4" />
            <span>Balance</span>
          </button>
        </nav>

        {/* ── Failed Delivery Modal ── */}
        <Modal
          isOpen={failedModal.open}
          onClose={() => setFailedModal({ open: false, taskId: '' })}
          title="Report Failed Delivery"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setFailedModal({ open: false, taskId: '' })}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={confirmFailed} disabled={!selectedReason}>
                Confirm Failure
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Select the reason for this delivery failure:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {FAILED_REASONS.map((r) => (
                <button
                  key={r.code}
                  onClick={() => setSelectedReason(r.code)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedReason === r.code
                      ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedReason === r.code ? 'border-red-600 bg-red-600' : 'border-slate-300'
                    }`}>
                      {selectedReason === r.code && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{r.label}</div>
                      <div className="text-[10px] text-slate-500">{r.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <textarea
              placeholder="Additional notes (optional)..."
              value={failedNotes}
              onChange={(e) => setFailedNotes(e.target.value)}
              className="w-full h-20 px-3 py-2 text-xs bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>
        </Modal>

        {/* ── COD Collection Modal ── */}
        <Modal
          isOpen={codModal.open}
          onClose={() => setCodModal({ open: false, taskId: '', amount: 0 })}
          title="Confirm COD Collection"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setCodModal({ open: false, taskId: '', amount: 0 })}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={confirmCOD} leftIcon={<CheckCircle className="w-3.5 h-3.5" />}>
                Confirm Collection
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="text-center p-4 bg-emerald-50 rounded border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-600 uppercase">Cash Amount to Collect</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">${codModal.amount.toFixed(2)}</div>
              <div className="text-xs text-emerald-500">USD</div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm Amount Collected</label>
              <input
                type="number"
                placeholder="0.00"
                value={codCollected}
                onChange={(e) => setCodCollected(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-mono font-bold bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Ensure you collect exactly ${codModal.amount.toFixed(2)} from the consignee.
            </p>
          </div>
        </Modal>

        {/* ── Sprint 16: Camera Barcode Scanner Modal ── */}
        {scannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-slate-900">Barcode Scanner</span>
                </div>
                <button onClick={() => setScannerOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                  <XCircle className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="h-72">
                <React.Suspense fallback={<div className="h-full flex items-center justify-center bg-slate-100"><span className="text-xs text-slate-400">Loading camera...</span></div>}>
                  <CameraBarcodeScanner
                    onScan={handleScannerScan}
                    onClose={() => setScannerOpen(false)}
                    continuous={true}
                  />
                </React.Suspense>
              </div>
              <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50">
                <p className="text-[10px] text-slate-500 text-center">
                  Point camera at parcel barcode or QR code. Scanner beeps on detection.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
