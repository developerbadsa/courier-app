'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Check,
  Star,
  User,
  MessageSquare,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';

export default function ShipmentDetailsFigmaPage() {
  const params = useParams();
  const router = useRouter();
  const trackingId = (params?.id as string) || 'SH-9082';

  const [notes, setNotes] = useState<string[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      setNotes((prev) => [...prev, newNote.trim()]);
      setNewNote('');
      setShowNoteModal(false);
    }
  };

  return (
    <DashboardLayout role="merchant">
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* ── Back Navigation ── */}
        <div>
          <Link
            href="/dashboard/shipments"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shipments</span>
          </Link>
        </div>

        {/* ── Title & Status Header ── */}
        <div className="flex items-center gap-3.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {trackingId.toUpperCase()}
          </h1>
          <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1D4ED8] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]" />
            <span>In Transit</span>
          </span>
        </div>

        {/* ── Main Two-Column Layout (Figma Match) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Summary & Rider (5 cols) ── */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Shipment Summary */}
            <div className="bg-[#EEF4FF]/70 border border-[#D8E6FF] rounded p-6 space-y-4.5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900">
                Shipment Summary
              </h2>

              {/* Shipper */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SHIPPER
                </p>
                <p className="text-[13.5px] font-bold text-slate-900">
                  GadgetZone
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  +1 (512) 492-8190
                </p>
              </div>

              {/* Consignee */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CONSIGNEE
                </p>
                <p className="text-[13.5px] font-bold text-slate-900">
                  Ahmed K.
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  +1 (415) 309-1184
                </p>
              </div>

              {/* Parcel Info */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  PARCEL INFO
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-bold text-slate-900">
                    2.5 kg
                  </span>
                  <span className="bg-white border border-slate-200/90 text-slate-800 text-xs font-bold px-3 py-1 rounded shadow-2xs">
                    COD: $15.00
                  </span>
                </div>
              </div>

              {/* Pickup Address */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  PICKUP ADDRESS
                </p>
                <p className="text-[13px] font-semibold text-slate-800">
                  450 Lexington Ave, Suite 1400, New York, NY
                </p>
              </div>
            </div>

            {/* Card 2: Rider Assignment */}
            <div className="bg-[#EEF4FF]/70 border border-[#D8E6FF] rounded p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3.5">
                Rider Assignment
              </h2>

              <div className="flex items-center gap-3.5 bg-white/70 border border-slate-200/60 rounded p-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      Karim
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                      <span className="text-xs font-bold text-slate-700">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Assigned Today, 9:00 AM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Activity Timeline (7 cols) ── */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/90 rounded p-6 sm:p-7 shadow-xs">
              {/* Card Header with + Add Note */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  Shipment Activity
                </h2>

                <button
                  onClick={() => setShowNoteModal(true)}
                  className="inline-flex items-center gap-1.5 bg-[#EEF4FF] hover:bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-2 rounded border border-[#D8E6FF] transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Note</span>
                </button>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="mt-7 relative pl-3 sm:pl-4 space-y-8">
                {/* Step 1: Booked (Completed) */}
                <div className="relative flex items-start gap-4.5">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-6 w-0.5 h-10 bg-emerald-400" />

                  {/* Green Check Icon */}
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      Booked{' '}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        Aug 15, 10:00 AM
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 font-normal mt-1">
                      Shipment request received.
                    </p>
                  </div>
                </div>

                {/* Step 2: Picked Up (Completed) */}
                <div className="relative flex items-start gap-4.5">
                  {/* Vertical Line */}
                  <div className="absolute left-3 top-6 w-0.5 h-10 bg-blue-400" />

                  {/* Green Check Icon */}
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
                      Picked Up{' '}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        Aug 15, 2:30 PM
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 font-normal mt-1">
                      Parcel collected from shipper.
                    </p>
                  </div>
                </div>

                {/* Step 3: In Transit (Active) */}
                <div className="relative flex items-start gap-4.5">
                  {/* Blue Active Dot with Ring */}
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white ring-4 ring-blue-100 flex items-center justify-center shrink-0 z-10 shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-[13.5px] font-bold text-[#1D4ED8] leading-tight">
                      In Transit{' '}
                      <span className="text-xs font-normal text-slate-400 ml-1.5">
                        Aug 16, 8:15 AM
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 font-normal mt-1">
                      Parcel is on its way to the delivery hub.
                    </p>
                  </div>
                </div>

                {/* Additional Merchant Notes */}
                {notes.map((note, idx) => (
                  <div key={idx} className="relative flex items-start gap-4.5 pt-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 z-10">
                      <MessageSquare className="w-3 h-3" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 flex-1 text-xs">
                      <p className="font-bold text-slate-800">Merchant Internal Note</p>
                      <p className="text-slate-600 mt-0.5">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Add Note Modal ── */}
        {showNoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="bg-white rounded p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Add Internal Note</h3>
              <form onSubmit={handleAddNote} className="space-y-4">
                <textarea
                  rows={3}
                  required
                  placeholder="Type note about this shipment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-300 rounded focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
