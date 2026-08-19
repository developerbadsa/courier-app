# Shohnaat Logistics — Web Application UI/UX Design Plan (Updated)
**Priority:** Web-first (Merchant Dashboard + Admin + Rider Panel + Public Tracking)
**Target Market:** International / Global SaaS Logistics Platform
**Goal:** Professional, scalable, clean enterprise-grade web experience — single Next.js app, role-based routing

---

## 1. Design Philosophy (Web)

- **Desktop-first, responsive second** for Merchant/Admin — **mobile-first** for Rider panel (used in the field).
- **Information density with calm hierarchy** — show a lot of data without feeling chaotic.
- **Consistent left navigation** — users should never feel lost.
- **Fast scanning** — status, money, and next actions must be visible within 2–3 seconds.
- **Professional & trustworthy** — no playful illustrations in core operational screens.
- **Ready for multi-language & multi-currency** from the layout stage (not built now, just don't block it).

### Visual Direction
- Color: Deep navy / professional blue primary + slate neutrals
- Typography: Inter or similar geometric sans
- Spacing: 8pt grid
- Cards & tables: clean borders, subtle hover, almost flat
- Status: always icon + colored text + background chip (never color alone)

---

## 2. Roles & Entry Points

| Role | Main Entry | Primary Goal |
|---|---|---|
| Merchant | `/dashboard` | Create & track shipments, see money |
| Admin / Operator | `/admin` (same app, higher role) | Manage merchants, riders, shipments, settlements |
| Rider | `/rider` (same app, role-based) | Web-first for now — responsive/PWA. Native app is a later consideration, not part of current scope. |
| Public / Recipient | `/track` | Track a parcel |

One Next.js codebase, role determines which routes/sidebar a logged-in user sees. No separate apps.

### Global Layout — Merchant & Admin

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar: Logo | Global Search | Notifications | User Menu  │
├────────────┬────────────────────────────────────────────────┤
│  Sidebar   │           Main Content Area                    │
│  (fixed)   │                                                │
│  - Dashboard                                                │
│  - Shipments                                                │
│  - Pickups                                                  │
│  - Addresses                                                │
│  - Pricing                                                  │
│  - Finance                                                  │
│  - Complaints & Requests                                    │
│  - Developers                                                │
│  - Settings                                                 │
└────────────┴────────────────────────────────────────────────┘
```

### Global Layout — Rider (mobile-first, no sidebar)

```
┌───────────────────────────┐
│  Top: Logo | Duty Toggle  │
├───────────────────────────┤
│                           │
│   Task list / detail     │
│   (single column)         │
│                           │
├───────────────────────────┤
│  Bottom tabs: Tasks | History | Profile │
└───────────────────────────┘
```

---

## 3. Complete Page Inventory

### A. Authentication (3 pages) — shared by all roles
1. Login
2. Forgot Password / Reset
3. Accept Invitation (admin invites merchant/operator/rider user)

---

### B. Merchant Pages (12)

| # | Page | Route | Purpose | Key Components | Primary Actions |
|---|---|---|---|---|---|
| 1 | Dashboard | `/dashboard` | Daily overview | KPI cards, recent shipments, pending actions | Create Shipment, Request Pickup |
| 2 | Shipments List | `/shipments` | Main work queue | Filters, table, bulk select | Create, Export, Filter |
| 3 | Create Shipment | `/shipments/new` | Core action | Sections: Shipper→Consignee→Parcel→Payment→Rate | Calculate Rate, Save Draft, Create |
| 4 | Shipment Detail | `/shipments/:id` | Single source of truth | Summary + Timeline + Documents | Add Note, Print, Create Complaint |
| 5 | Pickup Requests List | `/pickups` | First-mile mgmt | Status filters | New Request |
| 6 | Create Pickup | `/pickups/new` | Request pickup | Address, date, parcel count | Submit |
| 7 | Address Book | `/addresses` | Reusable locations | Pickup/Delivery tabs, search | Add, Set Default, Edit |
| 8 | Rate Calculator | `/rates/calculate` | Transparent pricing | From–To–Weight form | Calculate |
| 9 | Finance Overview | `/finance` | Money clarity | Outstanding, balance, recent settlements | View Statement |
| 10 | Settlements/Statements | `/finance/settlements` | Historical money | Period filter, export | Download CSV/PDF |
| 11 | **Complaints & Requests** | `/support` | Issue + general requests | **Two tabs: Complaints (shipment-linked) / Requests (address change, info update, etc.)** | New Complaint, New Request |
| 12 | Developers | `/developers` | API integration | API key, webhooks, event log | Generate Key, Add Webhook |

### C. Merchant Settings (sub-pages under `/settings`)
13. Business Profile — name, KYC document upload, status badge (pending/verified/rejected)
14. Users & Team — invite sub-users under this merchant account (if needed)
15. Notification Preferences
16. Notifications Center — `/notifications`

---

### D. Admin / Operations Pages (higher role, same app) (11)

| # | Page | Route | Purpose |
|---|---|---|---|
| 17 | Admin Dashboard | `/admin` | Platform-wide KPIs |
| 18 | Merchants List | `/admin/merchants` | All merchants |
| 19 | **Create Merchant** | `/admin/merchants/new` | Explicit form — business info + initial user account |
| 20 | Merchant Detail | `/admin/merchants/:id` | Profile, shipments, ledger, **KYC approve/reject action** |
| 21 | Riders List | `/admin/riders` | All riders |
| 22 | **Create Rider** | `/admin/riders/new` | Explicit form — name, phone, vehicle type, branch |
| 23 | Rider Detail | `/admin/riders/:id` | Assignment history, performance |
| 24 | All Shipments (global) | `/admin/shipments` | Cross-merchant view, assign rider, update status |
| 25 | Pickup Queue (admin) | `/admin/pickups` | Approve/reject, assign rider |
| 26 | Manual Settlement | `/admin/settlements/new` | Create settlement for a merchant |
| 27 | **Branches & Zones** | `/admin/branches` | List + create/edit Branch, list + create/edit Zone |

### E. Admin Settings (sub-pages under `/admin/settings`)
28. Rate Cards & Rules — `/admin/rates` (create rate card, add region/service rules)
29. **Users & Roles** — invite admin/operator users, assign role (dropdown of seeded roles: super_admin, operator)
30. System Settings — general config

---

### F. Rider Panel (5) — mobile-first, separate simple layout

| # | Page | Route | Purpose | Key Actions |
|---|---|---|---|---|
| 31 | Today's Tasks | `/rider` | Assigned pickup + delivery list, sorted | Tap to open task |
| 32 | Task Detail | `/rider/tasks/:id` | Confirm pickup/delivery | Confirm Pickup, Mark Delivered, Mark Failed (reason), Enter COD Collected |
| 33 | History | `/rider/history` | Completed tasks (today/past) | — |
| 34 | Profile & Duty | `/rider/profile` | On-duty/off-duty toggle, logout | Toggle Duty |

---

### G. Public Pages (2)
35. Public Tracking — `/track` or `/track/:trackingNumber`
36. Landing/Marketing (optional, can be separate site) — `/`

---

## Total Page Count

| Section | Pages |
|---|---|
| Auth (shared) | 3 |
| Merchant core | 12 |
| Merchant settings | 4 |
| Admin core | 11 |
| Admin settings | 3 |
| Rider panel | 4 |
| Public | 2 |
| **Total** | **~39** |

This is higher than the earlier "22–25" estimate because it now includes the gaps identified: Customer Requests (merged into Support), explicit Create Merchant/Create Rider forms, KYC approval action, Branch/Zone CRUD, Role assignment UI, and the full Rider panel. Still realistic for Phase 1+2 — many of these are simple CRUD forms, not complex builds.

---

## 4. Key Screen Details (unchanged from before, still apply)

### 4.1 Dashboard
Top row: 4–5 KPI cards (Created today, In transit, Delivered, Failed, COD Outstanding). Second row: "Needs Action" list + "Recent Shipments".

### 4.2 Shipments List
Search + Filters (Status, Date range, COD yes/no, Branch). Table: Tracking #, Consignee, Status chip, COD, Created, Actions.

### 4.3 Create Shipment
Sticky footer: Save Draft | Create Shipment. Sections: Shipper → Consignee → Parcel → Payment → Rate → Notes.

### 4.4 Shipment Detail
Left (30%): summary card. Right (70%): Timeline | Documents | Activity.

### 4.5 Finance Pages
Large clear numbers, easy date range, one-click export, zero ambiguity on "payable to me."

### 4.6 Complaints & Requests (new detail)
Two tabs on one page:
- **Complaints** — shipment-linked, subject + description + status (Open/In Progress/Resolved/Closed)
- **Requests** — general (address change, info update), type + details + status (Pending/In Progress/Done/Rejected)

### 4.7 Merchant Detail (Admin view, new detail)
Summary card + tabs: Shipments | Ledger/Dues | KYC Documents (with Approve/Reject buttons + status badge) | Rate Card assignment.

### 4.8 Branches & Zones (new detail)
Two simple list+form sections on one page: Branches (name, code, city, isHub toggle) and Zones (name, active toggle) — both used as dropdowns elsewhere (Address form, Rate Rule form).

### 4.9 Rider — Task Detail (new detail)
Large touch targets. Shows: consignee name/phone (tap to call), address (tap to open maps), parcel info, COD amount. Buttons: Confirm Pickup / Mark Delivered / Mark Failed (reason code dropdown) / Enter COD Collected — one primary action visible at a time based on current status.

---

## 5. Button & Component System

| Type | When | Style |
|---|---|---|
| Primary | Main positive action | Filled, brand color |
| Secondary | Cancel/alternative | Outline |
| Ghost/Tertiary | Low emphasis | Text only |
| Destructive | Cancel/delete | Red outline or filled |
| Icon Button | Table row actions, filters | 36–40px |

**Status Chips:** same color+icon+label mapping everywhere.
**Empty States:** every list page needs a helpful empty state with a CTA.
**Loading:** skeleton loaders over spinners for tables/cards.

---

## 6. Responsive Behavior

- **≥1280px:** full sidebar + comfortable table (Merchant/Admin)
- **1024–1279px:** collapsible sidebar
- **<1024px:** sidebar becomes drawer, tables become card lists
- **Rider panel:** mobile-first from the start, single column, bottom tab bar, large touch targets (44–48px minimum)
- Public tracking page must be perfect on mobile

---

## 7. Phased Delivery — mapped to backend Phase 1/2

### Phase 1 (7–10 days) — Core Operations
- Auth (3 pages)
- Merchant: Dashboard, Shipments (List+Create+Detail), Pickups (List+Create), Address Book
- Admin: Dashboard, Merchants (List+Create+Detail, basic — KYC UI can follow), Riders (List+Create+Detail), All Shipments, Pickup Queue
- Rider: Today's Tasks, Task Detail, History, Profile
- Public: Tracking page

### Phase 2 (1–2 weeks) — Business Operations
- Finance Overview + Settlements (merchant + admin manual settlement)
- Rate Calculator + Rate Cards & Rules
- Complaints & Requests (both tabs)
- Developers (API Keys + Webhooks)
- Branches & Zones
- Users & Roles (admin invite flow)
- Notifications Center
- KYC approve/reject action on Merchant Detail

### Phase 3 — Platform Power (later, separate scope)
- Advanced filters, bulk actions, export polish
- Notification center refinements
- Multi-language layout activation

---

## 8. Final Notes

- Single Next.js app, role-based route protection (middleware checks `user.role`).
- Rider panel shares the same component library/design tokens as Merchant/Admin, but its own simplified layout (no sidebar, bottom tabs).
- Every page above maps to an existing backend module from the schema/API plan — no page here requires a table or endpoint that isn't already planned.

---

*Document version: 2.0 (Frontend build reference — gaps closed)*
*Base for: Next.js route structure, component planning*
