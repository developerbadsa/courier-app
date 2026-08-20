# 🗺️ Shohnaat Logistics: Complete Future Sprints & AI Agent Prompts Roadmap

> **Sequential Engineering Roadmap for Next Phases:**  
> - **Sprint 12:** Full-Stack API & Database Wiring (Shipments, Address Book, Finance CRUD)  
> - **Sprint 13:** 4x6" Thermal Barcode & QR Shipping Label Printing Engine (PDF & Zebra)  
> - **Sprint 14:** Real-Time Live Map & Rider GPS Tracking Engine (WebSockets / SSE)  
> - **Sprint 15:** Superadmin Automated Payment Gateway Payout Execution (Stripe & PayPal)

---

## 🏷️ SPRINT 13: 4x6" Thermal Barcode & QR Label Printing Engine

### 📋 Copy-Paste Prompt for AI Agent:
```markdown
### 🎯 MISSION: Sprint 13 — 4x6" Thermal Barcode & QR Shipping Label Printing

You are an expert Full-Stack Engineer working on the **Shohnaat Logistics** platform.

Your goal is to implement an enterprise 4x6" (100x150mm) thermal shipping label generator and 1-click print engine for parcel packages with **100% ZERO UI/CSS disruption**.

---

### 🛡️ STRICT RULES:
1. Preserve all existing UI layout tokens, padding (`my-8`, `gap-6`, `p-6`), and Lucide React icons.
2. The generated label must adhere strictly to international courier thermal standards (4x6 inches / 203 DPI format).
3. Must pass `node_modules/.bin/tsc --noEmit` with 0 errors.

---

### 🔨 DELIVERABLES:
1. **Label Generation Engine (`frontend/src/lib/shippingLabelPdf.ts`):**
   - Generate standard 4x6" sticker format PDF containing:
     * High-contrast vector **Code-128 Barcode** for tracking number (e.g. `SHN-8429-2026`).
     * Scannable **QR Code** linking directly to `https://shohnaat.rahimbadsa.me/track/<trackingNumber>`.
     * Sender / Warehouse details (Origin Hub, Contact, Address).
     * Recipient details (Destination City, Full Address, Phone).
     * COD Badge (e.g., `COD: $45.00 USD` or `PREPAID`).
     * Routing sort code (e.g., `HUB-HQ-AUSTIN`).
2. **1-Click Print Integration:**
   - Add "Print Shipping Label" button in `/dashboard/shipments/new` (Success Step).
   - Add "Print Label" action in `/dashboard/shipments` table row dropdown.
   - Support batch label generation in `/dashboard/shipments/bulk` (multiple labels in a single PDF stream).
```

---

## 🗺️ SPRINT 14: Real-Time Live Map & Rider GPS Tracking Engine

### 📋 Copy-Paste Prompt for AI Agent:
```markdown
### 🎯 MISSION: Sprint 14 — Live Map & Rider GPS Real-Time Tracking

You are an expert Full-Stack Engineer working on the **Shohnaat Logistics** platform.

Your goal is to build a real-time live map tracking engine for parcels and field riders using WebSockets / SSE and interactive map rendering with **100% ZERO UI/CSS disruption**.

---

### 🛡️ STRICT RULES:
1. Maintain existing UI styling and dark theme tokens.
2. WebSockets / SSE connection must have automatic reconnection and fallback polling.
3. Must pass `node_modules/.bin/tsc --noEmit` with 0 errors.

---

### 🔨 DELIVERABLES:
1. **Live GPS Stream (`shohnaat-backend/src/routes/liveTracking.js` & Redis Pub/Sub):**
   - Rider app pushes real-time coordinates `(latitude, longitude, heading, speed)`.
   - Backend broadcasts live coordinates to authorized tracking rooms.
2. **Interactive Live Map Component (`frontend/src/components/tracking/LiveTrackingMap.tsx`):**
   - Render origin warehouse pin, destination delivery pin, and animated moving rider icon (`Bike` / `Truck`).
   - Display dynamic route polyline and live ETA countdown (e.g. `Arriving in 14 mins`).
