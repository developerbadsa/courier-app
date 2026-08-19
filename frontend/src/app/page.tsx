import Link from 'next/link';
import { Package, ShieldCheck, Truck, BarChart3, Search, ArrowRight, Layers, Database, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-white selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white font-black shadow-lg shadow-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Shohnaat</span>
              <span className="text-xs text-blue-400 ml-1 font-mono uppercase px-1.5 py-0.5 bg-blue-950/80 rounded border border-blue-800/50">Logistics OS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="text-sm text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Search className="w-4 h-4 text-blue-400" />
              Public Tracking
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition-all flex items-center gap-1"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Dockerized Enterprise Environment Ready (PostgreSQL 16 + Redis 7 + Express + Next.js)
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-tight">
          Next-Generation Global Logistics & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Courier Platform</span>
        </h1>

        <p className="mt-6 text-lg text-slate-400 max-w-2xl">
          Engineered for 10-year longevity with append-only immutable ledgers, server-enforced state machines, real-time tracking, and multi-role portals.
        </p>

        {/* Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full mt-14">
          {/* Merchant Portal */}
          <Link
            href="/dashboard"
            className="group p-6 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/60 hover:bg-slate-800/90 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Merchant Portal</h3>
              <p className="text-xs text-slate-400 mt-2">
                Create shipments, request bulk pickups, manage address book, rates in USD ($), and view settlement ledgers.
              </p>
            </div>
            <div className="mt-6 text-xs text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Dashboard &rarr;
            </div>
          </Link>

          {/* Admin Operations */}
          <Link
            href="/admin"
            className="group p-6 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/60 hover:bg-slate-800/90 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">Admin Operations</h3>
              <p className="text-xs text-slate-400 mt-2">
                Platform-wide control, merchant KYC approvals, branch & hub dispatching, rider assignment, and rate rules.
              </p>
            </div>
            <div className="mt-6 text-xs text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Admin Console &rarr;
            </div>
          </Link>

          {/* Rider App */}
          <Link
            href="/rider"
            className="group p-6 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/60 hover:bg-slate-800/90 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">Rider Field App</h3>
              <p className="text-xs text-slate-400 mt-2">
                Mobile-first PWA interface for pickups, delivery confirmation, reason code reporting, and COD collection.
              </p>
            </div>
            <div className="mt-6 text-xs text-amber-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Rider View &rarr;
            </div>
          </Link>

          {/* Public Parcel Tracking */}
          <Link
            href="/track"
            className="group p-6 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/60 hover:bg-slate-800/90 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">Public Tracking</h3>
              <p className="text-xs text-slate-400 mt-2">
                Instant tracking for consignees and recipients without login. Real-time timeline & status updates.
              </p>
            </div>
            <div className="mt-6 text-xs text-purple-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Track Parcel &rarr;
            </div>
          </Link>
        </div>

        {/* Infrastructure Badges */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 w-full flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>PostgreSQL 16 (Master Database)</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-red-400" />
            <span>Redis 7 (BullMQ Job Queues)</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Node.js / Express Modular API</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-400" />
            <span>Next.js 14 App Router</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        Shohnaat Logistics System &copy; {new Date().getFullYear()} — Enterprise Global SaaS (USD Only)
      </footer>
    </main>
  );
}
