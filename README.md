# Shohnaat Logistics — Enterprise Courier & Logistics Platform

> **Engineered for 10-Year Longevity**: Single Next.js web application with role-based routing, Node.js/Express modular architecture, PostgreSQL (16+) with double-entry ledgers, and Redis (7+) BullMQ background queues.

---

## 🛠️ Docker Container Architecture

```
                       ┌─────────────────────────┐
                       │   docker-compose.yml    │
                       └────────────┬────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       │                            │                            │
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  PostgreSQL  │             │    Redis     │             │   Backend    │
│  (Port 5432) │             │ (Port 6379)  │             │ (Port 5000)  │
└──────────────┘             └──────────────┘             └──────┬───────┘
                                                                 │
                                                                 ▼
                                                          ┌──────────────┐
                                                          │   Frontend   │
                                                          │ (Port 3000)  │
                                                          └──────────────┘
```

---

## 🚀 Quick Start (Docker)

### 1. Development Mode (with Live Code Hot-Reloading)

```bash
# Spin up all 4 containers with live file sync
docker compose -f docker-compose.dev.yml up --build

# Run in background (detached)
docker compose -f docker-compose.dev.yml up -d
```

### 2. Production Mode

```bash
# Build and run optimized multi-stage images
docker compose up --build -d
```

---

## 🌐 Application Endpoints

| Service | Local URL | Description |
|---|---|---|
| **Frontend Web App** | `http://localhost:3000` | Main portal switcher & landing |
| ├── Merchant Portal | `http://localhost:3000/dashboard` | Shipments, pickups, COD ledger |
| ├── Admin Console | `http://localhost:3000/admin` | Branch dispatch, KYC approvals |
| ├── Rider App (Mobile) | `http://localhost:3000/rider` | 48px touch task list, COD collect |
| └── Public Tracking | `http://localhost:3000/track` | Instant live parcel status lookup |
| **Backend API** | `http://localhost:5000` | Modular Express API (`/api/v1/`) |
| └── Health Check | `http://localhost:5000/health` | PostgreSQL & Redis ping check |
| **Prisma Studio (Dev)** | `http://localhost:5555` | Database GUI inspector |
| **PostgreSQL Database** | `localhost:5432` | DB: `shohnaat_logistics` |
| **Redis Store** | `localhost:6379` | BullMQ message broker |

---

## 📦 Database Management & Prisma

Run these inside the `backend` container or locally with Node.js installed:

```bash
# Apply migrations / Push schema to PostgreSQL
docker compose -f docker-compose.dev.yml exec backend npx prisma db push

# Run Database Seeder (Seeds default roles, main Hub branch, admin user)
docker compose -f docker-compose.dev.yml exec backend npm run prisma:seed

# Launch Prisma Studio GUI
docker compose -f docker-compose.dev.yml exec backend npx prisma studio
```

### Default Seeded Super Admin Credentials:
- **Email / Phone**: `admin@shohnaat.com` / `+10000000001`
- **Password**: `Admin@Shohnaat2026!`
- **Role**: `super_admin`

---

## 🔒 Strict Client Compliance Decisions

1. **Currency**: Strictly **USD (`$`)** across all forms, ledgers, and calculators. Never BDT.
2. **Payment Gateways**: Strictly **PayPal & Stripe** for international processing.
3. **Data Integrity**: Money & Status are **append-only** (`ledger_entries`, `shipment_status_history`). Never overwritten.
