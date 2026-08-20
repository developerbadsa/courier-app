'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Truck, Upload, FileText, CheckCircle2, AlertTriangle,
  Building2, User, Phone, Mail, Lock, ArrowRight, ArrowLeftIcon,
  Loader2, FileCheck, Camera, Shield,
} from 'lucide-react';

/* ── Types ── */
type Step = 1 | 2 | 3;

interface FormData {
  businessName: string;
  businessType: string;
  contactPerson: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  nidFront: File | null;
  nidBack: File | null;
  tradeLicense: File | null;
}

const BUSINESS_TYPES = [
  'E-Commerce', 'Fashion & Apparel', 'Electronics', 'Food & Beverages',
  'Health & Beauty', 'Home & Living', 'Books & Stationery', 'Other',
];

export default function MerchantOnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormData>({
    businessName: '',
    businessType: '',
    contactPerson: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    nidFront: null,
    nidBack: null,
    tradeLicense: null,
  });

  const update = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  /* ── Validation ── */
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.businessName.trim()) errs.businessName = 'Business name is required';
    if (!form.businessType) errs.businessType = 'Select a business type';
    if (!form.contactPerson.trim()) errs.contactPerson = 'Contact person is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nidFront) errs.nidFront = 'NID front side is required';
    if (!form.nidBack) errs.nidBack = 'NID back side is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitted(true);
    setSubmitting(false);
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded border border-slate-200 shadow-lg p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Your merchant registration application has been submitted successfully.
            Our team will review your documents and notify you within <strong>24-48 hours</strong> via email and SMS.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <Shield className="w-4 h-4" />
              <span>What happens next?</span>
            </div>
            <ul className="mt-2 text-xs text-blue-600 space-y-1 text-left pl-6">
              <li>• KYC document verification (1-2 business days)</li>
              <li>• Business profile approval</li>
              <li>• API key generation & account activation</li>
              <li>• Welcome email with getting started guide</li>
            </ul>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-100">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between">
          <Link href="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
          <div className="flex items-center gap-2.5 font-bold text-sm text-slate-900">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <span>Shohnaat</span>
          </div>
          <span className="text-xs font-semibold text-blue-600">Register</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { num: 1, label: 'Business Info', icon: Building2 },
            { num: 2, label: 'Documents', icon: FileCheck },
            { num: 3, label: 'Review', icon: CheckCircle2 },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              {i > 0 && <div className={`w-8 h-px ${step >= s.num ? 'bg-blue-600' : 'bg-slate-300'}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                step === s.num ? 'bg-blue-600 text-white' : step > s.num ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Step 1: Business Info ── */}
        {step === 1 && (
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Business Information</h2>
              <p className="text-xs text-slate-500 mt-1">Tell us about your business to get started.</p>
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Name *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="e.g. Acme Store LLC"
                className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.businessName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
              />
              {errors.businessName && <p className="text-[11px] text-red-500 mt-1">{errors.businessName}</p>}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Type *</label>
              <select
                value={form.businessType}
                onChange={(e) => update('businessType', e.target.value)}
                className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 focus:outline-none focus:ring-2 ${errors.businessType ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
              >
                <option value="">Select business type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.businessType && <p className="text-[11px] text-red-500 mt-1">{errors.businessType}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Person *</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => update('contactPerson', e.target.value)}
                placeholder="Full name"
                className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.contactPerson ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
              />
              {errors.contactPerson && <p className="text-[11px] text-red-500 mt-1">{errors.contactPerson}</p>}
            </div>

            {/* Phone + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                />
                {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@business.com"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                />
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min 6 characters"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                />
                {errors.password && <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                />
                {errors.confirmPassword && <p className="text-[11px] text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Documents ── */}
        {step === 2 && (
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">KYC Documents</h2>
              <p className="text-xs text-slate-500 mt-1">Upload your identification documents for verification.</p>
            </div>

            {/* NID Front */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">National ID — Front Side *</label>
              <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded cursor-pointer transition-colors ${errors.nidFront ? 'border-red-400 bg-red-50' : form.nidFront ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => update('nidFront', e.target.files?.[0] || null)} />
                {form.nidFront ? (
                  <>
                    <FileCheck className="w-6 h-6 text-emerald-500" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-700">{form.nidFront.name}</div>
                      <div className="text-[10px] text-emerald-500">Click to change</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-slate-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Click to upload NID front</div>
                      <div className="text-[10px] text-slate-400">JPG, PNG or PDF (max 5MB)</div>
                    </div>
                  </>
                )}
              </label>
              {errors.nidFront && <p className="text-[11px] text-red-500 mt-1">{errors.nidFront}</p>}
            </div>

            {/* NID Back */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">National ID — Back Side *</label>
              <label className={`flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded cursor-pointer transition-colors ${errors.nidBack ? 'border-red-400 bg-red-50' : form.nidBack ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => update('nidBack', e.target.files?.[0] || null)} />
                {form.nidBack ? (
                  <>
                    <FileCheck className="w-6 h-6 text-emerald-500" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-700">{form.nidBack.name}</div>
                      <div className="text-[10px] text-emerald-500">Click to change</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-slate-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Click to upload NID back</div>
                      <div className="text-[10px] text-slate-400">JPG, PNG or PDF (max 5MB)</div>
                    </div>
                  </>
                )}
              </label>
              {errors.nidBack && <p className="text-[11px] text-red-500 mt-1">{errors.nidBack}</p>}
            </div>

            {/* Trade License (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Trade License (Optional)</label>
              <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 rounded cursor-pointer transition-colors">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => update('tradeLicense', e.target.files?.[0] || null)} />
                {form.tradeLicense ? (
                  <>
                    <FileCheck className="w-6 h-6 text-emerald-500" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-700">{form.tradeLicense.name}</div>
                      <div className="text-[10px] text-emerald-500">Click to change</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Click to upload trade license</div>
                      <div className="text-[10px] text-slate-400">JPG, PNG or PDF (max 5MB)</div>
                    </div>
                  </>
                )}
              </label>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ── */}
        {step === 3 && (
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Review Application</h2>
              <p className="text-xs text-slate-500 mt-1">Verify your information before submitting.</p>
            </div>

            {/* Business Info Review */}
            <div className="bg-slate-50 rounded border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Business Information</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500">Business Name:</span> <span className="font-semibold text-slate-900 ml-1">{form.businessName}</span></div>
                <div><span className="text-slate-500">Type:</span> <span className="font-semibold text-slate-900 ml-1">{form.businessType}</span></div>
                <div><span className="text-slate-500">Contact:</span> <span className="font-semibold text-slate-900 ml-1">{form.contactPerson}</span></div>
                <div><span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-900 ml-1">{form.phone}</span></div>
                <div className="col-span-2"><span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-900 ml-1">{form.email}</span></div>
              </div>
            </div>

            {/* Documents Review */}
            <div className="bg-slate-50 rounded border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Uploaded Documents</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {form.nidFront ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-slate-700">NID Front: {form.nidFront?.name || 'Not uploaded'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.nidBack ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />}
                  <span className="text-slate-700">NID Back: {form.nidBack?.name || 'Not uploaded'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {form.tradeLicense ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
                  <span className="text-slate-700">Trade License: {form.tradeLicense?.name || 'Not uploaded (optional)'}</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-xs text-blue-700">
              By submitting, you agree to Shohnaat Logistics&apos;s{' '}
              <span className="font-semibold underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="font-semibold underline cursor-pointer">Privacy Policy</span>.
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50"
              >
                <ArrowLeftIcon className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