3. **Public & Merchant Tracking Page Integration:**
   - Embed live map in `frontend/src/app/(public)/track/[trackingNumber]/page.tsx` when status is `OUT_FOR_DELIVERY`.
   - Add Live Fleet view in `/admin/fleet` to observe all on-duty riders on a single master map.
```

---

## 💳 SPRINT 15: Automated Superadmin Payout Execution (Stripe & PayPal)

### 📋 Copy-Paste Prompt for AI Agent:
```markdown
### 🎯 MISSION: Sprint 15 — Superadmin Automated Stripe & PayPal Payout Execution

You are an expert Senior Full-Stack Engineer working on the **Shohnaat Logistics** platform.

Your goal is to wire the automated payout clearinghouse in the Superadmin console to execute real/sandbox fund transfers via Stripe Connect Transfers API & PayPal Payouts Batch API with **100% ZERO UI/CSS disruption**.

---

### 🛡️ STRICT RULES:
1. Never compromise financial security: double-entry validation before fund release.
2. Zero UI alterations to existing table views and modal layouts.
3. Must pass `node_modules/.bin/tsc --noEmit` with 0 errors.

---

### 🔨 DELIVERABLES:
1. **Automated Payout Execution (`shohnaat-backend/src/routes/finance.js`):**
   - When Superadmin clicks "Process Payout" in `/admin/finance`:
     * If `method === 'bank_transfer'`: Trigger Stripe Connect Transfers API `stripe.transfers.create(...)`.
     * If `method === 'paypal'`: Trigger PayPal Payouts API `paypal.payout.create(...)`.
   - On success:
     * Transition payout status from `PENDING` -> `PAID`.
     * Create double-entry ledger debit in `FinanceLedger`.
     * Deduct merchant wallet `pendingSettlement` balance.
     * Trigger email notification to merchant.
2. **Merchant Invoices & PDF Settlement Receipts:**
   - Auto-generate formal invoice record with transaction reference and downloadable PDF receipt.
```

---

## ⚡ SPRINT 16: Next-Gen AI Smart Field Rider PWA Suite (AI Route Optimizer + Offline Sync + Camera Barcode Scanner)

### 📋 Copy-Paste Prompt for AI Agent:
```markdown
### 🎯 MISSION: Sprint 16 — Next-Gen AI Smart Field Rider PWA Suite

You are an expert Senior Full-Stack Engineer working on the **Shohnaat Logistics** platform (Next.js 14 App Router + Node.js Express + Prisma ORM + PostgreSQL + IndexedDB + HTML5 Camera Barcode API).

Your goal is to build an all-in-one **Next-Gen AI Smart Field Rider PWA Suite** combining:
1. **AI Route Optimizer:** 2-Opt Traveling Salesman (TSP) algorithm to sequence 20–50 daily deliveries into the most fuel- and time-efficient order.
2. **Offline-First IndexedDB Sync:** Zero data loss queue that records deliveries, signatures, OTPs, and cash collection offline and auto-syncs when online.
3. **HTML5 In-Browser Camera Barcode & QR Scanner:** Instant audio-beep camera scanner with torch toggle for high-speed parcel processing.

All implemented with **100% ZERO UI/CSS disruption**.

---

### 🛡️ STRICT RULES:
1. Preserve all existing UI layout tokens, padding (`my-8`, `gap-6`, `p-6`), and Lucide React icons.
2. Optimization calculations must run in sub-second response times using haversine matrix + 2-opt heuristic.
3. Offline queue must guarantee zero data loss with automatic background reconciliation.
4. Must pass `node_modules/.bin/tsc --noEmit` with 0 errors.

---

### 🔨 DELIVERABLES:

