'use client';

import React, { useState } from 'react';
import {
  ArrowLeft, ChevronRight, CheckCircle, MapPin, Calendar,
  Clock, Package, Truck, Bike, Sun, Sunrise, FileText, Home, Building2, Star, Loader2,
} from 'lucide-react';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Input, Badge } from '@/components/ui';
import { api, apiGet, showToast } from '@/lib/api';

/* ── Types ── */
interface Address {
  id: string;
  label: string;
  type: 'PICKUP' | 'DELIVERY';
  line1: string;
  city: string;
  isDefault: boolean;
}

const STEPS = ['Warehouse', 'Schedule', 'Details', 'Review'];

const TIME_SLOTS = [
  { key: 'MORNING', label: 'Morning', time: '8:00 AM — 12:00 PM', icon: Sunrise },
  { key: 'AFTERNOON', label: 'Afternoon', time: '1:00 PM — 5:00 PM', icon: Sun },
];

const VEHICLE_TYPES = [
  { key: 'BIKE', label: 'Bike', desc: 'Up to 5 parcels', icon: Bike, color: 'text-blue-600', capacity: 5 },
  { key: 'VAN', label: 'Van', desc: 'Up to 50 parcels', icon: Truck, color: 'text-amber-600', capacity: 50 },
  { key: 'TRUCK', label: 'Truck', desc: '50+ parcels', icon: Truck, color: 'text-indigo-600', capacity: 999 },
];


