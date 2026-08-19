'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Truck, Phone, MapPin, CheckCircle, XCircle, DollarSign, ArrowLeft, ToggleLeft, ToggleRight, Package } from 'lucide-react';

export default function RiderPage() {
  const [isOnDuty, setIsOnDuty] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center">
      {/* Mobile container constraint for rider view */}
      <div className="w-full max-w-md bg-slate-900 border-x border-slate-800 flex flex-col min-h-screen">
        {/* Top bar with duty toggle */}
        <header className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="font-bold text-sm text-white flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              Shohnaat Field Rider
            </div>
          </div>

          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isOnDuty
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isOnDuty ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-slate-500" />}
            {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
          </button>
        </header>

        {/* Task List */}
        <main className="p-4 flex-1 space-y-4 overflow-y-auto pb-20">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-white">Assigned Deliveries Today</h1>
            <span className="text-xs text-slate-400 font-mono">2 Pending</span>
          </div>

          {/* Task Card 1 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400">SHN-90214-US</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                OUT_FOR_DELIVERY
              </span>
            </div>

            <div>
              <div className="text-sm font-bold text-white">Alexander Wright</div>
              <a
                href="tel:+15550192834"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" /> +1 (555) 019-2834 (Tap to Call)
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>4502 Elm Street, Suite #4B, Austin, TX 78701</span>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400">Collect Cash (COD):</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center">
                <DollarSign className="w-3.5 h-3.5 -mr-0.5" /> 64.50 USD
              </span>
            </div>

            {/* Action Buttons (large touch target 48px) */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all">
                <CheckCircle className="w-4 h-4" /> Delivered (Collect $)
              </button>
              <button className="h-12 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/30 text-rose-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all">
                <XCircle className="w-4 h-4" /> Mark Failed
              </button>
            </div>
          </div>

          {/* Task Card 2 */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-400">SHN-90215-US</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
                PICKUP_ASSIGNED
              </span>
            </div>

            <div>
              <div className="text-sm font-bold text-white">Apex Global Warehouse</div>
              <a
                href="tel:+15559876543"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" /> +1 (555) 987-6543 (Tap to Call)
              </a>
            </div>

            <div className="flex items-start gap-1.5 text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>1200 Logistics Blvd, Dock #3, Austin, TX 78704</span>
            </div>

            <div className="pt-2">
              <button className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all">
                <Package className="w-4 h-4" /> Confirm Pickup (Scan Parcel)
              </button>
            </div>
          </div>
        </main>

        {/* Bottom Tab Bar */}
        <nav className="h-16 border-t border-slate-800 bg-slate-950 grid grid-cols-3 fixed bottom-0 max-w-md w-full z-20">
          <button className="flex flex-col items-center justify-center text-xs text-blue-400 font-semibold gap-1">
            <Truck className="w-4 h-4" /> Tasks
          </button>
          <button className="flex flex-col items-center justify-center text-xs text-slate-400 hover:text-white gap-1">
            <CheckCircle className="w-4 h-4" /> History
          </button>
          <button className="flex flex-col items-center justify-center text-xs text-slate-400 hover:text-white gap-1">
            <DollarSign className="w-4 h-4" /> Balance ($)
          </button>
        </nav>
      </div>
    </div>
  );
}
