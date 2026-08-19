# 🚀 Shohnaat Logistics — Enterprise Project Tracker

> **Last Updated:** August 20, 2026
> **Platform:** International Global Courier & Logistics Multi-Tenant SaaS
> **Currency Standard:** **USD ($) ONLY**
> **Payment Gateways:** **Stripe & PayPal** (Sandbox/Test Mode Ready)
> **Deployment:** Multi-Container Docker Environment on Dedicated VPS
> **Live Domain:** [https://shohnaat.rahimbadsa.me](https://shohnaat.rahimbadsa.me)
> **API Health:** [https://api-shohnaat.rahimbadsa.me/health](https://api-shohnaat.rahimbadsa.me/health)

---

## 📊 1. Overall Progress Summary

| Category | Total Tasks | Done ✅ | Progress |
|---|---|---|---|
| **DevOps & VPS Infrastructure** | 6 | 6 | **100%** ✅ |
| **Dedicated Storage Microservice** | 5 | 5 | **100%** ✅ |
| **UI/UX Reusable Design System** | 8 | 8 | **100%** ✅ |
| **Authentication & RBAC** | 5 | 5 | **100%** ✅ |
| **Merchant Portal & Shipments** | 12 | 12 | **100%** ✅ |
| **Superadmin Operations Console** | 10 | 10 | **100%** ✅ |
| **Field Rider Mobile App (PWA)** | 8 | 8 | **100%** ✅ |
| **Public Tracking & Timeline** | 5 | 5 | **100%** ✅ |
| **Rate Matrix & Billing Engine** | 8 | 8 | **100%** ✅ |
| **Financial Ledger & COD Engine** | 10 | 10 | **100%** ✅ |
| **Stripe / PayPal USD Gateways** | 6 | 6 | **100%** ✅ |
| **Developer API & HMAC Webhooks** | 6 | 6 | **100%** ✅ |
| **Hub Barcode Operations** | 4 | 4 | **100%** ✅ |
| **Merchant Address Book & Pickups** | 4 | 4 | **100%** ✅ |
| **Fleet & Analytics** | 3 | 3 | **100%** ✅ |
| **BullMQ Notification Engine** | 5 | 5 | **100%** ✅ |
| **Security Hardening** | 5 | 5 | **100%** ✅ |
| **E2E Testing & Verification** | 4 | 4 | **100%** ✅ |
| **Total Deliverables** | **109** | **109** | **100%** ✅ |

---

## 🐳 2. Live Docker Microservices Architecture

| Container Name | Service | Port (Host ➔ Container) | Status | Role |
|---|---|---|---|---|
| **`shohnaat-frontend`** | Next.js 14 Standalone | `3001:3000` | 🟢 Healthy | High-performance React web portals |
| **`shohnaat-backend`** | Express Core API | `5001:5000` | 🟢 Healthy | Business logic & state machine engine |
| **`shohnaat-storage`** | Storage Microservice | `5002:5000` | 🟢 Healthy | Isolated media/document upload server |
| **`shohnaat-db`** | PostgreSQL 16 Alpine | `5432:5432` (Internal) | 🟢 Healthy | Relational database (30+ entities) |
| **`shohnaat-redis`** | Redis 7 Alpine | `6379:6379` (Internal) | 🟢 Healthy | Session store, caching & BullMQ job queues |

---

## ✅ 3. Completed Modules & Features

### 🟢 A. DevOps & 1-Click Automation
- [x] **Zero-Conflict VPS Port Allocation:** Conflict audit on VPS (`mydev`), isolated ports 3001/5001/5002.
- [x] **Cloudflare Tunnel Routing:** Frontend at `shohnaat.rahimbadsa.me` & API at `api-shohnaat.rahimbadsa.me`.
- [x] **CI/CD Auto-Deploy:** GitHub Actions workflow with public IP SSH deploy.
- [x] **1-Click Fast Deploy Pipeline:** `deploy.ps1` / `deploy.sh` — git push, VPS pull, Docker build, Prisma migrate.
- [x] **SSH Tunnel for Local Dev:** `npm run tunnel` for DB/Redis access from local machine.

### 🟢 B. Dedicated Media & Storage Microservice
- [x] **Isolated Docker Container (`:5002`):** Zero upload overhead on transactional backend.
- [x] **Persistent Volume (`uploads_data`):** Preserves uploads across rebuilds.
- [x] **Category Routing:** Auto-segregation into `/kyc/`, `/pod/`, `/parcels/`, `/avatars/`, `/general/`.
- [x] **Security & Validation:** 15MB file limit, MIME-type whitelist, Sharp image resizing, UUID hashing.
- [x] **Static Serving:** Cache headers & live stats endpoint.

### 🟢 C. Figma-Grade Reusable UI/UX System
- [x] **`Sidebar.tsx`:** Multi-role navigation (Merchant, Admin, Rider, Operator) with profile chip & logout.
- [x] **`Header.tsx`:** Global quick search, currency pill, notification counter, action slot.
- [x] **`DashboardLayout.tsx`:** Master responsive layout integrating Sidebar + Header.
- [x] **UI Kit:** `Button`, `Input`, `Card`, `StatCard`, `StatusBadge`, `DataTable`, `Badge`, `Tabs`, `Modal`, `Avatar`, `EmptyState`.

### 🟢 D. Live Working Portals (28 Routes)
- [x] **Demo Login (`/login`):** 1-Click chips with real JWT authentication.
- [x] **Merchant Dashboard (`/dashboard`):** KPI cards, live shipments table, COD wallet.
- [x] **Superadmin Console (`/admin`):** Global fleet overview, merchant KYC queue.
- [x] **Rider PWA (`/rider`):** Mobile-first tasks, GPS navigation, COD collection with OTP.
- [x] **Public Tracking (`/track` & `/track/[trackingNumber]`):** Vertical stepper timeline, ETA countdown, print receipt.
- [x] **Address Book (`/dashboard/addresses`):** Saved warehouses card grid with default toggle.
- [x] **Pickup Requests (`/dashboard/pickups` & `/dashboard/pickups/new`):** 4-step booking wizard.
- [x] **Create Shipment (`/dashboard/shipments/new`):** 4-step wizard (Shipper → Consignee → Package → Review).
- [x] **Bulk Upload (`/dashboard/shipments/bulk`):** CSV upload with preview table.
- [x] **Finance Dashboard (`/dashboard/finance`):** Wallet balance, ledger, settlements, payout wizard.
- [x] **Wallet Top-Up (`/dashboard/finance/topup`):** Stripe/PayPal/Test payment methods.
- [x] **Developer Portal (`/dashboard/developer`):** API keys, webhooks, docs, code snippets.
- [x] **Hub Scanner (`/admin/scan`):** Camera/USB barcode, audio feedback, batch manifest.
- [x] **Outbound Bagging (`/admin/scan/outbound`):** Destination selector, batch scanning.
- [x] **Hub Management (`/admin/hubs`):** CRUD with zone coverage, manager, capacity stats.
- [x] **Zone Management (`/admin/zones`):** 8 delivery zones with rate rule counts.
- [x] **Rate Cards (`/admin/rates`):** Expandable rules view, merchant-specific overrides.
- [x] **Fleet Management (`/admin/fleet`):** Rider table, vehicle filters, duty toggle.
- [x] **Analytics (`/admin/analytics`):** KPIs, daily charts, hub performance, merchant leaderboard.
- [x] **Audit Logs (`/admin/audit-logs`):** Color-coded action badges with filters.
- [x] **Settlements (`/admin/finance`):** Payout approval queue, merchant balances.
- [x] **Notification Settings (`/admin/settings/notifications`):** Email/SMS toggles, queue stats, test sender.

### 🟢 E. Backend APIs (18 Route Modules)
- [x] **Auth:** Login, register, JWT, RBAC middleware.
- [x] **Shipments:** CRUD, bulk upload, status state machine, advanced search.
- [x] **Riders:** CRUD, duty toggle, OTP generation/verification, delivery/failure handlers.
- [x] **Pickups:** CRUD, merchant-scoped, time slots, vehicle type.
- [x] **Addresses:** CRUD with default toggle, type filtering.
- [x] **Hubs:** CRUD with zone coverage, staff/shipment counts.
- [x] **Zones:** CRUD with delivery area definitions.
- [x] **Rates:** Zone-to-zone pricing, merchant overrides, fuel surcharge.
- [x] **Finance:** Double-entry ledger, wallet, settlements, CSV export.
- [x] **Payments:** Stripe PaymentIntent, PayPal Checkout, sandbox top-up.
- [x] **Operations:** Manifest CRUD, inbound/outbound scanning.
- [x] **Developer:** API key generation, webhook CRUD, HMAC signature, delivery logs.
- [x] **Tracking:** Public (no auth) tracking with timeline, ETA, POD data.
- [x] **Notifications:** Settings, logs, queue stats, test sender.
- [x] **Security:** Audit endpoint, dependency check, config verification.
- [x] **Audit Logs:** Filterable audit trail for all actions.
- [x] **Upload:** Multi-category file upload with Sharp resizing.

### 🟢 F. Security Hardening
- [x] **Helmet Security Headers:** CSP, HSTS, X-Frame-Options, XSS-Filter, noSniff.
- [x] **Rate Limiting:** 100 req/min per IP with Retry-After header.
- [x] **Input Sanitization:** XSS + SQL injection pattern guards.
- [x] **Request ID Tracing:** UUID per request for log correlation.
- [x] **CORS Hardening:** Origin-restricted in production.
- [x] **bcrypt Password Hashing:** 12 rounds with salt.

### 🟢 G. E2E Testing & Verification
- [x] **Smoke Test Suite:** 40+ endpoint verification (auth, CRUD, security headers).
- [x] **E2E Flow Test:** Full booking → scan → delivery → COD → settlement.
- [x] **Security Audit Endpoint:** 20-point automated security checklist.
- [x] **Dependency Audit:** npm vulnerability scanning integration.

---

## 🔧 4. Sprint History

| Sprint | Name | Status | Date |
|---|---|---|---|
| Sprint 1 | Auth, Login, Shipments, Rider PWA | ✅ Complete | Aug 18 |
| Sprint 2 | Shipment Wizard, Rate Engine, Bulk Upload | ✅ Complete | Aug 18-19 |
| Sprint 3 | Hub Barcode Operations, Field Rider OTP | ✅ Complete | Aug 19 |
| Sprint 4 | Financial Ledger, COD Wallet, USD Gateways | ✅ Complete | Aug 19 |
| Sprint 5 | Developer API, HMAC Webhooks | ✅ Complete | Aug 19 |
| Sprint 6 | Public Tracking Portal, ETA, Print Receipt | ✅ Complete | Aug 20 |
| Sprint 7 | Fleet Management, Hub Analytics, Global Analytics | ✅ Complete | Aug 20 |
| Sprint 8 | BullMQ Notifications, Email/SMS Templates | ✅ Complete | Aug 20 |
| Sprint 9 | E2E Tests, Security Audit, Production Sync | ✅ Complete | Aug 20 |

---

## 📁 5. Repository File Structure

```
courier-app/
├── deploy.ps1                              # 1-Click Windows Deploy script
├── deploy.sh                               # 1-Click Linux/Bash Deploy script
├── docker-compose.prod.yml                 # Production Compose (5 Microservices)
├── docker-compose.yml                      # Local Dev Compose
├── MASTER_PRODUCTION_ROADMAP_AND_TIMELINE.md
├── MASTER_ROADMAP_AND_EXECUTION_TIMELINE.md
├── PROJECT_TRACKER.md                      # Active Project Tracker (This file)
├── Shohnaat_Frontend_Page_Plan.md
├── shohnaat-backend/                       # Core Express Backend API (Port 5001)
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma                   # 30+ entities, full relational model
│   └── src/
│       ├── app.js                          # Express app with security middleware
│       ├── lib/                            # Logger, Prisma client
│       ├── middleware/
│       │   ├── auth.js                     # JWT + RBAC
│       │   ├── security.js                 # Helmet, rate limit, sanitization
│       │   └── errorHandler.js             # Centralized error handling
│       ├── routes/                         # 18 route modules
│       ├── services/
│       │   ├── ledgerService.js            # Double-entry financial ledger
│       │   ├── paymentService.js           # Stripe/PayPal integration
│       │   ├── notificationService.js      # BullMQ queue + email/SMS
│       │   ├── webhookService.js           # HMAC signed webhooks
│       │   └── storageService.js           # File upload handling
│       └── tests/
│           ├── smoke-test.js               # 40+ endpoint verification
│           └── e2e-flow-test.js            # Full business flow test
├── shohnaat-storage-service/               # Dedicated Media Microservice (Port 5002)
│   ├── Dockerfile
│   └── src/                                # Multer, Sharp, Stats
└── frontend/                               # Next.js 14 (Port 3001)
    └── src/
        ├── app/                            # 28 routes across 4 roles
        ├── components/
        │   ├── layout/                     # Sidebar, Header, DashboardLayout
        │   └── ui/                         # Reusable design system
        └── lib/                            # API client, utilities
```

---

## 🌐 6. API Endpoints Summary

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | `POST /login`, `POST /register` | Public |
| Shipments | `GET/POST/PATCH`, bulk, stats, status | JWT |
| Riders | `GET/POST/PATCH`, OTP, delivery, failure | JWT |
| Pickups | `GET/POST/PATCH`, approve/reject/cancel | JWT |
| Addresses | `GET/POST/PATCH/DELETE` | JWT |
| Hubs | `GET/POST/PATCH/DELETE` | JWT (Admin) |
| Zones | `GET/POST/PATCH/DELETE` | JWT (Admin) |
| Rates | `GET/POST/PATCH/DELETE`, calculate | JWT |
| Finance | Wallet, entries, settlements, CSV export | JWT |
| Payments | Stripe, PayPal, sandbox, config | JWT |
| Operations | Manifest CRUD, scan receive/bag | JWT |
| Developer | Keys, webhooks, logs, docs | JWT |
| Tracking | `GET /track/:number` | **Public** |
| Notifications | Settings, logs, queue, send | JWT (Admin) |
| Security | Audit, dependencies | JWT (SuperAdmin) |
| Audit Logs | Filterable log query | JWT (Admin) |
| Upload | File upload with categories | JWT |
