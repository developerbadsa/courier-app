'use client';

import Link from 'next/link';
import { ShieldCheck, Users, Truck, Package, Check, X, ArrowLeft, Database, Globe } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 font-bold text-white">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Shohnaat Super Admin & Operations Console
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
            ROLE: SUPER_ADMIN
          </span>
        </div>
      </header>

      <main className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1">
        {/* System Status Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Total Active Merchants</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">342</div>
            <div className="text-xs text-emerald-400 mt-1">12 Pending KYC verification</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Active Field Riders</span>
              <Truck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">86 On-Duty</div>
            <div className="text-xs text-slate-400 mt-1">Across 14 Central Hubs</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Global Parcels Today</span>
              <Package className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">5,420</div>
            <div className="text-xs text-purple-400 mt-1">All branches operational</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>PostgreSQL & Redis DB</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">Optimal</div>
            <div className="text-xs text-slate-400 mt-1">Prisma Schema v1.0 Synced</div>
          </div>
        </div>

        {/* KYC Approval Queue Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Merchant KYC Approvals Queue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Review and verify merchant business documents</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
              3 Requires Review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Merchant Name</th>
                  <th className="p-3.5">Business Type</th>
                  <th className="p-3.5">Rate Card Assigned</th>
                  <th className="p-3.5">KYC Status</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-semibold text-white">Apex Global Imports LLC</td>
                  <td className="p-3.5 text-slate-300">Cross-Border E-Commerce</td>
                  <td className="p-3.5 text-blue-400 font-medium">Standard USD Rate</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                      pending
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-600/30 rounded text-xs font-medium inline-flex items-center gap-1">
                      <X className="w-3 h-3" /> Reject
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 font-semibold text-white">Nordic Gear International</td>
                  <td className="p-3.5 text-slate-300">Retail & Apparel</td>
                  <td className="p-3.5 text-blue-400 font-medium">Standard USD Rate</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                      verified
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="text-slate-500 text-xs">Approved</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
