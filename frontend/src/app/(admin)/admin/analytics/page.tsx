'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Users,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Card, Badge, Button } from '@/components/ui';

/* ── Types ── */
interface KPICard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DailyMetric {
  date: string;
  shipments: number;
  revenue: number;
  delivered: number;
  failed: number;
  codCollected: number;
}

interface HubPerformance {
  hub: string;
  shipments: number;
  successRate: number;
  avgTime: number;
  revenue: number;
}

/* ── Mock Data ── */
const KPI_DATA: KPICard[] = [
  { label: 'Total Shipments', value: '12,847', change: '+12.3%', isPositive: true, icon: Package, color: 'blue' },
  { label: 'Revenue (USD)', value: '$384,200', change: '+8.7%', isPositive: true, icon: DollarSign, color: 'emerald' },
  { label: 'Delivery Success', value: '97.2%', change: '+0.4%', isPositive: true, icon: CheckCircle2, color: 'purple' },
  { label: 'Failed Deliveries', value: '362', change: '-15.2%', isPositive: true, icon: XCircle, color: 'red' },
  { label: 'Active Riders', value: '86', change: '+4', isPositive: true, icon: Truck, color: 'amber' },
  { label: 'Active Merchants', value: '342', change: '+18', isPositive: true, icon: Users, color: 'slate' },
  { label: 'COD Collected', value: '$128,400', change: '+6.1%', isPositive: true, icon: DollarSign, color: 'amber' },
  { label: 'Avg Delivery Time', value: '2.4h', change: '-0.3h', isPositive: true, icon: Clock, color: 'blue' },
];

const DAILY_DATA: DailyMetric[] = [
  { date: 'Aug 14', shipments: 420, revenue: 12600, delivered: 412, failed: 8, codCollected: 4200 },
  { date: 'Aug 15', shipments: 385, revenue: 11550, delivered: 378, failed: 7, codCollected: 3850 },
  { date: 'Aug 16', shipments: 510, revenue: 15300, delivered: 498, failed: 12, codCollected: 5100 },
  { date: 'Aug 17', shipments: 468, revenue: 14040, delivered: 460, failed: 8, codCollected: 4680 },
  { date: 'Aug 18', shipments: 532, revenue: 15960, delivered: 524, failed: 8, codCollected: 5320 },
  { date: 'Aug 19', shipments: 620, revenue: 18600, delivered: 608, failed: 12, codCollected: 6200 },
  { date: 'Aug 20', shipments: 580, revenue: 17400, delivered: 571, failed: 9, codCollected: 5800 },
];

const HUB_PERFORMANCE: HubPerformance[] = [
  { hub: 'HQ-001 Austin', shipments: 4820, successRate: 98.4, avgTime: 2.1, revenue: 144600 },
  { hub: 'MIA-002 Miami', shipments: 3680, successRate: 96.8, avgTime: 2.8, revenue: 110400 },
  { hub: 'SEA-003 Seattle', shipments: 2940, successRate: 97.5, avgTime: 2.4, revenue: 88200 },
  { hub: 'CHI-004 Chicago', shipments: 1407, successRate: 95.3, avgTime: 3.2, revenue: 41000 },
];

const STATUS_DISTRIBUTION = [
  { status: 'Delivered', count: 8420, pct: 65.5, color: 'bg-emerald-500' },
  { status: 'In Transit', count: 2340, pct: 18.2, color: 'bg-blue-500' },
  { status: 'Pending', count: 1200, pct: 9.3, color: 'bg-amber-500' },
  { status: 'Failed', count: 362, pct: 2.8, color: 'bg-red-500' },
  { status: 'Returned', count: 525, pct: 4.2, color: 'bg-purple-500' },
];