#### 1. 🧠 AI Route Optimization Engine:
- **Backend Service (`shohnaat-backend/src/services/routeOptimizer.js`):**
  * Input: Array of delivery stops `{ shipmentId, lat, lng, priority, timeWindow }` + start hub coordinates.
  * Algorithm: Fast Nearest Neighbor initialization + 2-Opt local search refinement.
  * Output: Optimized ordered stop array, total route distance in km, total estimated drive time.
  * Endpoint: `POST /api/v1/riders/optimize-route`
- **Rider App 1-Click "AI Optimize Route" Button (`frontend/src/app/(rider)/rider/page.tsx`):**
  * Add button to Rider Runsheet: `<Button onClick={handleOptimizeRoute} leftIcon={<Sparkles className="w-4 h-4" />}>AI Optimize Route</Button>`
  * Re-orders deliveries with clear sequential badges (`Stop #1`, `Stop #2`, `Stop #3`).
  * Displays estimated time saved (e.g. `✨ Route optimized: Saves 38 mins & 14.2 km`).
  * Add "Open Full Route in Google Maps / Waze" multi-waypoint deep link.

#### 2. 📡 Offline-First IndexedDB Sync Queue (`frontend/src/lib/offlineQueue.ts`):
- Store offline delivery status changes (`DELIVERED`, `FAILED`, `OTP_VERIFIED`, `CASH_COLLECTED`) and customer POD signatures in IndexedDB.
- Listen for `window.addEventListener('online')` and automatically flush offline queue to `POST /api/v1/shipments/sync-offline` with retry logic.
- Render persistent offline status banner when disconnected: `📡 Offline Mode — 4 actions queued for auto-sync`.

#### 3. 📷 In-Browser Camera Barcode & QR Scanner (`frontend/src/components/scanner/CameraBarcodeScanner.tsx`):
- HTML5 camera video stream using native `BarcodeDetector` / `@zxing/library`.
- Instant audio beep on detection, continuous batch scan mode, and torch/flashlight toggle.
- Integrated into Rider Delivery flow (`/rider`) and Hub Inbound operations (`/admin/scan`).

---

### 🧪 VERIFICATION CHECKLIST:
1. Run `frontend/node_modules/.bin/tsc --noEmit --project frontend/tsconfig.json` -> 0 errors.
2. Test offline mode in browser DevTools Network tab (simulate Offline) -> perform delivery -> re-enable Network -> verify instant auto-sync to PostgreSQL.
3. Test AI route optimization with multiple coordinates -> verify sequence ordering and Google Maps link generation.
4. Git commit and push cleanly to `main`.
```

---

## 🚛 SPRINT 17: Multi-Hub Cross-Docking & Inter-City Manifest Transfer System

### 📋 Copy-Paste Prompt for AI Agent:
```markdown
### 🎯 MISSION: Sprint 17 — Multi-Hub Cross-Docking & Linehaul Manifest Transfers

You are an expert Senior Full-Stack Engineer working on the **Shohnaat Logistics** platform.

Your goal is to build an enterprise **Cross-Docking, Bagging, and Inter-Hub Linehaul Manifest Transfer System** for inter-city parcel routing with **100% ZERO UI/CSS disruption**.

---

### 🛡️ STRICT RULES:
1. Multi-tenant hub isolation: Operators only manage shipments inside their assigned branch.
2. Must pass `node_modules/.bin/tsc --noEmit` with 0 errors.

---

### 🔨 DELIVERABLES:
1. **Linehaul Manifest Bagging Engine (`shohnaat-backend/src/routes/manifests.js`):**
   - Operators scan multiple outbound parcels into a master sealed Container/Bag (e.g. `BAG-MIA-0912`).
   - Generates inter-hub Linehaul Manifest document with Driver/Truck assignment.
   - Bulk status transition: all parcels inside bag transition to `IN_TRANSIT_TO_HUB`.
2. **Inbound Receiving & De-bagging Scanner (`frontend/src/app/(admin)/admin/scan/page.tsx`):**
   - Destination hub scans container barcode once -> automatically receives and verifies all 50+ enclosed parcels.
   - Flags missing, misplaced, or damaged parcels with instant discrepancy reporting.
```


