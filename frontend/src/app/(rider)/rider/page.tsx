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
} from 'lucide-react';
import { StatusBadge, Button, Card, Modal, Badge } from '@/components/ui';

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

const INITIAL_TASKS: DeliveryTask[] = [
  { id: 'SHN-90214-US', type: 'DELIVERY', name: 'Alexander Wright', phone: '+1 (512) 492-8190', address: '4502 Elm Street, Suite #4B, Austin, TX 78701', cod: 64.50, status: 'OUT_FOR_DELIVERY' },
  { id: 'SHN-90215-US', type: 'DELIVERY', name: 'Sophia Martinez', phone: '+1 (305) 881-2309', address: '1200 Main Street, Apt 7C, Miami, FL 33101', cod: 120.00, status: 'OUT_FOR_DELIVERY' },
  { id: 'SHN-90216-US', type: 'PICKUP', name: 'Apex Global Warehouse', phone: '+1 (512) 884-9021', address: '1200 Logistics Blvd, Dock #3, Austin, TX 78704', cod: 0, status: 'PICKED_UP' },
];

const MOCK_COD_HISTORY: CODHistoryEntry[] = [
  { trackingNumber: 'SHN-90200-US', consignee: 'Marcus Vance', amount: 32.00, time: '9:15 AM' },
  { trackingNumber: 'SHN-90201-US', consignee: 'Emily Thornton', amount: 89.90, time: '10:45 AM' },
  { trackingNumber: 'SHN-90208-US', consignee: 'Liam Davis', amount: 215.00, time: '11:30 AM' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function RiderPage() {
  // Register service worker for PWA
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const [isOnDuty, setIsOnDuty] = useState(true);
  const [tasks, setTasks] = useState<DeliveryTask[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'balance'>('tasks');

  // Failed delivery modal state
  const [failedModal, setFailedModal] = useState<{ open: boolean; taskId: string }>({ open: false, taskId: '' });
  const [selectedReason, setSelectedReason] = useState('');
  const [failedNotes, setFailedNotes] = useState('');

  // COD modal state
  const [codModal, setCodModal] = useState<{ open: boolean; taskId: string; amount: number }>({ open: false, taskId: '', amount: 0 });
  const [codCollected, setCodCollected] = useState('');

  const pendingCount = tasks.filter((t) => t.status !== 'DELIVERED' && t.status !== 'FAILED').length;
  const totalCod = tasks.filter((t) => t.type === 'DELIVERY').reduce((s, t) => s + t.cod, 0);
  const collectedCod = MOCK_COD_HISTORY.reduce((s, e) => s + e.amount, 0);

  /* ── Handle Delivery Complete ── */
  const handleDeliver = (id: string, cod: number) => {
    if (cod > 0) {
      setCodModal({ open: true, taskId: id, amount: cod });
    } else {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'DELIVERED' } : t)));
    }
  };

  const confirmCOD = () => {
    setTasks((prev) => prev.map((t) => (t.id === codModal.taskId ? { ...t, status: 'DELIVERED' } : t)));
    setCodModal({ open: false, taskId: '', amount: 0 });
    setCodCollected('');
  };

  /* ── Handle Failed Delivery ── */
  const handleFailed = (id: string) => {
    setFailedModal({ open: true, taskId: id });
    setSelectedReason('');
    setFailedNotes('');
  };

  const confirmFailed = () => {
    setTasks((prev) => prev.map((t) => (t.id === failedModal.taskId ? { ...t, status: 'FAILED' } : t)));
    setFailedModal({ open: false, taskId: '' });
    setSelectedReason('');
    setFailedNotes('');
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
                      <Button variant="ghost" size="sm" className="h-9 text-[11px] font-semibold text-slate-500" leftIcon={<Camera className="w-3.5 h-3.5" />}>
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
                  <div className="text-xs text-emerald-500 mt-0.5">USD — {MOCK_COD_HISTORY.length} deliveries</div>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900">Collection History</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {MOCK_COD_HISTORY.map((entry) => (
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
      </div>
    </div>
  );
}