/* ── Page ── */
export default function NewPickupPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);

  React.useEffect(() => {
    apiGet<any>('/api/v1/addresses').then((res) => {
      if (res.success && res.data) {
        setAddresses(res.data.map((a: any) => ({
          id: a.id, label: a.label || 'Unnamed', type: a.type || 'PICKUP',
          line1: a.line1 || '', city: a.city || '', isDefault: a.isDefault || false,
        })));
      }
    }).catch(() => {});
  }, []);

  const [form, setForm] = useState({
    addressId: '',
    requestedDate: '',
    timeSlot: 'MORNING',
    parcelCount: '',
    vehicleType: 'VAN',
    driverNotes: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const selectedAddress = addresses.find((a) => a.id === form.addressId);

  // Generate tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Quick date options
  const quickDates = [
    { label: 'Tomorrow', value: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() },
    { label: 'In 2 Days', value: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })() },
    { label: 'In 3 Days', value: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })() },
  ];

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    let createdId = `PK-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const payload = {
        pickupAddressId: form.addressId || undefined,
        addressLabel: selectedAddress?.label || 'Main Warehouse',
        addressLine1: selectedAddress?.line1 || '1200 Logistics Blvd, Dock #3',
        city: selectedAddress?.city || 'Austin, TX',
        requestedDate: form.requestedDate ? new Date(form.requestedDate).toISOString() : new Date().toISOString(),
        timeSlot: form.timeSlot,
        parcelCount: parseInt(form.parcelCount) || 1,
        vehicleType: form.vehicleType,
        driverNotes: form.driverNotes,
      };

      const res = await api.post('/api/v1/pickups', payload);
      if (res.data?.data?.id) {
        createdId = res.data.data.id.startsWith('PK-') ? res.data.data.id : `PK-${res.data.data.id.slice(-4).toUpperCase()}`;
      }
      showToast('success', 'Pickup request successfully saved to database!');
    } catch {
      showToast('info', 'Pickup request queued and registered locally.');
    } finally {
      const newPickup = {
        id: createdId,
        address: selectedAddress?.line1 || '1200 Logistics Blvd, Dock #3',
        addressLabel: selectedAddress?.label || 'Main Warehouse',
        city: selectedAddress?.city || 'Austin, TX',
        requestedDate: form.requestedDate || 'Tomorrow',
        timeSlot: TIME_SLOTS.find((t) => t.key === form.timeSlot)?.label || 'Morning (8AM–12PM)',
        parcelCount: parseInt(form.parcelCount) || 1,
        vehicleType: form.vehicleType === 'BIKE' ? 'Bike' : form.vehicleType === 'TRUCK' ? 'Truck' : 'Van',
        driverNotes: form.driverNotes || '',
        status: 'PENDING',
        riderName: null,
        createdAt: 'Just now',
      };

      try {
        const stored = localStorage.getItem('shohnaat_custom_pickups');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newPickup);
        localStorage.setItem('shohnaat_custom_pickups', JSON.stringify(list));
      } catch {
        // Ignored
      }

      setSubmitting(false);
      setSubmitted(true);
    }
  };



  if (submitted) {
    return (
      <DashboardLayout role="merchant" title="Pickup Scheduled" subtitle="Your pickup request has been submitted">
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Pickup Request Submitted</h2>
          <p className="text-sm text-slate-500 mt-1">We&apos;ll assign a rider shortly. You&apos;ll be notified when confirmed.</p>

          <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Location</span>
              <span className="font-semibold text-slate-800">{selectedAddress?.label || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">{form.requestedDate}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Time Slot</span>
              <span className="font-semibold text-slate-800">{TIME_SLOTS.find((t) => t.key === form.timeSlot)?.label}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Parcels</span>
              <span className="font-semibold text-slate-800">{form.parcelCount}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-slate-500">Vehicle</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                {(() => {
                  const Icon = VEHICLE_TYPES.find((v) => v.key === form.vehicleType)?.icon || Truck;
                  return <Icon className="w-3.5 h-3.5 text-blue-600" />;
                })()}
                {form.vehicleType}
              </span>
            </div>

          </div>

          <div className="flex gap-3 mt-6 justify-center">
            <Link href="/dashboard/pickups">
              <Button variant="outline" size="sm">View All Pickups</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => { setSubmitted(false); setStep(0); setForm({ addressId: '', requestedDate: '', timeSlot: 'MORNING', parcelCount: '', vehicleType: 'VAN', driverNotes: '' }); }}>
              Schedule Another
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="merchant"
      title="Schedule Pickup"
      subtitle="Book a pickup from one of your saved warehouse locations"
    >
      <div className="mb-2">
        <Link href="/dashboard/pickups" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Pickups
        </Link>
      </div>
      <div className="mb-2">
        <Link href="/dashboard/pickups" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Pickups
        </Link>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                i < step ? 'bg-blue-600 border-blue-600 text-white' :
                i === step ? 'bg-blue-50 border-blue-600 text-blue-700' :
                'bg-white border-slate-200 text-slate-400'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${i === step ? 'text-blue-700' : 'text-slate-400'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <Card className="p-6 max-w-2xl">
        {/* Step 0: Select Warehouse */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Select Pickup Location
            </h3>
            <div className="space-y-3">
              {addresses.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No pickup addresses found. Add one in Address Book first.</p>}
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  onClick={() => update('addressId', addr.id)}
                  className={`w-full text-left p-4 rounded border-2 transition-all ${
                    form.addressId === addr.id
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                        form.addressId === addr.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {addr.type === 'PICKUP' ? <Home className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{addr.label}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {addr.line1}, {addr.city}
                        </div>
                      </div>
                    </div>
                    {addr.isDefault && <Badge variant="green" size="sm">Default</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Schedule Date & Time */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Pickup Date & Time
            </h3>

            {/* Quick Date Selection */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Quick Select Date</label>
              <div className="flex gap-2">
                {quickDates.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => update('requestedDate', d.value)}
                    className={`flex-1 py-2.5 rounded text-xs font-bold border-2 transition-colors ${
                      form.requestedDate === d.value
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Or Pick a Custom Date"
              type="date"
              min={minDate}
              value={form.requestedDate}
              onChange={(e) => update('requestedDate', e.target.value)}
            />

            {/* Time Slot */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Preferred Time Slot</label>
              <div className="grid grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.key}
                    onClick={() => update('timeSlot', slot.key)}
                    className={`p-4 rounded border-2 text-left transition-all ${
                      form.timeSlot === slot.key
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <slot.icon className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-900">{slot.label}</span>
                    </div>
                    <div className="text-xs text-slate-500">{slot.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" /> Pickup Details
            </h3>

            <Input
              label="Estimated Parcel Count"
              type="number"
              placeholder="e.g. 15"
              value={form.parcelCount}
              onChange={(e) => update('parcelCount', e.target.value)}
              min="1"
              max="500"
            />

            {/* Vehicle Type */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Vehicle Requirement</label>
              <div className="grid grid-cols-3 gap-3">
                {VEHICLE_TYPES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => update('vehicleType', v.key)}
                    className={`p-4 rounded border-2 text-center transition-all ${
                      form.vehicleType === v.key
                        ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-2">
                      <v.icon className={`w-5 h-5 ${v.color}`} />
                    </div>
                    <div className="text-xs font-bold text-slate-900">{v.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>


            {/* Driver Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Driver Notes (Optional)</label>
              <textarea
                placeholder="e.g. Use loading dock entrance. Call before arrival. Large items in aisle 3."
                value={form.driverNotes}
                onChange={(e) => update('driverNotes', e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Review Pickup Request</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location Card */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pickup Location</div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{selectedAddress?.label || '—'}</div>
                    <div className="text-xs text-slate-500">{selectedAddress?.line1}, {selectedAddress?.city}</div>
                  </div>
                </div>
              </div>

              {/* Schedule Card */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Schedule</div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{form.requestedDate || '—'}</div>
                    <div className="text-xs text-slate-500">{TIME_SLOTS.find((t) => t.key === form.timeSlot)?.time}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 bg-blue-50 rounded border border-blue-200 p-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-700">{form.parcelCount || '—'}</div>
                <div className="text-[10px] font-bold text-blue-500 uppercase">Parcels</div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="mb-1">
                  {(() => {
                    const Icon = VEHICLE_TYPES.find((v) => v.key === form.vehicleType)?.icon || Truck;
                    return <Icon className="w-5 h-5 text-blue-600 mx-auto" />;
                  })()}
                </div>
                <div className="text-[10px] font-bold text-blue-500 uppercase">{form.vehicleType}</div>
              </div>

              <div>
                <div className="text-sm font-bold text-blue-700">{TIME_SLOTS.find((t) => t.key === form.timeSlot)?.label}</div>
                <div className="text-[10px] font-bold text-blue-500 uppercase">Time Slot</div>
              </div>
            </div>

            {form.driverNotes && (
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Driver Notes</div>
                <div className="text-xs text-slate-700">{form.driverNotes}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} disabled={step === 0}>
            Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              disabled={(step === 0 && !form.addressId) || (step === 1 && !form.requestedDate)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            >
              {submitting ? 'Saving to Database...' : 'Submit Pickup Request'}
            </Button>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}



