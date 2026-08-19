'use client';

import Link from 'next/link';
import { Package, Plus, DollarSign, CheckCircle, Clock, AlertTriangle, Truck, Layers, ArrowLeft } from 'lucide-react';

export default function MerchantDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Shohnaat</div>
              <div className="text-xs text-slate-400">Merchant Hub</div>
            </div>
          </div>

          <nav className="p-4 space-y-1 text-sm">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 font-medium">
              <Layers className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
              <Package className="w-4 h-4" /> Shipments
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
              <Truck className="w-4 h-4" /> Pickups
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
              <DollarSign className="w-4 h-4" /> Finance & COD ($)
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
          Currency: <span className="font-bold text-slate-300">USD ($)</span>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold text-white">Merchant Operational Overview</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all">
              <Plus className="w-4 h-4" /> Create Shipment
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Created Today</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">128</div>
              <div className="text-xs text-emerald-400 mt-1">+14% from yesterday</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>In Transit</span>
                <Truck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">45</div>
              <div className="text-xs text-slate-400 mt-1">Across 3 regional hubs</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Delivered</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2">1,894</div>
              <div className="text-xs text-emerald-400 mt-1">98.2% success rate</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>COD Outstanding</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2">$4,250.00</div>
              <div className="text-xs text-slate-400 mt-1">Payable in next settlement</div>
            </div>
          </div>

          {/* Recent Shipments Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Recent Active Shipments</h2>
              <span className="text-xs text-slate-400">Showing last 4 orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Tracking #</th>
                    <th className="p-3.5">Consignee</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">COD Amount (USD)</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">SHN-90214-US</td>
                    <td className="p-3.5 text-white">Alexander Wright</td>
                    <td className="p-3.5 text-slate-300">Austin, Texas</td>
                    <td className="p-3.5 font-semibold text-emerald-400">$64.50</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                        IN_TRANSIT
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">SHN-90215-US</td>
                    <td className="p-3.5 text-white">Sophia Martinez</td>
                    <td className="p-3.5 text-slate-300">Miami, Florida</td>
                    <td className="p-3.5 font-semibold text-emerald-400">$120.00</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        OUT_FOR_DELIVERY
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">SHN-90216-US</td>
                    <td className="p-3.5 text-white">Marcus Vance</td>
                    <td className="p-3.5 text-slate-300">Seattle, Washington</td>
                    <td className="p-3.5 font-semibold text-emerald-400">$32.00</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        DELIVERED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
