'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ArrowLeft, Home, Search, Truck } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Shohnaat</span>
          </div>
          <Link href="/login" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-black text-slate-300">404</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Check the URL or navigate back.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Search className="w-4 h-4" /> Track Parcel
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-[11px] text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Shohnaat Logistics</span>
        </div>
        © 2026 Shohnaat Logistics. All rights reserved.
      </footer>
    </div>
  );
}
