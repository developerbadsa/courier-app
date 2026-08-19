'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  DollarSign, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ChevronRight,
  ExternalLink,
  PlusCircle,
  Copy,
  Check
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card } from '@/components/ui';

// Mock active merchant shipments
const RECENT_SHIPMENTS = [
  {
    id: 'SHN-98421-US',
    consignee: 'Alexander Wright',
    phone: '+1 (512) 492-8190',
    destination: 'Austin, Texas',
    cod: 64.50,
    status: 'IN_TRANSIT',
    paymentStatus: 'UNPAID',
    createdAt: '12 mins ago',
  },
  {
    id: 'SHN-98422-US',
    consignee: 'Sophia Martinez',
    phone: '+1 (305) 881-2309',
    destination: 'Miami, Florida',
    cod: 120.00,
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'UNPAID',
    createdAt: '45 mins ago',
  },
  {
    id: 'SHN-98423-US',
    consignee: 'Marcus Vance',
    phone: '+1 (206) 714-9921',
    destination: 'Seattle, Washington',
    cod: 32.00,
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    createdAt: '2 hours ago',
  },
  {
    id: 'SHN-98424-US',
    consignee: 'Emily Thornton',
    phone: '+1 (415) 309-1184',
    destination: 'San Francisco, California',
    cod: 89.90,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: '3 hours ago',
  },
  {
    id: 'SHN-98425-US',
    consignee: 'Liam Davis',
    phone: '+1 (773) 612-4091',
    destination: 'Chicago, Illinois',
    cod: 215.00,
    status: 'PICKED_UP',
    paymentStatus: 'UNPAID',
    createdAt: '4 hours ago',
  },
];

export default function MerchantDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredShipments = RECENT_SHIPMENTS.filter(
    (s) =>
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      role="merchant"
      title="Merchant Dashboard"
      subtitle="Real-time parcel dispatch, COD settlements, and live logistics overview"
      primaryActionLabel="Create Shipment"
      onPrimaryAction={() => alert('Opening Create Shipment modal...')}
    >
      {/* 1. KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Shipments"
          value="128"
          icon={Package}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{ value: '+14.2%', isPositive: true, period: 'vs yesterday' }}
        />

        <StatCard
          title="In Transit"
          value="45"
          icon={Truck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          subtext="Across 3 regional hubs"
        />

        <StatCard
          title="Delivered Today"
          value="84"
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          change={{ value: '98.6%', isPositive: true, period: 'on-time rate' }}
        />

        <StatCard
          title="COD Outstanding (USD)"
          value="$4,250.00"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          subtext="Next settlement: Tomorrow"
        />
      </div>

      {/* 2. Main Content Grid: Shipments Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Shipments Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0 overflow-hidden">
            {/* Table Header & Search */}
            <div className="p-4 sm:p-5 border-b border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Active Shipments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing real-time parcels dispatched today
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter table..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-all w-40 sm:w-48"
                  />
                </div>
                <button 
                  className="h-8 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md text-xs font-medium flex items-center gap-1"
                  aria-label="Filter options"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Tracking ID</th>
                    <th className="py-3 px-4">Consignee</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">COD (USD)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-blue-600">
                          <span>{s.id}</span>
                          <button
                            onClick={() => handleCopy(s.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                            title="Copy tracking ID"
                          >
                            {copiedId === s.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">{s.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{s.consignee}</div>
                        <div className="text-[11px] text-slate-400">{s.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {s.destination}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        ${s.cod.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={s.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/track?id=${s.id}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        >
                          <span>Track</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-4">
              <span>Showing {filteredShipments.length} of 128 orders</span>
              <Link href="/dashboard/shipments" className="font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                View All Shipments <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Quick Actions & Pickup Schedule */}
        <div className="space-y-5">
          {/* Quick Pickup Request Card */}
          <Card className="p-5 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Scheduled Pickup
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded">
                Today 3:00 PM
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-2">
              Headquarters Hub Van #4
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Rider <strong>David Miller</strong> is assigned for 18 ready parcel pickups.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Need immediate pickup?</span>
              <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                Request Extra
              </Button>
            </div>
          </Card>

          {/* COD Settlement Summary Card */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Settlement & Payouts
              </h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Collected This Week</span>
                <span className="font-bold text-slate-900">$12,840.00</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Courier Delivery Fees</span>
                <span className="font-bold text-slate-700">-$642.00</span>
              </div>
              <div className="flex justify-between py-1.5 font-semibold">
                <span className="text-slate-800">Net Payable to Store</span>
                <span className="font-bold text-emerald-600 text-sm">$12,198.00</span>
              </div>
            </div>

            <div className="mt-4">
              <Button variant="primary" size="sm" className="w-full h-9 text-xs">
                Download Settlement Statement
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
