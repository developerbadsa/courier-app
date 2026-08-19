'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package, Search, ArrowLeft, Truck, Zap, Clock, ShieldCheck,
  Globe, Star, ChevronRight,
} from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';

/* ── Page ── */
export default function TrackPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const stored = localStorage.getItem('shohnaat_recent_tracking');
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Save to recent
    const updated = [query.trim(), ...recentSearches.filter((s) => s !== query.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('shohnaat_recent_tracking', JSON.stringify(updated));

    router.push(`/track/${query.trim()}`);
  };

  const handleQuickSearch = (tn: string) => {
    setQuery(tn);
    router.push(`/track/${tn}`);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100">
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

      {/* Hero + Search */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-12">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Track Your Parcel
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Enter your tracking number below to see real-time delivery status, location updates, and estimated arrival.
            </p>
          </div>

          {/* Search Form */}
          <Card className="p-6 sm:p-8 border-slate-200 shadow-lg shadow-slate-200/50">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter tracking number (e.g. SH-ABC123)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="h-12 text-sm font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                className="h-12 px-8 text-sm font-semibold"
                disabled={!query.trim()}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Track
              </Button>
            </form>

            {/* Scanner hint */}
            <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
              <Zap className="w-3.5 h-3.5" />
              <span>USB barcode scanner compatible — scan to auto-search</span>
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Recent Searches</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleQuickSearch(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <Clock className="w-3 h-3 text-slate-400" /> {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { icon: Globe, title: 'Real-Time Tracking', desc: 'Live status updates as your parcel moves' },
              { icon: Clock, title: 'Delivery Estimates', desc: 'Countdown to expected arrival' },
              { icon: ShieldCheck, title: 'Secure & Private', desc: 'No login needed to track' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-5">
                <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-900">{title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </div>
            ))}
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
