'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  X,
  Truck,
  Wifi,
  MapPin,
  BatteryCharging,
  ArrowRight,
} from 'lucide-react';

/**
 * AppSuggestionPopup — Appears 3s after rider logs in on web.
 * Links directly to the built APK in mobile-flutter/release-apk/
 */
export default function AppSuggestionPopup() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Check if already dismissed today
    const dismissedDate = sessionStorage.getItem('app-popup-dismissed-date');
    const today = new Date().toDateString();
    if (dismissedDate === today) return;

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setShow(false);
      setClosing(false);
      sessionStorage.setItem('app-popup-dismissed-date', new Date().toDateString());
    }, 200);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Card */}
      <div
        className={`relative w-full sm:max-w-[380px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          closing ? 'translate-y-4 sm:translate-y-0 sm:scale-95 opacity-0' : 'translate-y-0 sm:scale-100 opacity-100'
        }`}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-5 pt-5 pb-8">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">Shohnaat Rider App</h2>
              <p className="text-blue-200 text-[11px] font-medium">Field Delivery Companion</p>
            </div>
          </div>
        </div>

        {/* Curve decoration */}
        <div className="relative -mt-1">
          <svg viewBox="0 0 380 24" className="w-full text-white">
            <path d="M0,0 C190,24 190,24 380,0 L380,24 L0,24 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Features */}
        <div className="px-5 -mt-1 space-y-2.5">
          {[
            { icon: Wifi, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Offline Mode', desc: 'Works without internet' },
            { icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50', text: 'Live GPS Tracking', desc: 'Real-time navigation' },
            { icon: BatteryCharging, color: 'text-amber-600', bg: 'bg-amber-50', text: 'Battery Optimized', desc: 'Low power GPS mode' },
            { icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50', text: 'Instant Notifications', desc: 'Never miss a delivery' },
          ].map(({ icon: Icon, color, bg, text, desc }) => (
            <div key={text} className="flex items-center gap-3 py-1">
              <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{text}</div>
                <div className="text-[10px] text-slate-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="px-5 py-5 space-y-2.5">
          {/* Primary: Download APK */}
          <a
            href="/downloads/shohnaat-rider.apk"
            download="shohnaat-rider.apk"
            onClick={handleClose}
            className="flex items-center justify-center gap-2 w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download Mobile App
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Secondary: dismiss */}
          <button
            onClick={handleClose}
            className="w-full h-10 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Version info */}
        <div className="px-5 pb-4 text-center">
          <p className="text-[9px] text-slate-300 font-medium">
            v1.0.0 • Always free • Built for riders, by riders
          </p>
        </div>
      </div>
    </div>
  );
}
