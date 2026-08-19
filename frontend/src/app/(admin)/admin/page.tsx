'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Truck, 
  Package, 
  Database, 
  Check, 
  X, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  MapPin
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, StatusBadge, Button, Card } from '@/components/ui';

interface MerchantKYC {
  id: string;
  name: string;
  businessType: string;
  email: string;
  rateCard: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  submittedAt: string;
}

const INITIAL_KYC_REQUESTS: MerchantKYC[] = [
  {
    id: 'MC-101',
    name: 'Apex Global Imports LLC',
    businessType: 'Cross-Border E-Commerce',
    email: 'contact@apexglobal.com',
    rateCard: 'Standard Enterprise USD',
    status: 'PENDING',
    submittedAt: 'Today 10:15 AM',
  },
  {
    id: 'MC-102',
    name: 'Nordic Gear International',
    businessType: 'Retail & Apparel',
    email: 'support@nordicgear.com',
    rateCard: 'High-Volume Commercial',
    status: 'VERIFIED',
    submittedAt: 'Yesterday',
  },
  {
    id: 'MC-103',
    name: 'Volt Electronics Hub',
    businessType: 'Consumer Tech Distribution',
    email: 'ops@volthub.io',
    rateCard: 'Standard Enterprise USD',
    status: 'PENDING',
    submittedAt: 'Today 1:30 PM',
  },
];

export default function AdminPage() {
  const [kycList, setKycList] = useState<MerchantKYC[]>(INITIAL_KYC_REQUESTS);

  const handleAction = (id: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setKycList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <DashboardLayout
      role="admin"
      title="Superadmin Operations Console"
      subtitle="Enterprise system overview, merchant verifications, and global fleet metrics"
      primaryActionLabel="New Branch Hub"
      onPrimaryAction={() => alert('Opening Create Branch Hub modal...')}
    >
      {/* 1. Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Merchants"
          value="342"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50 border-blue-100"
          change={{ value: '+18 this week', isPositive: true }}
        />

        <StatCard
          title="On-Duty Fleet Riders"
          value="86"
          icon={Truck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          subtext="Active across 14 hubs"
        />

        <StatCard
          title="Global Deliveries Today"
          value="5,420"
          icon={Package}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
          change={{ value: '+8.4%', isPositive: true, period: 'vs avg' }}
        />

        <StatCard
          title="System Health & DB"
          value="100% OK"
          icon={Database}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          subtext="PostgreSQL 16 & Redis 7 Synced"
        />
      </div>

      {/* 2. Merchant KYC Verification & Approvals Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Merchant KYC Approval Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and verify merchant business tax and commercial registrations
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
            {kycList.filter((k) => k.status === 'PENDING').length} Pending Approvals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4">Merchant Name</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Rate Card Assigned</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {kycList.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{m.name}</div>
                    <div className="text-[11px] text-slate-400">{m.email}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {m.businessType}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                    {m.rateCard}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {m.submittedAt}
                  </td>

                  <td className="py-3.5 px-4">
                    <StatusBadge
                      status={m.status === 'VERIFIED' ? 'DELIVERED' : m.status === 'REJECTED' ? 'FAILED' : 'PENDING'}
                      size="sm"
                    />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {m.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAction(m.id, 'VERIFIED')}
                          className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 font-medium"
                          leftIcon={<Check className="w-3 h-3 stroke-[2.5]" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(m.id, 'REJECTED')}
                          className="h-7 px-2.5 text-[11px] text-red-600 hover:bg-red-50 border-red-200 font-medium"
                          leftIcon={<X className="w-3 h-3 stroke-[2.5]" />}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 capitalize">
                        {m.status.toLowerCase()}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. Global Infrastructure Hubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Main Logistics Center</div>
            <div className="text-sm font-bold text-slate-900">Headquarters Hub (Austin, TX)</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Operational (100% SLA)
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Coverage Zones</div>
            <div className="text-sm font-bold text-slate-900">8 Active Delivery Sectors</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              Next-Day & Same-Day Express
            </div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Currency & Billing Gateway</div>
            <div className="text-sm font-bold text-slate-900">USD ($) • Stripe & PayPal</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              Automated COD Settlements
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
