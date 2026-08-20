'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Zap, ZapOff, Volume2, VolumeX, X, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui';

/* ── Types ── */
interface CameraBarcodeScannerProps {
  onScan: (code: string) => void;
  onClose?: () => void;
  continuous?: boolean;
  torch?: boolean;
  className?: string;
}

interface ScanResult {
  code: string;
  timestamp: number;
}

/* ── Audio Beep Generator ── */
function playBeep(frequency = 1200, duration = 120) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not available — silent fallback
  }
}

function playErrorBeep() {
  playBeep(400, 250);
}

/* ── Component ── */
export default function CameraBarcodeScanner({
  onScan,
  onClose,
  continuous = true,
  torch: initialTorch = false,
  className = '',
}: CameraBarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [torchOn, setTorchOn] = useState(initialTorch);
  const [soundOn, setSoundOn] = useState(true);
  const [lastCode, setLastCode] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string>('');

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);

        // Try BarcodeDetector API first
        if ('BarcodeDetector' in window) {
          const formats = (await (window as any).BarcodeDetector.getSupportedFormats?.()) || ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8'];
          detectorRef.current = new (window as any).BarcodeDetector({ formats });
          scanLoop();
        } else {
          // Fallback: use requestAnimationFrame with manual check
          setError('BarcodeDetector not supported — camera active but scanning disabled');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Camera access denied');
    }
  }, []);

  const scanLoop = useCallback(() => {
    if (!videoRef.current || !detectorRef.current) return;

    const detect = async () => {
      try {
        if (!videoRef.current || !detectorRef.current || !isActive) return;

        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes && barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          if (code && code !== lastCode) {
            setLastCode(code);
            setScanHistory((prev) => [{ code, timestamp: Date.now() }, ...prev].slice(0, 20));

            if (soundOn) playBeep();
            onScan(code);

            if (!continuous) {
              stopCamera();
              return;
            }
          }
        }
      } catch {
        // Detection error — continue scanning
      }

      animFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [isActive, lastCode, soundOn, continuous, onScan, stopCamera]);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as any],
        });
        setTorchOn(!torchOn);
      }
    } catch {
      // Torch not supported
    }
  }, [torchOn]);

  // Start on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className={`relative bg-black rounded overflow-hidden ${className}`}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Scan Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Crosshair */}
        <div className="relative w-56 h-56">
          {/* Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br" />

          {/* Scan Line Animation */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-[scanLine_2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded text-[11px] font-semibold text-white">
          <ScanLine className="w-3 h-3" />
          {isActive ? 'Scanning...' : 'Initializing...'}
        </div>
      </div>

      {/* Last Scanned Code */}
      {lastCode && (
        <div className="absolute top-3 right-3">
          <div className="px-2.5 py-1 bg-emerald-600/90 backdrop-blur-sm rounded text-[11px] font-bold text-white font-mono">
            {lastCode}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={toggleTorch}
            className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={torchOn ? 'Torch Off' : 'Torch On'}
          >
            {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="w-9 h-9 rounded flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            title={soundOn ? 'Mute' : 'Unmute'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={() => { stopCamera(); onClose(); }}
              className="w-9 h-9 rounded flex items-center justify-center bg-red-500/80 hover:bg-red-600 text-white transition-colors"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center p-4">
            <CameraOff className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-white font-semibold">Camera Error</p>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-3 text-white border-white/30" onClick={startCamera}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Scan History (for continuous mode) */}
      {continuous && scanHistory.length > 0 && (
        <div className="absolute bottom-14 left-3 right-3 max-h-24 overflow-y-auto">
          <div className="space-y-1">
            {scanHistory.slice(0, 5).map((item, i) => (
              <div
                key={item.timestamp}
                className="flex items-center justify-between px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-[10px]"
              >
                <span className="font-mono text-white">{item.code}</span>
                <span className="text-slate-400">
                  {i === 0 ? 'Just now' : `${i}s ago`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inline styles for scan line animation */}
      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(220px); }
        }
      `}</style>
    </div>
  );
}
