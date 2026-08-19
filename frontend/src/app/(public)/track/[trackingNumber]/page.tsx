'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Package, Search, ArrowLeft, Truck, CheckCircle2, Clock, MapPin,
  User, Printer, Download, ExternalLink, AlertTriangle, RefreshCw,
  Circle, Warehouse, PackageCheck, XCircle, Ban, RotateCcw,
} from 'lucide-react';

/* ── Types ── */
interface TimelineEvent {
  status: string;
  label: string;
  note: string;
  reasonCode?: string;
  timestamp: string;
}

interface TrackingData {
  trackingNumber: string;
  currentStatus: string;
  statusLabel: string;
  progress: number;
  origin: string;
  destination: string;
  consigneeName: string;
  currentHub: string | null;
  timeline: TimelineEvent[];
  eventCount: number;
  eta: string | null;
  etaLabel: string;
  countdown: { hours: number; minutes: number; totalMinutes: number } | null;
  riderName: string | null;
  createdAt: string;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  paymentType: string;
  weightKg: number | null;
}

/* ── Status Config ── */
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-500', icon: Package },
  PICKUP_ASSIGNED: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', icon: User },
  PICKED_UP: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', icon: PackageCheck },
  AT_HUB: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-600', icon: Warehouse },
  IN_TRANSIT: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-600', icon: Truck },
  OUT_FOR_DELIVERY: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-600', icon: MapPin },
  DELIVERED: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-600', icon: CheckCircle2 },
  FAILED: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-600', icon: XCircle },
  CANCELLED: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-500', icon: Ban },
  RETURN_INITIATED: { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-600', icon: RotateCcw },
  RETURNED: { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-500', icon: RotateCcw },
  RESCHEDULED: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-600', icon: Clock },
};

/* ── Helper ── */
const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
};

