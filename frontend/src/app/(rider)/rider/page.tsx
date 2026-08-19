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
  Package, 
  Navigation,
  Check
} from 'lucide-react';
import { StatusBadge, Button, Card } from '@/components/ui';

interface DeliveryTask {
  id: string;
  type: 'DELIVERY' | 'PICKUP';
  name: string;
  phone: string;
  address: string;
  cod: number;
  status: 'OUT_FOR_DELIVERY' | 'PICKED_UP' | 'DELIVERED' | 'FAILED';
}

const INITIAL_TASKS: DeliveryTask[] = [
  {
    id: 'SHN-90214-US',
    type: 'DELIVERY',
    name: 'Alexander Wright',
    phone: '+1 (512) 492-8190',
    address: '4502 Elm Street, Suite #4B, Austin, TX 78701',
    cod: 64.50,
    status: 'OUT_FOR_DELIVERY',
  },
  {
    id: 'SHN-90215-US',
    type: 'PICKUP',
    name: 'Apex Global Warehouse',
    phone: '+1 (512) 884-9021',
    address: '1200 Logistics Blvd, Dock #3, Austin, TX 78704',
    cod: 0.00,
    status: 'PICKED_UP',
  },
];

export default function RiderPage() {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [tasks, setTasks] = useState<DeliveryTask[]>(INITIAL_TASKS);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const handleMarkDelivered = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'DELIVERED' } : t))
    );
    setCompletedId(id);
    setTimeout(() => setCompletedId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-blue-100">
      {/* Mobile container constraint for field rider PWA */}
      <div className="w-full max-w-md bg-slate-50 border-x border-slate-200 flex flex-col min-h-screen shadow-lg">
        {/* Top Header */}
        <header className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100">
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

        {/* Task List */}
        <main className="p-4 flex-1 space-y-4 overflow-y-auto pb-24">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              Assigned Field Tasks
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {tasks.filter((t) => t.status !== 'DELIVERED').length} Pending
            </span>
          </div>

          {/* Task Cards */}
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 space-y-3.5 border-slate-200">
              {/* Card Header: Type & Tracking */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    task.type === 'DELIVERY' 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {task.type}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">
                    {task.id}
                  </span>
                </div>
                <StatusBadge status={task.status} size="sm" />
              </div>

              {/* Customer Info */}
              <div>
                <div className="text-sm font-bold text-slate-900">{task.name}</div>
                <a
                  href={`tel:${task.phone}`}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1"
                >
                  <Phone className="w-3.5 h-3.5" /> {task.phone} (Tap to Call)
                </a>
              </div>

              {/* Address with Navigation link */}
              <div className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{task.address}</span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Open GPS Navigation"
                >
                  <Navigation className="w-4 h-4" />
                </a>
              </div>

              {/* COD Amount (if applicable) */}
              {task.type === 'DELIVERY' && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 font-medium">Cash to Collect (COD):</span>
                  <span className="text-sm font-bold text-emerald-600 font-mono">
                    ${task.cod.toFixed(2)} USD
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              {task.status !== 'DELIVERED' ? (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleMarkDelivered(task.id)}
                    className="h-10 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                    leftIcon={<CheckCircle className="w-4 h-4 stroke-[2]" />}
                  >
                    Delivered ($)
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => alert(`Marking ${task.id} as failed/undelivered`)}
                    className="h-10 text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50"
                    leftIcon={<XCircle className="w-4 h-4 stroke-[2]" />}
                  >
                    Report Failed
                  </Button>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[2.5]" /> Successfully Delivered & Collected
                </div>
              )}
            </Card>
          ))}
        </main>

        {/* Bottom Tab Navigation Bar */}
        <nav className="h-16 border-t border-slate-200 bg-white grid grid-cols-3 fixed bottom-0 max-w-md w-full z-30 shadow-md">
          <button className="flex flex-col items-center justify-center text-xs text-blue-600 font-bold gap-1">
            <Truck className="w-4 h-4" />
            <span>Tasks</span>
          </button>
          <button className="flex flex-col items-center justify-center text-xs text-slate-500 hover:text-slate-900 gap-1 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>History</span>
          </button>
          <button className="flex flex-col items-center justify-center text-xs text-slate-500 hover:text-slate-900 gap-1 font-medium">
            <DollarSign className="w-4 h-4" />
            <span>Balance ($)</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
