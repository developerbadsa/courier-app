# 🚀 Enterprise AI Agent Master Prompt: Full-Stack API Integration (Zero UI Disruption)

> **Instructions for the AI Assistant:**  
> You are tasked with connecting every frontend page, table, form, and modal in the **Shohnaat Logistics** courier web application to the live backend REST APIs & PostgreSQL database.  
> **CRITICAL MANDATE:** You must achieve 100% full-stack API integration **WITHOUT ALTERING, BREAKING, OR TOUCHING THE LOCKED UI/UX DESIGN SYSTEM**.

---

## 📋 Copy-Paste Prompt for AI Coding Agent

```markdown
### 🎯 MISSION: Full-Stack Backend API Integration with 100% UI/UX Preservation

You are an expert Senior Full-Stack Engineer pair-programming on the **Shohnaat Logistics** platform (MERN / Next.js 14 App Router + Node.js Express + Prisma ORM + PostgreSQL + Redux Toolkit).

Your goal is to connect all frontend UI components, tables, filters, forms, and actions to the live backend REST API endpoints (`/api/v1/*`) and PostgreSQL database.

---

### 🛡️ STRICT RULES & NON-NEGOTIABLE CONSTRAINTS:

1. 🔒 **ZERO UI / CSS DISRUPTION:**
   - DO NOT alter existing layout spacing, section margins (`my-8`, `gap-6`, `p-6`), typography, colors, borders, or glassmorphism effects.
   - DO NOT replace, remove, or modify existing [Lucide React](https://lucide.dev/guide/react/) SVG vector icons.
   - DO NOT introduce cheap raw unicode emojis (e.g. 🏍️, 🚐, 📦, 📍).
   - Maintain the locked Design System tokens (`bg-slate-50`, `text-slate-900`, `border-slate-200`, `text-blue-600`).

2. 🧠 **STATE MANAGEMENT & DATA-FETCHING ARCHITECTURE:**
   - **Client State / Session / UI:** Use Redux Toolkit (`@/store/hooks`, typed slices in `frontend/src/store/slices/`).
   - **Server State / API Calls:** Use the centralized Axios API client (`@/lib/api`) or `@tanstack/react-query`.
   - **JWT Auth & Session:** Ensure `Authorization: Bearer <token>` is automatically injected into all authenticated requests via `tokenSyncMiddleware` and Axios interceptors.
   - **Toast Notifications:** Use `showToast('success' | 'error' | 'info' | 'warning', message)` from `@/lib/api`.

3. ⚡ **GRACEFUL FALLBACK & OPTIMISTIC UX:**
   - If the backend is loading, display the native component loading spinners (`Loader2` or skeleton placeholders) without jumping or shifting layout elements.
   - If a network error occurs, capture the error message, notify the user with `showToast('error', ...)`, and maintain fallback mock state so the UI never crashes into a blank white screen.

---

### 🗺️ COMPLETE PAGE-BY-PAGE API WIRING CHECKLIST:

#### 1. 🔐 Authentication & Session
- **`POST /api/v1/auth/login`**:
  - Connect `frontend/src/app/(auth)/login/page.tsx`.
  - Dispatch `setCredentials({ user, token, role })` to Redux `authSlice`.
  - Auto-redirect based on role: `super_admin` -> `/admin`, `merchant` -> `/dashboard`, `rider` -> `/rider`.
- **`POST /api/v1/auth/register`**:
  - Connect `frontend/src/app/(auth)/register/page.tsx` with business info & default pickup address.

#### 2. 📦 Shipments Management
- **`GET /api/v1/shipments`**:
  - Connect `frontend/src/app/(merchant)/dashboard/shipments/page.tsx`.
  - Wire search query, status dropdown selector, date range picker, and pagination.
  - Dispatch `setShipments` in Redux `shipmentsSlice`.
- **`POST /api/v1/shipments`**:
  - Connect `frontend/src/app/(merchant)/dashboard/shipments/new/page.tsx` (single parcel creation).
- **`POST /api/v1/shipments/bulk`**:
  - Connect `frontend/src/app/(merchant)/dashboard/shipments/bulk/page.tsx` (CSV/Excel batch import).
- **`GET /api/v1/tracking/:trackingNumber`**:
  - Connect `frontend/src/app/(public)/track/[trackingNumber]/page.tsx` with live timeline.

#### 3. 🚚 Pickup Requests
- **`GET /api/v1/pickups`**:
  - Connect `frontend/src/app/(merchant)/dashboard/pickups/page.tsx`.
  - Wire status tabs (`All`, `Pending`, `Approved`, `Assigned`, `Completed`).
  - Wire detailed modal view (`Eye` button).
- **`POST /api/v1/pickups`**:
  - Connect `frontend/src/app/(merchant)/dashboard/pickups/new/page.tsx`.
  - Send `pickupAddressId`, `requestedDate`, `timeSlot`, `parcelCount`, `vehicleType`, `driverNotes`.
  - On `201 Created`, show success toast and update Redux / persistent list.

#### 4. 🏢 Address Book
- **`GET /api/v1/addresses` & `POST /api/v1/addresses` & `DELETE /api/v1/addresses/:id`**:
  - Connect `frontend/src/app/(merchant)/dashboard/addresses/page.tsx`.
  - Wire CRUD modal for Pickup & Delivery warehouse addresses.

#### 5. 💰 Finance & Invoices
- **`GET /api/v1/finance/summary` & `GET /api/v1/finance/ledger`**:
  - Connect `frontend/src/app/(merchant)/dashboard/finance/page.tsx`.
  - Wire available COD balance, settlement transactions, and payout request submission (`POST /api/v1/finance/payout-request`).
- **`GET /api/v1/finance/invoices`**:
  - Connect `frontend/src/app/(merchant)/dashboard/invoices/page.tsx`.
  - Wire `ExpandableCard` invoice list and client-side PDF generator (`downloadInvoicePDF`).

#### 6. 🛡️ Admin & Fleet Operations
- **`GET /api/v1/riders` & `POST /api/v1/riders`**:
  - Connect `frontend/src/app/(admin)/admin/fleet/page.tsx`.
- **`GET /api/v1/hubs` & `GET /api/v1/zones` & `GET /api/v1/rates`**:
  - Connect `admin/hubs`, `admin/zones`, and `admin/rates`.
- **`POST /api/v1/shipments/scan`**:
  - Connect barcode batch scanner in `frontend/src/app/(admin)/admin/scan/page.tsx`.

---

### 🧪 VERIFICATION & QUALITY GATES:

Before declaring the task complete, you MUST verify:
1. **TypeScript Typecheck:** Run `frontend/node_modules/.bin/tsc --noEmit --project frontend/tsconfig.json` -> Must exit with **0 errors**.
2. **Backend Syntax:** Run `node -c` on all modified backend JavaScript files -> Must exit with **0 errors**.
3. **Network Tab Validation:** Verify that actual HTTP requests (`200 OK` / `201 Created`) are firing in the browser DevTools Network tab.
4. **Git Sync & Live Deployment:** Commit cleanly with conventional commits, push to `main`, pull on the VPS, and restart containers.
```
