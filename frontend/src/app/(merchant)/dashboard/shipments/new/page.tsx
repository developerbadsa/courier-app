'use client';

import React, { useState } from 'react';
import { Package, ArrowLeft, ChevronRight, CheckCircle, User, MapPin, Weight, CreditCard, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Input } from '@/components/ui';
import { apiPost, showToast } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Multi-Step Shipment Creation Wizard                                 */
/* ------------------------------------------------------------------ */
const STEPS = ['Shipper Info', 'Consignee', 'Package Specs', 'Review & Submit'];

export default function CreateShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    // Shipper
    shipperName: '',
    shipperPhone: '',
    pickupAddress: '',
    pickupCity: '',
    // Consignee
    consigneeName: '',
    consigneePhone: '',
    consigneeAltPhone: '',
    deliveryAddress: '',
    deliveryCity: '',
    // Package
    weightKg: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    // Payment
    paymentType: 'COD',
    codAmount: '',
    serviceType: 'STANDARD',
    notes: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const canNext = step < STEPS.length - 1;
  const canPrev = step > 0;

  const handleSubmit = async () => {
    if (!form.consigneeName || !form.consigneePhone) {
      showToast('error', 'Consignee name and phone are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        consigneeName: form.consigneeName,
        consigneePhone: form.consigneePhone,
        consigneeAltPhone: form.consigneeAltPhone || undefined,
        pickupAddressSnap: {
          street: form.pickupAddress || undefined,
          city: form.pickupCity || undefined,
          contactName: form.shipperName || undefined,
          contactPhone: form.shipperPhone || undefined,
        },
        deliveryAddressSnap: {
          street: form.deliveryAddress || undefined,
          city: form.deliveryCity || undefined,
        },
        weightKg: form.weightKg ? parseFloat(form.weightKg) : undefined,
        paymentType: form.paymentType,
        codAmount: form.paymentType === 'COD' ? (form.codAmount ? parseFloat(form.codAmount) : 0) : 0,
        serviceType: form.serviceType,
      };

      const res = await apiPost<any>('/api/v1/shipments', payload);

      if (res.success && res.data) {
        const tn = res.data.trackingNumber || res.data.id || '—';
        setTrackingNumber(tn);
        setSubmitted(true);
        showToast('success', `Shipment booked! Tracking: ${tn}`);
      } else {
        showToast('error', res.message || 'Failed to create shipment. Please try again.');
      }
    } catch {
      showToast('error', 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <DashboardLayout role="merchant" title="Shipment Created" subtitle="Your shipment has been booked successfully">
        <Card className="p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Shipment Booked Successfully</h2>
          <p className="text-sm text-slate-500 mt-1">Your parcel has been registered in the system.</p>

          {trackingNumber && (
            <div className="mt-6 p-4 bg-slate-50 rounded border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking Number</div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-lg font-bold text-primary">{trackingNumber}</span>
                <button onClick={handleCopyTracking} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded border border-slate-200">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6 justify-center">
            <Link href="/dashboard/shipments">
              <Button variant="outline" size="sm">View Shipments</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => {
              setSubmitted(false);
              setTrackingNumber('');
              setStep(0);
              setForm({
                shipperName: '', shipperPhone: '', pickupAddress: '', pickupCity: '',
                consigneeName: '', consigneePhone: '', consigneeAltPhone: '', deliveryAddress: '', deliveryCity: '',
                weightKg: '', lengthCm: '', widthCm: '', heightCm: '', paymentType: 'COD', codAmount: '', serviceType: 'STANDARD', notes: '',
              });
            }}>
              Create Another
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="merchant"
      title="Create Shipment"
      subtitle="Book a new parcel for pickup and delivery"
    >
      <div className="mb-2">
        <Link href="/dashboard/shipments" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Shipments
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
        {/* Step 0: Shipper Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" /> Shipper Information
            </h3>
            <Input label="Contact Name" placeholder="e.g. John Smith" value={form.shipperName} onChange={(e) => update('shipperName', e.target.value)} />
            <Input label="Phone Number" placeholder="+1 (555) 123-4567" value={form.shipperPhone} onChange={(e) => update('shipperPhone', e.target.value)} />
            <Input label="Pickup Address" placeholder="Street address, suite, building" value={form.pickupAddress} onChange={(e) => update('pickupAddress', e.target.value)} />
            <Input label="City" placeholder="e.g. Austin" value={form.pickupCity} onChange={(e) => update('pickupCity', e.target.value)} />
          </div>
        )}

        {/* Step 1: Consignee */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Consignee (Receiver)
            </h3>
            <Input label="Receiver Name" placeholder="e.g. Jane Doe" value={form.consigneeName} onChange={(e) => update('consigneeName', e.target.value)} />
            <Input label="Phone Number" placeholder="+1 (555) 987-6543" value={form.consigneePhone} onChange={(e) => update('consigneePhone', e.target.value)} />
            <Input label="Alternate Phone (Optional)" placeholder="+1 (555) 000-0000" value={form.consigneeAltPhone} onChange={(e) => update('consigneeAltPhone', e.target.value)} />
            <Input label="Delivery Address" placeholder="Full delivery address" value={form.deliveryAddress} onChange={(e) => update('deliveryAddress', e.target.value)} />
            <Input label="City" placeholder="e.g. Miami" value={form.deliveryCity} onChange={(e) => update('deliveryCity', e.target.value)} />
          </div>
        )}

        {/* Step 2: Package Specs */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Weight className="w-4 h-4 text-blue-600" /> Package Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Weight (kg)" type="number" placeholder="0.5" value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} />
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Service Type</label>
                <select
                  value={form.serviceType}
                  onChange={(e) => update('serviceType', e.target.value)}
                  className="w-full h-[42px] px-3.5 text-sm bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="STANDARD">Standard (2-3 days)</option>
                  <option value="EXPRESS">Express (Next day)</option>
                  <option value="ECONOMY">Economy (5-7 days)</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Dimensions (Optional — used for volumetric weight)</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Length (cm)" type="number" placeholder="30" value={form.lengthCm} onChange={(e) => update('lengthCm', e.target.value)} />
              <Input label="Width (cm)" type="number" placeholder="20" value={form.widthCm} onChange={(e) => update('widthCm', e.target.value)} />
              <Input label="Height (cm)" type="number" placeholder="15" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
            </div>

            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pt-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Payment
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Payment Type</label>
                <select
                  value={form.paymentType}
                  onChange={(e) => update('paymentType', e.target.value)}
                  className="w-full h-[42px] px-3.5 text-sm bg-white border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="PREPAID">Prepaid</option>
                </select>
              </div>
              {form.paymentType === 'COD' && (
                <Input label="COD Amount (USD)" type="number" placeholder="0.00" value={form.codAmount} onChange={(e) => update('codAmount', e.target.value)} />
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900">Review Shipment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Shipper</div>
                <div className="text-sm font-semibold text-slate-900">{form.shipperName || '—'}</div>
                <div className="text-xs text-slate-500">{form.shipperPhone || '—'}</div>
                <div className="text-xs text-slate-500 mt-1">{form.pickupAddress} {form.pickupCity}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Consignee</div>
                <div className="text-sm font-semibold text-slate-900">{form.consigneeName || '—'}</div>
                <div className="text-xs text-slate-500">{form.consigneePhone || '—'}</div>
                <div className="text-xs text-slate-500 mt-1">{form.deliveryAddress} {form.deliveryCity}</div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded border border-blue-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Weight</div>
                <div className="text-sm font-bold text-slate-900">{form.weightKg || '—'} kg</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Service</div>
                <div className="text-sm font-bold text-slate-900">{form.serviceType}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Payment</div>
                <div className="text-sm font-bold text-slate-900">
                  {form.paymentType}{form.paymentType === 'COD' ? ` $${form.codAmount || '0.00'}` : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={!canPrev || submitting}
          >
            Previous
          </Button>
          {canNext ? (
            <Button variant="primary" size="sm" onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!form.consigneeName || !form.consigneePhone)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}
              leftIcon={submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}>
              {submitting ? 'Booking...' : 'Book Shipment'}
            </Button>
          )}
        </div>
      </Card>
    </DashboardLayout>
  );
}
