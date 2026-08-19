'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, ArrowLeft, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 font-bold text-white">
            <Package className="w-5 h-5 text-blue-500" />
            Shohnaat Live Tracking
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-10 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Track Your Shipment</h1>
          <p className="text-sm text-slate-400 text-center mb-8">Enter your unique tracking number to view real-time parcel transit updates</p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. SHN-89342-US"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              Track
            </button>
          </form>

          {searched && (
            <div className="border-t border-slate-700 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 mb-6">
                <div>
                  <div className="text-xs text-slate-400">Tracking Number</div>
                  <div className="text-lg font-mono font-bold text-blue-400">{trackingNumber}</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold">
                  <Truck className="w-3.5 h-3.5" />
                  IN_TRANSIT
                </div>
                <div>
                  <div className="text-xs text-slate-400">Amount (USD)</div>
                  <div className="text-base font-bold text-emerald-400">$35.00</div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="space-y-6 max-w-md mx-auto pt-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-600"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Picked Up from Shipper</div>
                    <div className="text-xs text-slate-400">Central Warehouse Hub • 10:30 AM</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="w-0.5 h-12 bg-slate-700"></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-400">In Transit to Regional Sorting Facility</div>
                    <div className="text-xs text-slate-400">Vehicle Assigned • In Progress</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-400">Out for Final Delivery</div>
                    <div className="text-xs text-slate-500">Pending arrival at local hub</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
