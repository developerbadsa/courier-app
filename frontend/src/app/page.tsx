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
  Database, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Zap,
  Globe,
  HardDrive
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
      {/* 1. Crisp Top Navbar */}
      <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-xs">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F172A]">Shohnaat</span>
              <span className="text-[11px] font-semibold text-[#2563EB] ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200">
                Logistics OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#475569]">
            <Link href="/track" className="hover:text-[#2563EB] transition-colors">
              Public Tracking
            </Link>
            <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
              Merchant Portal
            </Link>
            <Link href="/admin" className="hover:text-[#2563EB] transition-colors">
              Admin Console
            </Link>
            <Link href="/rider" className="hover:text-[#2563EB] transition-colors">
              Rider App
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0F172A] px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Track Parcel
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Global Logistics SaaS • Strictly USD ($) • Multi-Tenant Architecture</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] max-w-4xl mx-auto leading-tight sm:leading-tight">
          Enterprise Courier & Logistics Platform Engineered for Scale
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto font-normal leading-relaxed">
          High-performance supply chain orchestration featuring immutable ledger accounting, server-enforced state machines, live GPS rider dispatch, and automated COD settlements.
        </p>

        {/* 3. Hero Quick Tracking Bar */}
        <div className="max-w-xl mx-auto mt-8 bg-white border border-[#E2E8F0] p-2 rounded-lg shadow-xs">
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
              <span>Track</span>
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
                Book parcel shipments, schedule bulk warehouse pickups, manage address book, and track USD COD balances.
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
                Operations Console
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Superadmin oversight, merchant KYC verification queue, central sorting hubs, and rate rules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Admin View</span>
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
                Field Rider App
              </h3>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-normal">
                Mobile-first PWA interface for pickups, delivery confirmation, tap-to-call, and real-time COD collection.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open Rider View</span>
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
                Instant parcel tracking for global recipients without login. Multi-stage timeline & location stamps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Track Now</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Enterprise Feature Highlights */}
      <section className="bg-white border-y border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Architected for Reliability & Accuracy
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
              Built with zero compromises on financial ledgers, parcel safety, and API concurrency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-blue-100 text-[#2563EB] flex items-center justify-center mb-3">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Double-Entry Accounting</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Money balances are never overwritten. Every COD collection and delivery fee is recorded as an immutable ledger transaction.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Locked State Machine</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                Parcel status transitions are strictly enforced on the server. Illegal status transitions throw an automatic 409 conflict.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <HardDrive className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#0F172A]">Dedicated Media Microservice</h3>
              <p className="text-xs text-[#64748B] mt-1 font-normal leading-relaxed">
                KYC documents and proof-of-delivery signatures are handled by an isolated storage service, keeping core API load at zero.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Live Container Infrastructure Strip */}
      <section className="py-8 bg-[#F8FAFC] border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>PostgreSQL 16 Engine</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Redis 7 Distributed Cache</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Node.js Modular API (:5001)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-purple-600" />
            <span>Storage Microservice (:5002)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Next.js 14 Standalone (:3001)</span>
          </div>
        </div>
      </section>

      {/* 7. Clean Global Footer */}
      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Shohnaat Logistics OS</span>
            <span>&copy; {new Date().getFullYear()}</span>
            <span>•</span>
            <span>Enterprise Global SaaS (USD Only)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-[#2563EB] font-medium">
              Portal Sign In
            </Link>
            <Link href="/track" className="hover:text-[#2563EB] font-medium">
              Public Tracking
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
