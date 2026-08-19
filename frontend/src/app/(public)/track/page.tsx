'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  ShieldCheck,
  Building2,
  DollarSign
} from 'lucide-react';
import { StatusBadge, Button, Card, Input } from '@/components/ui';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('SHN-98421-US');
  const [searched, setSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Shohnaat Live Tracking</span>
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Portal Sign In
          </Link>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <Card className="p-6 sm:p-8 border-slate-200">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Track Your Shipment
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your tracking identifier to follow real-time route progress and delivery status.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="e.g. SHN-98421-US"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="h-11 text-sm font-mono"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="h-11 px-6 text-xs font-semibold"
            >
              Track Parcel
            </Button>
          </form>

          {searched && (
            <div className="border-t border-slate-200 pt-6 space-y-6">
              {/* Parcel Snapshot Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Tracking Number
                  </div>
                  <div className="text-base font-mono font-bold text-blue-600 mt-0.5">
                    {trackingNumber}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Live Status
                  </div>
                  <div className="mt-1">
                    <StatusBadge status="IN_TRANSIT" size="sm" />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Estimated Delivery
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    Tomorrow by 4:00 PM
                  </div>
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="max-w-lg mx-auto pt-4 space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      Picked Up from Merchant Hub
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Apex Global Fulfillment Dock • Austin, TX • 10:30 AM
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs ring-4 ring-blue-100">
                      <Truck className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="w-0.5 h-12 bg-slate-200" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      In Transit to Regional Sorting Hub
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Van #4 En-Route • Driver David M. • In Progress
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-400">
                      Out for Final Destination Delivery
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Pending arrival at local Austin delivery terminal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
