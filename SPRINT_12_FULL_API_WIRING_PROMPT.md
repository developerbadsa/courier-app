# 🎯 SPRINT 12: End-to-End Live API & Database Wiring Prompt

> **Task Directive for AI Agent:**  
> Wire up all remaining core Merchant operations (`/dashboard/shipments/new`, `/dashboard/addresses`, `/dashboard/finance`) directly to the PostgreSQL database via Express REST APIs and Redux Toolkit state, ensuring **100% ZERO UI/CSS disruption**.

---

## 📋 Copy-Paste Prompt for AI Coding Agent

```markdown
### 🎯 MISSION: Sprint 12 — Real Backend API & PostgreSQL Database Integration

You are a Senior Full-Stack Engineer working on the **Shohnaat Logistics** platform (Next.js 14 App Router + Node.js Express + Prisma ORM + PostgreSQL + Redux Toolkit).

Your goal is to connect all frontend forms, tables, and action handlers in the remaining merchant features to the live backend REST APIs (`/api/v1/*`) and PostgreSQL database.

---

### 🛡️ STRICT NON-NEGOTIABLE RULES:
1. **🔒 ZERO UI / CSS ALTERATION:**
   - DO NOT alter existing layout margins (`my-8`, `gap-6`, `p-6`), colors, fonts, borders, or glassmorphic cards.
   - DO NOT replace or remove [Lucide React](https://lucide.dev/guide/react/) SVG vector icons.
   - DO NOT introduce cheap raw unicode emojis.
   - Keep the locked design system intact (`bg-slate-50`, `text-slate-900`, `border-slate-200`, `text-blue-600`).
2. **🧠 REDUX & API LAYER:**
   - Use typed Redux hooks (`useAppDispatch`, `useAppSelector` from `@/store/hooks`).
   - Use the centralized Axios API client (`api` from `@/lib/api`) which automatically injects JWT Bearer tokens and handles error toasts.
3. **⚡ ERROR RESILIENCE & TYPE SAFETY:**
   - All async actions must have graceful fallback so the page never crashes or displays a blank screen.
   - Must pass `node_modules/.bin/tsc --noEmit` with **0 errors**.

---

### 🔨 DETAILED IMPLEMENTATION TASKS:

#### Task 1: Real Single Shipment Creation (`/dashboard/shipments/new`)
- **Backend API:** `POST /api/v1/shipments`
- **Frontend File:** `frontend/src/app/(merchant)/dashboard/shipments/new/page.tsx`
- **Actions Required:**
  1. On step 4 submission, collect recipient details, delivery address, parcel weight, COD amount, and pickup warehouse.
  2. Send `api.post('/api/v1/shipments', payload)`.
  3. On success (`201 Created`), receive generated tracking number (e.g. `SHN-7894-2026`).
  4. Dispatch `addShipment` to Redux `shipmentsSlice`.
  5. Show success toast and redirect to `/dashboard/shipments` where the newly created shipment appears instantly in the table.

#### Task 2: Real Address Book CRUD (`/dashboard/addresses`)
- **Backend APIs:**
  - `GET /api/v1/addresses` (List merchant addresses)
  - `POST /api/v1/addresses` (Create/Update address)
  - `DELETE /api/v1/addresses/:id` (Soft delete address)
- **Frontend File:** `frontend/src/app/(merchant)/dashboard/addresses/page.tsx`
- **Actions Required:**
  1. Fetch live address records from `GET /api/v1/addresses` on page load.
  2. Wire modal save button to `POST /api/v1/addresses` for both `PICKUP` and `DELIVERY` locations.
  3. Wire delete action with confirmation modal calling `DELETE /api/v1/addresses/:id`.
  4. Display active badges (`Default`, `Pickup Location`, `Delivery Address`).

#### Task 3: Real Finance, COD Wallet & Payout Engine (`/dashboard/finance`)
- **Backend APIs:**
  - `GET /api/v1/finance/summary` (Available balance, pending settlement, lifetime earnings)
  - `GET /api/v1/finance/ledger` (Transaction ledger records)
  - `POST /api/v1/finance/payout-request` (Submit bank wire or PayPal withdrawal)
- **Frontend File:** `frontend/src/app/(merchant)/dashboard/finance/page.tsx`
- **Actions Required:**
  1. Fetch live balance KPI cards and ledger transactions on page load.
  2. Wire "Request Payout" modal to submit `POST /api/v1/finance/payout-request` with amount, method (`bank_transfer` | `paypal`), and bank/account details.
  3. Dispatch `addPayoutRequest` to Redux `financeSlice` and update available balance immediately.

---

### 🧪 VERIFICATION CHECKLIST:
1. Run `frontend/node_modules/.bin/tsc --noEmit --project frontend/tsconfig.json` -> 0 errors.
2. Run backend syntax check `node -c` -> 0 errors.
3. Verify Network tab in DevTools shows live `200 OK` and `201 Created` responses.
4. Git commit and push cleanly to `main`.
```
