# 🚀 Shohnaat Logistics — Enterprise Project Tracker

> **Last Updated:** August 19, 2026  
> **Platform:** International Global Courier & Logistics Multi-Tenant SaaS  
> **Currency Standard:** **USD ($) ONLY**  
> **Payment Gateways:** **Stripe & PayPal** (Zero Local BD Gateways)  
> **Deployment:** Multi-Container Docker Environment on Dedicated VPS  
> **Live Domain:** [https://shohnaat.rahimbadsa.me](https://shohnaat.rahimbadsa.me)  
> **API Health:** [https://api-shohnaat.rahimbadsa.me/health](https://api-shohnaat.rahimbadsa.me/health)  

---

## 📊 1. Overall Progress Summary

| Category | Total Tasks | Done ✅ | In Progress 🔄 | Pending ⬜ | Progress |
|---|---|---|---|---|---|
| **DevOps & VPS Infrastructure** | 6 | 6 | 0 | 0 | **100%** |
| **Dedicated Storage Microservice** | 5 | 5 | 0 | 0 | **100%** |
| **UI/UX Reusable Design System** | 8 | 8 | 0 | 0 | **100%** |
| **Authentication & Demo Logins** | 5 | 5 | 0 | 0 | **100%** |
| **Merchant Portal & Shipments** | 12 | 5 | 3 | 4 | **45%** |
| **Superadmin Operations Console** | 10 | 5 | 2 | 3 | **50%** |
| **Field Rider Mobile App (PWA)** | 8 | 4 | 2 | 2 | **50%** |
| **Public Tracking & Timeline** | 5 | 4 | 1 | 0 | **80%** |
| **Rate Matrix & Billing Engine** | 8 | 1 | 2 | 5 | **20%** |
| **Financial Ledger & COD Engine** | 10 | 0 | 1 | 9 | **10%** |
| **Stripe / PayPal USD Gateways** | 6 | 0 | 0 | 6 | **0%** |
| **Developer API & HMAC Webhooks** | 6 | 0 | 0 | 6 | **0%** |
| **Total Deliverables** | **89** | **33** | **11** | **45** | **42% Overall** |

---

## 🐳 2. Live Docker Microservices Architecture

| Container Name | Service | Port (Host ➔ Container) | Status | Role |
|---|---|---|---|---|
| **`shohnaat-frontend`** | Next.js 14 Standalone | `3001:3000` | 🟢 Healthy | High-performance React web portals |
| **`shohnaat-backend`** | Express Core API | `5001:5000` | 🟢 Healthy | Business logic & state machine engine |
| **`shohnaat-storage`** | Storage Microservice | `5002:5000` | 🟢 Healthy | Isolated media/document upload server |
| **`shohnaat-db`** | PostgreSQL 16 Alpine | `5432:5432` (Internal) | 🟢 Healthy | Relational database (20+ entities) |
| **`shohnaat-redis`** | Redis 7 Alpine | `6379:6379` (Internal) | 🟢 Healthy | Session store, caching & job queues |

---

## ✅ 3. Completed Modules & Features

### 🟢 A. DevOps & 1-Click Automation
- [x] **Zero-Conflict VPS Port Allocation:** Conflict audit on VPS (`mydev`), isolated ports 3001/5001/5002.
- [x] **Cloudflare Tunnel Routing:** Frontend at `shohnaat.rahimbadsa.me` & API at `api-shohnaat.rahimbadsa.me`.
- [x] **1-Click Fast Deploy Pipeline:** `deploy.ps1` (PowerShell) and `deploy.sh` (Bash) executing git push, VPS pull, multi-container Docker build, Prisma migration & database seed in seconds.

### 🟢 B. Dedicated Media & Storage Microservice (`shohnaat-storage-service`)
- [x] **Isolated Docker Container (`:5002`):** Zero upload overhead on the transactional backend.
- [x] **Persistent Volume (`uploads_data`):** Preserves uploaded assets across rebuilds.
- [x] **Category Routing:** Auto-segregation into `/kyc/`, `/pod/`, `/parcels/`, `/avatars/`, `/general/`.
- [x] **Security & Validation:** 15MB file limit, MIME-type whitelist, sanitized UUID hashing.
- [x] **High-Speed Static Serving:** 14-day immutable cache headers & live stats endpoint (`GET /api/stats`).

### 🟢 C. Figma-Grade Reusable UI/UX System ([frontend/src/components](file:///c:/A-Drive-Backup/Projects/MERN/courier-app/frontend/src/components))
- [x] **Standard Design Metrics:** 8px/12px border radius, crisp 1px borders, subtle inset shadows.
- [x] **`Sidebar.tsx`:** Multi-role navigation (Merchant, Admin, Rider, Operator) with user profile chip & logout.
- [x] **`Header.tsx`:** `⌘K` global quick search, `HQ • USD ($)` currency pill, notification counter, action slot.
- [x] **`DashboardLayout.tsx`:** Master responsive layout integrating Sidebar + Header for all pages.
- [x] **UI Kit:** `Button.tsx`, `Input.tsx`, `Card.tsx`, `StatCard.tsx`, `StatusBadge.tsx`, `DataTable.tsx`, `Badge.tsx`, `Tabs.tsx`.

### 🟢 D. Live Working Portals
- [x] **Demo Login (`/login`):** 1-Click quick fill chips (`Superadmin`, `Merchant`, `Rider`, `Operator`) with real JWT authentication.
- [x] **Merchant Dashboard (`/dashboard`):** Operational KPI cards, live searchable shipments table, COD wallet widgets.
- [x] **Superadmin Operations Console (`/admin`):** Global fleet overview, merchant KYC verification queue with Approve/Reject actions.
- [x] **Field Rider Mobile App (`/rider`):** Mobile-first task cards, tap-to-call, GPS navigation links, one-tap COD collection button.
- [x] **Public Tracking Portal (`/track`):** Parcel lookup with interactive multi-step transit timeline.

---

## 🎯 4. Active Sprint (Sprint 2 — In Progress)

| Task ID | Task Description | Priority | Assigned Module | Status |
|---|---|---|---|---|
| **2.1** | **Merchant Multi-Step Shipment Wizard** (`/dashboard/shipments/new`) | 🔴 Critical | Frontend | ✅ Done with Tests |
| **2.2** | **Dynamic Rate Calculation Engine API** (`POST /api/v1/rates/calculate`) | 🔴 Critical | Backend/UI | ✅ Done with Tests |
| **2.3** | **Thermal Printable Waybill / A4 Shipping Label PDF** (Code128 + QR) | 🟡 High | Frontend/Service | ✅ Done with Tests |
| **2.4** | **Merchant Address Book CRUD & Saved Warehouses** (`/dashboard/addresses`) | 🟡 High | Fullstack | 🔄 In Progress |
| **2.5** | **Scheduled First-Mile Pickup Request Flow** (`/dashboard/pickups/new`) | 🟡 High | Fullstack | 🔄 Next Up |

---

## 📁 5. Repository File Structure

```
courier-app/
├── deploy.ps1                             # 1-Click Windows Deploy script
├── deploy.sh                              # 1-Click Linux/Bash Deploy script
├── docker-compose.prod.yml                # Production Compose (5 Microservices)
├── docker-compose.yml                     # Local Dev Compose
├── MASTER_PRODUCTION_ROADMAP_AND_TIMELINE.md # 13-Module Production Masterplan
├── PROJECT_TRACKER.md                     # Active Project Tracker (This file)
├── shohnaat-backend/                      # Core Express Backend API (Port 5001)
│   ├── prisma/schema.prisma               # Relational Database Schema
│   └── src/                               # Services, Controllers, State Machine
├── shohnaat-storage-service/              # Dedicated Media & Upload Microservice (Port 5002)
│   ├── Dockerfile                         # Lightweight Alpine runner
│   └── src/                               # Multer Storage Engine, Routes, Stats
└── frontend/                              # Next.js 14 Web Applications (Port 3001)
    └── src/
        ├── app/                           # Role-based App Router pages
        ├── components/layout/             # Reusable Sidebar, Header, DashboardLayout
        └── components/ui/                 # Design System UI Kit
```