const TOP_MERCHANTS = [
  { name: 'Apex Global Imports', shipments: 2340, revenue: '$70,200', growth: '+15%' },
  { name: 'Nordic Gear Intl', shipments: 1890, revenue: '$56,700', growth: '+8%' },
  { name: 'Volt Electronics', shipments: 1560, revenue: '$46,800', growth: '+22%' },
  { name: 'Coastal Retail Co', shipments: 1240, revenue: '$37,200', growth: '+5%' },
  { name: 'Metro Distribution', shipments: 980, revenue: '$29,400', growth: '-3%' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');

  const maxShipments = Math.max(...DAILY_DATA.map(d => d.shipments));

  return (
    <DashboardLayout role="admin" title="Global Analytics" subtitle="System-wide revenue, delivery performance, and operational metrics">
      {/* Period Selector */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-4 h-4 text-slate-400" />
        {(['7d', '30d', '90d'] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${period === p ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {KPI_DATA.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium mb-1">{kpi.label}</div>
                <div className="text-xl font-bold text-slate-900">{kpi.value}</div>
              </div>
              <div className={`w-9 h-9 rounded-lg bg-${kpi.color}-50 border border-${kpi.color}-100 flex items-center justify-center text-${kpi.color}-600 shrink-0`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-red-500" />}
              <span className={`text-[11px] font-semibold ${kpi.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>{kpi.change}</span>
              <span className="text-[11px] text-slate-400">vs prev period</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Daily Shipments Bar Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Daily Shipments</h3>
            <Badge variant="blue" size="sm">This Week</Badge>
          </div>
          <div className="space-y-3">
            {DAILY_DATA.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-[11px] font-medium text-slate-500 w-14 shrink-0">{day.date}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden flex">
                  <div className="h-full bg-emerald-500 rounded-l-md transition-all" style={{ width: `${(day.delivered / maxShipments) * 100}%` }} />
                  <div className="h-full bg-red-400" style={{ width: `${(day.failed / maxShipments) * 100}%` }} />
                </div>
                <span className="text-[11px] font-mono font-semibold text-slate-700 w-12 text-right">{day.shipments}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span className="text-[10px] text-slate-500">Delivered</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-400" /><span className="text-[10px] text-slate-500">Failed</span></div>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {STATUS_DISTRIBUTION.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-slate-700">{s.status}</span>
                  <span className="text-[11px] font-mono font-semibold text-slate-600">{s.count.toLocaleString()} ({s.pct}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hub Performance */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Hub Performance</h3>
          <div className="space-y-3">
            {HUB_PERFORMANCE.map((hub) => (
              <div key={hub.hub} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-slate-900">{hub.hub}</span>
                  <Badge variant={hub.successRate >= 98 ? 'green' : hub.successRate >= 96 ? 'amber' : 'red'} size="sm">{hub.successRate}%</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div><span className="text-slate-400">Shipments</span> <span className="font-semibold text-slate-700 ml-1">{hub.shipments.toLocaleString()}</span></div>
                  <div><span className="text-slate-400">Avg Time</span> <span className="font-semibold text-slate-700 ml-1">{hub.avgTime}h</span></div>
                  <div><span className="text-slate-400">Revenue</span> <span className="font-semibold text-slate-700 ml-1">${hub.revenue.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Merchants */}
        <Card className="p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Top Merchants by Volume</h3>
          <div className="space-y-3">
            {TOP_MERCHANTS.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-600 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-slate-900 truncate">{m.name}</div>
                  <div className="text-[11px] text-slate-400">{m.shipments.toLocaleString()} shipments</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-mono font-semibold text-slate-900">{m.revenue}</div>
                  <div className={`text-[10px] font-semibold ${m.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{m.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Trend (simple table) */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Revenue & COD Trend</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-semibold text-slate-500">Date</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Shipments</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Revenue</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Delivered</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Failed</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">COD Collected</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {DAILY_DATA.map((day) => (
                <tr key={day.date} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-900">{day.date}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{day.shipments}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">${day.revenue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">{day.delivered}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-red-500">{day.failed}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-amber-700">${day.codCollected.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-semibold ${(day.delivered / day.shipments * 100) >= 97 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {(day.delivered / day.shipments * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
