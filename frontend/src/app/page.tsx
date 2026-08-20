'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  Truck,
  BarChart3,
  Search,
  ArrowRight,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export default function Home() {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      window.location.href = `/track?id=${encodeURIComponent(trackingNumber.trim())}`;
    } else {
      window.location.href = '/track';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ─── Top Navbar ─── */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">SHOHNAAT</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-[13px] font-medium text-slate-600">
            <Link href="/track" className="hover:text-blue-600 transition-colors">Track</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Merchant</Link>
            <Link href="/rider" className="hover:text-blue-600 transition-colors">Rider</Link>
            <Link href="/admin" className="hover:text-blue-600 transition-colors">Operations</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
            >
              Track Parcel
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Nationwide Courier &amp; Freight Services
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-2xl mx-auto leading-[1.1]">
          Fast, Reliable Courier &amp; Parcel Delivery
        </h1>

        <p className="mt-4 text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Doorstep merchant pickup, nationwide delivery, live tracking, and automated COD settlements — all in one platform.
        </p>

        {/* Tracking Bar */}
        <div className="max-w-lg mx-auto mt-8">
          <form onSubmit={handleTrackSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2]" />
              <input
                type="text"
                placeholder="Enter tracking ID (e.g. SH-9082)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full h-10 pl-10 pr-4 text-xs bg-slate-50 border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 font-mono transition-all uppercase"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold rounded transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
            >
              Track
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* ─── Portal Cards ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Merchant Portal', desc: 'Book deliveries, manage pickups, view COD settlements.', href: '/dashboard', icon: BarChart3, color: 'blue' },
            { title: 'Operations Hub', desc: 'Branch dispatch, KYC approvals, zone rate management.', href: '/admin', icon: ShieldCheck, color: 'emerald' },
            { title: 'Rider Delivery App', desc: 'Pickup tasks, delivery confirmation, COD collection.', href: '/rider', icon: Truck, color: 'amber' },
            { title: 'Live Parcel Tracking', desc: 'Real-time tracking for customers without login.', href: '/track', icon: Search, color: 'slate' },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group p-5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-600 mb-3 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors">
                Open <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Services ─── */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-lg font-bold text-slate-900">What We Deliver</h2>
            <p className="text-xs text-slate-500 mt-1">End-to-end logistics services for businesses of every size.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Clock, title: 'Scheduled Pickup', desc: 'Dedicated couriers collect from your warehouse on schedule.' },
              { icon: DollarSign, title: 'COD Settlement', desc: 'Transparent automated statements with USD payout transfers.' },
              { icon: MapPin, title: 'Live Tracking', desc: 'Real-time milestone updates from pickup to doorstep.' },
              { icon: ShieldCheck, title: 'Parcel Safety', desc: 'Barcode tracking, OTP confirmation, and digital POD.' },
            ].map((s) => (
              <div key={s.title} className="p-4 rounded border border-slate-200 bg-white">
                <div className="w-7 h-7 rounded bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                  <s.icon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{s.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '99.4%', label: 'On-Time Delivery', color: 'text-blue-600' },
            { value: '24/7', label: 'Customer Support', color: 'text-slate-900' },
            { value: '100%', label: 'COD Payouts', color: 'text-emerald-600' },
            { value: '10K+', label: 'Parcels Delivered', color: 'text-slate-900' },
          ].map((s) => (
            <div key={s.label}>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                <Truck className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-slate-700">Shohnaat Logistics</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/track" className="hover:text-blue-600 font-medium transition-colors">Track</Link>
              <Link href="/dashboard" className="hover:text-blue-600 font-medium transition-colors">Merchant</Link>
              <Link href="/login" className="hover:text-blue-600 font-medium transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-blue-600 font-medium transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
