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
