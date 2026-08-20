# 🏛️ Shohnaat Logistics — Enterprise Microservices Architecture & Fault-Tolerance Master Plan

> **Document Version:** 1.0.0  
> **Status:** Production Standard & Scaling Roadmap  
> **Architecture Style:** Domain-Driven Hybrid Modular Microservices Stack

---

## 📌 1. Architecture Overview & Microservices Evolution

Shohnaat Logistics is designed with a **Domain-Driven Modular Microservices Architecture**. This enables the platform to operate with high efficiency and low memory overhead during MVP/early stages, while maintaining clean domain boundaries that can be split into standalone containerized microservices as traffic scales.

### 🗺️ Target Microservices Topology (High-Scale 50K+ Parcels/Day)

```
                                  ┌──────────────────────────┐
                                  │    Cloudflare Gateway    │
                                  │ (WAF, SSL, Rate Limiter) │
                                  └─────────────┬────────────┘
                                                │
                                    ┌───────────┴───────────┐
                                    │   Reverse Proxy / API  │
                                    │         Gateway       │
                                    └───────────┬───────────┘
                                                │
       ┌────────────────────┬───────────────────┼───────────────────┬────────────────────┐
       ▼                    ▼                   ▼                   ▼                    ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     ┌──────────────┐
│  Core Order  │     │   Isolated   │    │  Billing &   │    │  Live Fleet  │     │ Notification │
│   Service    │     │Storage Engine│    │Ledger Service│    │  & Tracking  │     │  & Webhooks  │
│ (Port :5001) │     │ (Port :5002) │    │ (Port :5003) │    │ (Port :5004) │     │ (Port :5005) │
└──────┬───────┘     └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     └──────┬───────┘
       │                    │                   │                   │                    │
       └────────────────────┴───────────┬───────┴───────────────────┴────────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │      Shared Data Layer      │
                         │ PostgreSQL 16  +  Redis 7   │
                         └─────────────────────────────┘
```

---

## 📦 2. Microservice Domain Boundaries & Responsibilities

| Microservice | Port | Domain Responsibility | Tech Stack | Isolation Benefit |
|---|---|---|---|---|
| **1. Core Order Service** | `:5001` | Merchant parcel booking, 4-step wizard, Hub inbound/outbound barcode sorting, pickup dispatch, role-based auth. | Node.js, Express, Prisma | High transaction throughput for shipment status lifecycle. |
| **2. Storage Microservice** *(Live)* | `:5002` | KYC document verification, Proof of Delivery (POD) photo capture, parcel media, Sharp image resizing. | Node.js, Sharp Engine, Multer | Heavy image processing never blocks the transactional event loop. |
| **3. Billing & Financial Service** | `:5003` | Double-entry append-only ledger, Stripe/PayPal webhooks, merchant COD wallet balances, payout settlements. | Node.js, Stripe SDK, PayPal SDK | Absolute financial integrity with zero data mutation. |
| **4. Live Fleet & Tracking Service** | `:5004` | Real-time rider GPS coordinates, sub-millisecond public tracking cache, ETA calculations, Socket.io broadcasting. | Node.js, Redis Geohash, Socket.io | High-frequency GPS updates buffered in Redis memory without hitting DB. |
| **5. Notification & Webhook Service** | `:5005` | BullMQ message queue, HTML transactional emails, SMS OTP alerts, merchant HMAC webhook delivery with exponential retries. | Node.js, BullMQ, Redis, Nodemailer | Async jobs never delay synchronous API client responses. |

---

## 🛡️ 3. Seven-Layer Fault-Tolerance & Error Resilience Engine

The platform implements a **7-layer self-healing defense system** to prevent crashes, data corruption, and cascading failures.

### Layer 1: Centralized Error Interceptor & Classification (`errorHandler.js`)
* **Standardized JSON Error Contract:**
  ```json
  {
    "success": false,
    "error_code": "DUPLICATE_RESOURCE",
    "message": "A record with this trackingNumber already exists.",
    "requestId": "req-9a8f-4b12",
    "timestamp": "2026-08-20T14:45:00.000Z"
  }
  ```
* **Prisma Error Code Mapping:**
  * `P2002` ➔ `409 Conflict` (`DUPLICATE_RESOURCE`)
  * `P2025` ➔ `404 Not Found` (`RESOURCE_NOT_FOUND`)
  * `P2003` ➔ `400 Bad Request` (`FOREIGN_KEY_VIOLATION`)
  * `P2000` ➔ `400 Bad Request` (`VALUE_TOO_LONG`)
  * `P2024` ➔ `503 Service Unavailable` (`DB_CONNECTION_TIMEOUT`)
* **Information Leak Prevention:** Raw database stack traces are suppressed in production mode.

### Layer 2: ACID Database Transaction Rollbacks (`prisma.$transaction`)
* All multi-step operations (e.g., status update + status history + ledger entry + audit log) are wrapped in atomic transactions.
* If any step fails, the entire transaction is rolled back, preventing orphaned or inconsistent records.

### Layer 3: Database Self-Healing Connection Pool (`connectWithRetry`)
* If PostgreSQL drops or restarts, the connection pool initiates an exponential backoff loop (up to 5 retries at increasing intervals) instead of terminating the Node.js process.
* Server operates in resilient degraded mode during transient network splits.

### Layer 4: Resilient Redis Cache Fallback (Zero Single Point of Failure)
* In `cache.js`, all cache lookups are wrapped in safe try/catch blocks with `enableOfflineQueue: false`.
* If Redis goes offline or restarts, every request seamlessly bypasses cache and reads directly from PostgreSQL with **zero downtime or client errors**.

### Layer 5: Asynchronous Retry & Dead-Letter Queue (BullMQ)
* Background jobs (emails, webhooks) are retried 5 times with exponential backoff (`1m`, `5m`, `15m`, `30m`, `1h`).
* Permanent failures are routed to a Dead-Letter Queue (DLQ) for admin inspection rather than blocking queue workers.

### Layer 6: Process-Level Exception Safety Nets
* `process.on('unhandledRejection')` and `process.on('uncaughtException')` catch asynchronous edge-case errors, log structured stack traces, and keep the server process responsive.

### Layer 7: Graceful Shutdown & Request Draining (`SIGTERM` / `SIGINT`)
* When Docker updates or restarts a container, active HTTP connections are allowed to complete before database pools and Redis connections are closed.

---

## 📊 4. Resilience & Scalability Metrics

| Scenario | System Behavior | Recovery Mechanism |
|---|---|---|
| **Redis Server Restarts** | API continues operating normally with direct DB queries. | Auto-reconnects and resumes cache hits automatically. |
| **PostgreSQL Transient Drop** | DB retry loop activates; non-DB endpoints remain alive. | Auto-re-establishes connection within 5 retry cycles. |
| **Invalid Client Payload / Malformed JSON** | Returns clean `400 Bad Request` with `MALFORMED_JSON` code. | Process stays healthy; zero unhandled crash. |
| **Duplicate Tracking Number Collision** | Returns clean `409 Conflict` with `DUPLICATE_RESOURCE` code. | Client receives actionable error without database panic. |
| **Third-Party Merchant Server Down on Webhook** | Webhook job fails quietly; scheduled for retry in BullMQ. | Exponential backoff over 5 cycles (up to 24 hours). |
| **High Concurrent Image Uploads** | Processed by isolated `:5002` storage container. | Core API `:5001` maintains < 10ms latency. |

---
*Created for Shohnaat Logistics Architecture Documentation.*
