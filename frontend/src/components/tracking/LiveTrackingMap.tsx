'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Truck, Bike, MapPin, Phone, Clock, Signal, Navigation } from 'lucide-react';

/* ── Types ── */
export interface MapLocation {
  lat: number;
  lng: number;
}

export interface LiveTrackingData {
  trackingNumber: string;
  status: string;
  origin: MapLocation;
  destination: MapLocation;
  riderLocation?: MapLocation;
  riderHeading?: number;
  riderName?: string;
  riderPhone?: string;
  vehicleType?: string;
  etaMinutes?: number;
  etaLabel?: string;
  distanceKm?: number;
}

interface LiveTrackingMapProps {
  data: LiveTrackingData;
  height?: number;
  className?: string;
}

/* ── Haversine distance ── */
function haversineDistance(a: MapLocation, b: MapLocation): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/* ── Main Component ── */
export default function LiveTrackingMap({ data, height = 400, className = '' }: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);

  /* ── Initialize map ── */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    async function initMap() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L: any = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;

      // Fix Leaflet default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      }).setView([data.origin.lat, data.origin.lng], 12);

      // Tile layer — OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      setReady(true);
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data.origin.lat, data.origin.lng]);

  /* ── Update markers when data changes ── */
  const updateMap = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const L = (await import('leaflet')).default;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom icon factory
    const makeIcon = (color: string, size: number) =>
      L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

    // Origin pin (blue)
    const originMarker = L.marker([data.origin.lat, data.origin.lng], {
      icon: makeIcon('#2563EB', 20),
    })
      .addTo(map)
      .bindPopup(`<b>Origin</b><br>${data.trackingNumber}`);
    markersRef.current.push(originMarker);

    // Destination pin (emerald)
    const destMarker = L.marker([data.destination.lat, data.destination.lng], {
      icon: makeIcon('#059669', 20),
    })
      .addTo(map)
      .bindPopup('<b>Destination</b>');
    markersRef.current.push(destMarker);

    // Route polyline
    const points: [number, number][] = [
      [data.origin.lat, data.origin.lng],
    ];
    if (data.riderLocation) {
      points.push([data.riderLocation.lat, data.riderLocation.lng]);
    }
    points.push([data.destination.lat, data.destination.lng]);

    const polyline = L.polyline(points, {
      color: '#2563EB',
      weight: 3,
      opacity: 0.7,
      dashArray: data.riderLocation ? undefined : '8 8',
    }).addTo(map);
    markersRef.current.push(polyline);

    // Rider marker (animated, with heading)
    if (data.riderLocation) {
      const heading = data.riderHeading || 0;
      const riderIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:36px;height:36px;
          background:#1D68F2;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 12px rgba(29,104,242,0.4);
          display:flex;align-items:center;justify-content:center;
          transform:rotate(${heading}deg);
          transition:transform 0.5s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 4M19 17l1 4M12 3v4"/>
          </svg>
        </div>
        <div style="
          width:12px;height:12px;
          background:#2563EB;
          border:2px solid white;
          border-radius:50%;
          position:absolute;top:-6px;right:-6px;
          animation:pulse 2s infinite;
        "></div>
        <style>@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.3)}}</style>
        <style>@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.3)}}</style>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const riderMarker = L.marker([data.riderLocation.lat, data.riderLocation.lng], {
        icon: riderIcon,
      })
        .addTo(map)
        .bindPopup(
          `<b>Rider</b><br>${data.riderName || 'Assigned Rider'}<br>${data.vehicleType || 'Vehicle'}`
        );
      markersRef.current.push(riderMarker);

      // Fit map to show rider + destination
      const bounds = L.latLngBounds([
        [data.riderLocation.lat, data.riderLocation.lng],
        [data.destination.lat, data.destination.lng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      // Fit all points
      const allPoints = points.map((p) => L.latLng(p));
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 15 });
    }
  }, [data]);

  useEffect(() => {
    if (ready) updateMap();
  }, [ready, updateMap]);

  return (
    <div className={`relative rounded overflow-hidden border border-slate-200 ${className}`}>
      {/* Map container */}
      <div ref={mapRef} style={{ height: `${height}px`, width: '100%' }} />

      {/* Telemetry overlay — top left */}
      <div className="absolute top-3 left-3 z-[1000] bg-white rounded shadow-md border border-slate-200 p-3 min-w-[180px]">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            Live Tracking
          </span>
        </div>

        {data.etaLabel && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 mb-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="font-semibold">{data.etaLabel}</span>
          </div>
        )}

        {data.distanceKm !== undefined && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Navigation className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{data.distanceKm.toFixed(1)} km remaining</span>
          </div>
        )}
      </div>

      {/* Rider card — bottom left */}
      {data.riderName && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white rounded shadow-md border border-slate-200 p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              {data.vehicleType === 'Bike' ? (
                <Bike className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate">{data.riderName}</div>
              <div className="text-[10px] text-slate-500">{data.vehicleType || 'Vehicle'}</div>
            </div>
            {data.riderPhone && (
              <a
                href={`tel:${data.riderPhone}`}
                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
