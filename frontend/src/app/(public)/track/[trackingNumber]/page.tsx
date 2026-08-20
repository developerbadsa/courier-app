'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Package,
  Search,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Share2,
  Warehouse,
  PackageCheck,
  XCircle,
  Ban,
  RotateCcw,
} from 'lucide-react';

/* ── Types ── */
interface TimelineEvent {
  status: string;
  label: string;
  note: string;
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
  etaLabel: string;
  countdown: { hours: number; minutes: number; seconds: number; totalSeconds: number };
  riderName: string | null;
  weightKg: number;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  DELIVERED: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', dot: 'bg-[#15803D]', icon: CheckCircle2 },
  IN_TRANSIT: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', dot: 'bg-[#1D4ED8]', icon: Truck },
  PICKED_UP: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', dot: 'bg-[#1D4ED8]', icon: PackageCheck },
  PENDING: { bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', dot: 'bg-[#64748B]', icon: Package },
  AT_HUB: { bg: 'bg-[#F3E8FF]', text: 'text-[#7E22CE]', dot: 'bg-[#7E22CE]', icon: Warehouse },
  FAILED: { bg: 'bg-[#FFE4E6]', text: 'text-[#BE123C]', dot: 'bg-[#BE123C]', icon: XCircle },
  CANCELLED: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', icon: Ban },
};

export default function TrackingResultPage() {
  const params = useParams();
  const router = useRouter();
  const rawTrackingNumber = (params?.trackingNumber as string) || 'SH-9082';
  const trackingNumber = rawTrackingNumber.toUpperCase();

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      setData({
        trackingNumber,
        currentStatus: 'IN_TRANSIT',
        statusLabel: 'In Transit',
        progress: 65,
        origin: '1200 Logistics Blvd, Austin, TX',
        destination: '4502 Elm Street, Miami, FL',
        consigneeName: 'Alexander Wright',
        currentHub: 'Regional Sorting Center #4',
        timeline: [
          {
            status: 'PENDING',
            label: 'Order Placed',
            note: 'Shipment booked and verified by merchant',
            timestamp: new Date(Date.now() - 36 * 3600000).toISOString(),
          },
          {
            status: 'PICKUP_ASSIGNED',
            label: 'Rider Assigned',
            note: 'Rider David Miller assigned for express pickup',
            timestamp: new Date(Date.now() - 30 * 3600000).toISOString(),
          },
          {
            status: 'PICKED_UP',
            label: 'Picked Up',
            note: 'Package collected from merchant warehouse',
            timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
          },
          {
            status: 'AT_HUB',
            label: 'At Sorting Hub',
            note: 'Inbound barcode scanned at Austin Central Hub',
            timestamp: new Date(Date.now() - 16 * 3600000).toISOString(),
          },
          {
            status: 'IN_TRANSIT',
            label: 'In Transit',
            note: 'En route to Miami regional distribution center via Transit Van #4',
            timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
          },
        ],
        eventCount: 5,
        etaLabel: 'Tomorrow by 4:00 PM EST',
        countdown: { hours: 18, minutes: 22, seconds: 45, totalSeconds: 66165 },
        riderName: 'David Miller',
        weightKg: 2.5,
      });
    } catch {
      // Error
    }
    setLoading(false);
  }, [trackingNumber]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Real-time second countdown
  useEffect(() => {
    if (!data?.countdown) return;
    let totalSecs = data.countdown.totalSeconds;

    const interval = setInterval(() => {
      totalSecs -= 1;
      if (totalSecs <= 0) {
        clearInterval(interval);
        return;
      }
      setCountdown({
        hours: Math.floor(totalSecs / 3600),
        minutes: Math.floor((totalSecs % 3600) / 60),
        seconds: totalSecs % 60,
      });
    }, 1000);

    setCountdown({
      hours: data.countdown.hours,
      minutes: data.countdown.minutes,
      seconds: data.countdown.seconds,
    });

    return () => clearInterval(interval);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  const statusStyle = data
    ? STATUS_CONFIG[data.currentStatus] || STATUS_CONFIG.PENDING
    : STATUS_CONFIG.PENDING;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Querying real-time parcel telemetry...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white print:bg-white">
      {/* ── Top Header Navigation Bar ── */}
      <header className="h-18 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <Link
            href="/track"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Track Another Parcel</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D68F2] flex items-center justify-center text-white shadow-xs">
              <Truck className="w-4.5 h-4.5 stroke-[2.4]" />
            </div>
            <span className="font-extrabold text-sm tracking-[0.14em] text-slate-900 uppercase">
              SHOHNAAT
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchTracking}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-7 space-y-6 print:p-0 print:max-w-full">
        {/* ── 1. Delivery Progress Hero Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DELIVERY PROGRESS
              </span>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                {data.progress}% COMPLETED
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-[#1D68F2] rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>

          {/* 4-Column Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Status */}
            <div className="flex items-center gap-3 bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Truck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  STATUS
                </p>
                <p className="text-[13.5px] font-bold text-blue-700 truncate mt-0.5">
                  {data.statusLabel}
                </p>
              </div>
            </div>

            {/* Tracking ID with Copy */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TRACKING ID
              </p>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <span className="font-mono text-[13.5px] font-bold text-blue-600 truncate">
                  {data.trackingNumber}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ESTIMATED DELIVERY
              </p>
              <p className="text-[13px] font-bold text-slate-900 truncate mt-0.5">
                Tomorrow by 4:00 PM
              </p>
              {countdown && (
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {countdown.hours}h {countdown.minutes}m remaining
                </p>
              )}
            </div>

            {/* Assigned Rider */}
            <div className="bg-slate-50/60 border border-slate-100 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ASSIGNED RIDER
              </p>
              <p className="text-[13px] font-bold text-slate-900 truncate mt-0.5">
                {data.riderName}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                Via Regional Sorting Center
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. Origin ➔ Destination Route Banner ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Origin */}
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                FROM
              </p>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {data.origin}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Merchant Hub Warehouse
                  </p>
                </div>
              </div>
            </div>

            {/* Weight Pill / Route Indicator */}
            <div className="flex sm:flex-col items-center justify-center gap-1.5 shrink-0 px-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                <Truck className="w-4 h-4" />
                <span>{data.weightKg} KG</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Standard Express
              </span>
            </div>

            {/* Destination */}
            <div className="flex-1 sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                TO
              </p>
              <div className="flex sm:justify-end items-start gap-2.5">
                <div className="sm:text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {data.destination}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {data.consigneeName}
                  </p>
                </div>
                <MapPin className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Journey Timeline (Vertical Stepper) ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Journey Timeline ({data.eventCount} events)
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Real-time GPS Tracking
            </span>
          </div>

          <div className="relative pl-3 sm:pl-4 space-y-7">
            {data.timeline.map((event, idx) => {
              const isLast = idx === data.timeline.length - 1;
              const isCompleted = idx < data.timeline.length - 1;

              return (
                <div key={idx} className="relative flex items-start gap-4.5">
                  {/* Connecting Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-3 top-7 w-0.5 h-[calc(100%+8px)] ${
                        isCompleted ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}
                    />
                  )}

                  {/* Icon Indicator */}
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white ring-4 ring-blue-100 flex items-center justify-center shrink-0 z-10 shadow-2xs">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-[13.5px] font-bold ${
                            isCompleted ? 'text-slate-900' : 'text-[#1D4ED8]'
                          }`}
                        >
                          {event.label}
                        </p>
                        {!isCompleted && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            ● Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {event.note}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-600">
                        {new Date(event.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(event.timestamp).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. Live ETA Gradient Countdown Card ── */}
        {countdown && (
          <div className="bg-gradient-to-r from-[#1D68F2] to-[#1E40AF] rounded-2xl p-6 sm:p-7 text-white text-center shadow-lg shadow-blue-600/20">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
              ESTIMATED TIME OF ARRIVAL
            </p>

            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
              <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-2.5 min-w-[70px]">
                <p className="text-3xl sm:text-4xl font-extrabold">{countdown.hours}</p>
                <p className="text-[10px] font-bold text-blue-200 uppercase mt-0.5">Hours</p>
              </div>

              <span className="text-2xl font-bold text-blue-300">:</span>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-2.5 min-w-[70px]">
                <p className="text-3xl sm:text-4xl font-extrabold">
                  {String(countdown.minutes).padStart(2, '0')}
                </p>
                <p className="text-[10px] font-bold text-blue-200 uppercase mt-0.5">Minutes</p>
              </div>

              <span className="text-2xl font-bold text-blue-300">:</span>

              <div className="bg-white/10 backdrop-blur-xs rounded-xl px-4 py-2.5 min-w-[70px]">
                <p className="text-3xl sm:text-4xl font-extrabold">
                  {String(countdown.seconds).padStart(2, '0')}
                </p>
                <p className="text-[10px] font-bold text-blue-200 uppercase mt-0.5">Seconds</p>
              </div>
            </div>

            <p className="text-xs font-semibold text-blue-100 mt-4">
              Scheduled Arrival: {data.etaLabel}
            </p>
          </div>
        )}

        {/* ── 5. Footer Actions ── */}
        <div className="flex items-center justify-between print:hidden pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>

          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold text-white bg-[#1D68F2] hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <span>Track Another Shipment</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
