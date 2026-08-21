'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  X,
  ExternalLink,
  Apple,
  MonitorSmartphone,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * DownloadAppBanner — Shows on rider portal page
 * Detects platform and shows the right install option:
 *  - Android Chrome: PWA install prompt + APK fallback
 *  - iOS Safari: Add to Home Screen instructions
 *  - Desktop: QR code / link to mobile
 */
export default function DownloadAppBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('download-banner-dismissed')) {
      setDismissed(true);
      return;
    }

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes('android');
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isMobile = isAndroid || isIOS || ua.includes('mobile');

    if (isAndroid) setPlatform('android');
    else if (isIOS) setPlatform('ios');
    else setPlatform('desktop');

    // Listen for PWA install prompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDismissed(true);
        sessionStorage.setItem('download-banner-dismissed', 'true');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('download-banner-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-blue-600/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Get the Shohnaat Rider App</h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5 text-white/70" />
              </button>
            </div>
            <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed">
              {platform === 'android' && 'Install the app for offline access, GPS tracking, and instant notifications.'}
              {platform === 'ios' && 'Add Shohnaat Rider to your home screen for the best mobile experience.'}
              {platform === 'desktop' && 'Download the mobile app for on-the-go delivery management.'}
            </p>

            <div className="flex items-center gap-2 mt-3">
              {/* Primary install button */}
              {platform === 'android' && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install App
                </button>
              )}

              {/* APK Download fallback */}
              <a
                href="/downloads/shohnaat-rider.apk"
                download="shohnaat-rider.apk"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-lg text-xs font-bold hover:bg-white/25 transition-colors border border-white/20"
                onClick={() => {
                  setDismissed(true);
                  sessionStorage.setItem('download-banner-dismissed', 'true');
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Download APK
              </a>

              {/* iOS: Show instructions */}
              {platform === 'ios' && (
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-lg text-xs font-bold hover:bg-white/25 transition-colors border border-white/20"
                >
                  <Apple className="w-3.5 h-3.5" />
                  How to Install
                </button>
              )}

              {/* Desktop: show instructions / link */}
              {platform === 'desktop' && (
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-lg text-xs font-bold hover:bg-white/25 transition-colors border border-white/20"
                >
                  <MonitorSmartphone className="w-3.5 h-3.5" />
                  Install on Phone
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowInstructions(false)}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold">Install Shohnaat Rider</h3>
                <button onClick={() => setShowInstructions(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/80">
                {platform === 'ios'
                  ? 'Follow these steps to add the app to your home screen:'
                  : 'Scan this QR code with your phone camera to download the app:'}
              </p>
            </div>

            <div className="p-5">
              {platform === 'ios' ? (
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <span>Tap the <strong>Share button</strong> (square with arrow) in Safari</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <span>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <span>Tap <strong>Add</strong> in the top right corner</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                    <span>Shohnaat Rider will appear on your home screen!</span>
                  </li>
                </ol>
              ) : (
                <div className="text-center">
                  {/* QR Code placeholder - uses goqr.me API */}
                  <div className="inline-block p-3 bg-white rounded-xl border-2 border-slate-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/downloads/shohnaat-rider.apk' : '')}&bgcolor=ffffff&color=2563EB`}
                      alt="QR Code to download app"
                      className="w-[180px] h-[180px]"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Scan with your phone camera to download the APK
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Or visit <strong>{typeof window !== 'undefined' ? window.location.host : ''}/downloads/</strong>
                  </p>

                  <a
                    href="/downloads/shohnaat-rider.apk"
                    download="shohnaat-rider.apk"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
                  >
                    <Download className="w-4 h-4" />
                    Download APK Directly
                  </a>
                </div>
              )}

              {/* PWA Install (Android Chrome) */}
              {platform === 'android' && deferredPrompt && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleInstall}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Install as App (Recommended)
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Faster, works offline, no APK needed
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
