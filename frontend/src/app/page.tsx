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
  CheckCircle2, 
  DollarSign, 
  Clock,
  MapPin,
  Headphones,
  Box
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB] selection:text-white font-sans">
      {/* 1. Top Navbar */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F172A]">Shohnaat</span>
              <span className="text-[11px] font-semibold text-[#2563EB] ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                Express Logistics
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#475569]">
            <Link href="/track" className="hover:text-[#2563EB] transition-colors">
              Track Parcel
            </Link>
            <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
              Merchant Portal
            </Link>
            <Link href="/rider" className="hover:text-[#2563EB] transition-colors">
              Rider App
            </Link>
            <Link href="/admin" className="hover:text-[#2563EB] transition-colors">
              Operations Hub
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Live Tracking
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md shadow-xs transition-all"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
        {/* Quality Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Next-Day & Express Parcel Delivery Services</span>
        </div>

        {/* Main Brand Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] max-w-3xl mx-auto leading-tight sm:leading-tight">
          Fast, Reliable & Global Courier & Freight Delivery
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto font-normal leading-relaxed">
          From doorstep merchant pickup to nationwide delivery with live GPS tracking, automated Cash on Delivery (COD) payouts, and guaranteed safety for every parcel.
        </p>

        {/* 3. Hero Quick Tracking Bar */}
        <div className="max-w-xl mx-auto mt-8 bg-white border border-[#CBD5E1] p-2 rounded-lg shadow-xs">
          <form onSubmit={handleTrackSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g. SHN-90214-US)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-md shadow-xs transition-all shrink-0 flex items-center gap-1.5"
            >
              <span>Track Parcel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* 4. Four Core Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 text-left">
          {/* Merchant Portal */}
          <Link
            href="/dashboard"
            className="group p-5 rounded-lg bg-white border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Merchant Portal
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Book deliveries, request warehouse pickups, download thermal shipping labels, and manage COD settlements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-[#2563EB] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Dashboard</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Admin Operations */}
          <Link
            href="/admin"
            className="group p-5 rounded-lg bg-white border border-[#E2E8F0] hover:border-emerald-500 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-emerald-600 transition-colors">
                Operations Hub
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Central sorting management, merchant KYC approvals, branch dispatching, and delivery zone rate rules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Hub Console</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Rider App */}
          <Link
            href="/rider"
            className="group p-5 rounded-lg bg-white border border-[#E2E8F0] hover:border-amber-500 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-3 group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-amber-600 transition-colors">
                Field Delivery App
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Rider app for doorstep pickups, delivery confirmation, digital proof-of-delivery, and COD collection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Rider App</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Public Tracking */}
          <Link
            href="/track"
            className="group p-5 rounded-lg bg-white border border-[#E2E8F0] hover:border-purple-500 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-105 transition-transform">
                <Search className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-purple-600 transition-colors">
                Live Tracking
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Instant parcel tracking for customers without login. Real-time timeline, location stamps, and delivery ETA.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Track Parcel</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Courier Key Service Highlights */}
      <section className="bg-white border-y border-[#E2E8F0] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Why Businesses Trust Shohnaat Express
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 font-normal">
              Built to provide the fastest, safest, and most dependable delivery experience for merchants and customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Doorstep Fast Pickup</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Dedicated couriers collect parcels directly from your warehouse or store within scheduled pickup windows.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Reliable COD Settlement</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Instant collection upon delivery with transparent automated statements and rapid payout transfers in USD.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Live Real-Time Tracking</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Complete transparency for both sender and recipient with instant milestone updates and delivery progress.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">100% Parcel Safety</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Tamper-proof barcode tracking, OTP confirmation, and digital proof-of-delivery signatures on every order.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Clean Performance & Delivery Metrics */}
      <section className="py-8 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#2563EB]">99.4%</div>
            <div className="text-xs text-[#64748B] mt-0.5 font-medium">On-Time Delivery</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A]">24/7</div>
            <div className="text-xs text-[#64748B] mt-0.5 font-medium">Customer Support</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#16A34A]">100%</div>
            <div className="text-xs text-[#64748B] mt-0.5 font-medium">Verified COD Payouts</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F172A]">10,000+</div>
            <div className="text-xs text-[#64748B] mt-0.5 font-medium">Parcels Delivered</div>
          </div>
        </div>
      </section>

      {/* 7. Clean Professional Footer */}
      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Shohnaat Logistics</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/track" className="hover:text-[#2563EB] font-medium">
              Track Parcel
            </Link>
            <Link href="/dashboard" className="hover:text-[#2563EB] font-medium">
              Merchant Portal
            </Link>
            <Link href="/login" className="hover:text-[#2563EB] font-medium">
              Portal Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