/* ── Page ── */
export default function TrackingResultPage() {
  const params = useParams();
  const trackingNumber = params?.trackingNumber as string;
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number } | null>(null);

  const fetchTracking = useCallback(async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setError('');
    try {
      // TODO: replace with real API call — GET /api/v1/tracking/:trackingNumber
      // Mock response for now
      await new Promise((r) => setTimeout(r, 800));
      setData({
        trackingNumber,
        currentStatus: 'IN_TRANSIT',
        statusLabel: 'In Transit',
        progress: 60,
        origin: '1200 Logistics Blvd, Austin, TX',
        destination: '4502 Elm Street, Miami, FL',
        consigneeName: 'Alexander Wright',
        currentHub: 'Regional Sorting Center',
        timeline: [
          { status: 'PENDING', label: 'Order Placed', note: 'Shipment booked by merchant', timestamp: new Date(Date.now() - 48 * 3600000).toISOString() },
          { status: 'PICKUP_ASSIGNED', label: 'Rider Assigned', note: 'David Miller assigned for pickup', timestamp: new Date(Date.now() - 46 * 3600000).toISOString() },
          { status: 'PICKED_UP', label: 'Picked Up', note: 'Picked up from merchant warehouse', timestamp: new Date(Date.now() - 42 * 3600000).toISOString() },
          { status: 'AT_HUB', label: 'At Sorting Hub', note: 'Received at Austin sorting hub', timestamp: new Date(Date.now() - 36 * 3600000).toISOString() },
          { status: 'IN_TRANSIT', label: 'In Transit', note: 'En route to Miami hub via Van #4', timestamp: new Date(Date.now() - 12 * 3600000).toISOString() },
        ],
        eventCount: 5,
        eta: new Date(Date.now() + 18 * 3600000).toISOString(),
        etaLabel: 'Tomorrow by 4:00 PM',
        countdown: { hours: 18, minutes: 23, totalMinutes: 1103 },
        riderName: 'David Miller',
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
        pickedUpAt: new Date(Date.now() - 42 * 3600000).toISOString(),
        deliveredAt: null,
        paymentType: 'COD',
        weightKg: 2.5,
      });
    } catch {
      setError('Tracking number not found. Please check and try again.');
    }
    setLoading(false);
  }, [trackingNumber]);

  useEffect(() => { fetchTracking(); }, [fetchTracking]);

  // Live countdown timer
  useEffect(() => {
    if (!data?.countdown) return;
    let remaining = data.countdown.totalMinutes * 60;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) { clearInterval(interval); return; }
      setCountdown({
        hours: Math.floor(remaining / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
      });
    }, 1000);
    setCountdown({ hours: data.countdown.hours, minutes: data.countdown.minutes });
    return () => clearInterval(interval);
  }, [data]);

  const handlePrint = () => window.print();

  const statusStyle = data ? (STATUS_STYLES[data.currentStatus] || STATUS_STYLES.PENDING) : STATUS_STYLES.PENDING;
  const StatusIcon = statusStyle.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Tracking your parcel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white px-4 flex items-center">
          <div className="max-w-5xl w-full mx-auto flex items-center">
            <Link href="/track" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Parcel Not Found</h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/track">
              <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Try Another Number
              </button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col print:bg-white">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 print:hidden">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Link href="/track" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Track Another
          </Link>
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Shohnaat</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTracking} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Print">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 print:p-0 print:max-w-full">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg">Shohnaat Logistics</span>
          </div>
          <div className="text-xs text-slate-500">Tracking Summary Receipt</div>
        </div>

        {/* Status Hero */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivery Progress</span>
              <span className="text-[11px] font-bold text-blue-600">{data.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusStyle.bg} ${statusStyle.border} border`}>
                <StatusIcon className={`w-5 h-5 ${statusStyle.text}`} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Status</div>
                <div className={`text-sm font-bold ${statusStyle.text}`}>{data.statusLabel}</div>
              </div>
            </div>

            {/* Tracking Number */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Tracking ID</div>
              <div className="text-sm font-mono font-bold text-blue-600">{data.trackingNumber}</div>
            </div>

            {/* ETA */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Estimated Delivery</div>
              <div className="text-sm font-bold text-slate-900">{data.etaLabel}</div>
              {countdown && (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {countdown.hours}h {countdown.minutes}m remaining
                </div>
              )}
            </div>

            {/* Rider */}
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Assigned Rider</div>
              <div className="text-sm font-bold text-slate-900">{data.riderName || '—'}</div>
              {data.currentHub && (
                <div className="text-[11px] text-slate-500 mt-0.5">Via {data.currentHub}</div>
              )}
            </div>
          </div>
        </div>

        {/* Route Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="flex-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">From</div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-sm font-semibold text-slate-900">{data.origin}</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-16 h-px bg-slate-200" />
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">{data.weightKg ? `${data.weightKg}kg` : ''}</span>
              </div>
              <div className="w-16 h-px bg-slate-200" />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">To</div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-sm font-semibold text-slate-900">{data.destination}</div>
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{data.consigneeName}</div>
            </div>
          </div>
        </div>

        {/* ═══ Interactive Vertical Stepper Timeline ═══ */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Journey Timeline ({data.eventCount} events)</h3>

          <div className="relative">
            {data.timeline.map((event, i) => {
              const isLast = i === data.timeline.length - 1;
              const isCurrent = i === data.timeline.length - 1 && data.currentStatus !== 'DELIVERED' && data.currentStatus !== 'CANCELLED';
              const style = STATUS_STYLES[event.status] || STATUS_STYLES.PENDING;
              const Icon = style.icon;

              return (
                <div key={`${event.status}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-32px)] ${
                      i < data.timeline.length - 1 ? 'bg-emerald-300' : 'bg-slate-200'
                    }`} />
                  )}

                  {/* Status Circle */}
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    isCurrent
                      ? `${style.bg} ${style.border} ring-4 ring-blue-100 animate-pulse`
                      : i < data.timeline.length - 1
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : `${style.bg} ${style.border} ${style.text}`
                  }`}>
                    {i < data.timeline.length - 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${isCurrent ? 'pb-0' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-sm font-bold ${isCurrent ? style.text : 'text-slate-900'}`}>
                          {event.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Current
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{event.note}</div>
                        {event.reasonCode && (
                          <div className="text-[11px] text-red-500 mt-0.5 font-medium">
                            Reason: {event.reasonCode.replace(/_/g, ' ')}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-semibold text-slate-500">{formatTime(event.timestamp)}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(event.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ETA Countdown */}
        {countdown && data.currentStatus !== 'DELIVERED' && data.currentStatus !== 'CANCELLED' && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">Estimated Time of Arrival</div>
            <div className="flex items-center justify-center gap-6 mt-3">
              <div>
                <div className="text-3xl font-bold">{countdown.hours}</div>
                <div className="text-[11px] text-blue-200 font-medium">Hours</div>
              </div>
              <div className="text-2xl text-blue-300">:</div>
              <div>
                <div className="text-3xl font-bold">{String(countdown.minutes).padStart(2, '0')}</div>
                <div className="text-[11px] text-blue-200 font-medium">Minutes</div>
              </div>
            </div>
            <div className="text-xs text-blue-200 mt-3">{data.etaLabel}</div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between print:hidden">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          <Link href="/track" className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
            Track Another Parcel
          </Link>
        </div>
      </main>
    </div>
  );
}
