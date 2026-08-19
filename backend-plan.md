# Shohnaat Logistics — Backend Development Master Plan
> Goal: build once, run for 10 years without a rewrite.

---

## Core Principles (এগুলো ভাঙা যাবে না)

1. **Every business rule lives in the Service layer** — Route/Controller কখনো decision নেবে না, শুধু call করবে।
2. **Money ও Status কখনো overwrite হবে না** — শুধু নতুন row insert (ledger, status history)। এটাই ১০ বছর টিকে থাকার মূল কারণ — audit ট্রেইল কখনো হারাবে না।
3. **প্রতিটা module স্বয়ংসম্পূর্ণ** — নিজের controller/service/repository/routes নিজের ফোল্ডারে। একটা module ভাঙলে অন্যটা প্রভাবিত হবে না।
4. **Backward-compatible API versioning শুরু থেকেই** (`/api/v1/`) — future breaking change করতে হলে `/v2/` বানাবে, পুরনো client ভাঙবে না।
5. **Schema migration সবসময় additive** — কখনো column সরাসরি delete না, প্রথমে deprecate, তারপর কয়েক মাস পর সরাও।

---

# PHASE 0 — Foundation Setup
**লক্ষ্য: খালি হাতে বসেও দিন শেষে ওয়ার্কিং skeleton থাকবে**

| কাজ | বিস্তারিত |
|---|---|
| Repo + folder structure | `modules/`, `lib/`, `middleware/`, `jobs/` স্ট্রাকচার তৈরি |
| Prisma init | schema push, migration ইতিহাস শুরু |
| Docker Compose | postgres + redis + backend কন্টেইনার একসাথে চালু |
| `.env` structure | DATABASE_URL, JWT_SECRET, REDIS_URL, NODE_ENV |
| Central error handler | সব route একই error format রিটার্ন করবে |
| Logger setup | (pino/winston) — request log, error log ফাইলে/console-এ |
| Seed script | default roles + ১টা admin ইউজার + ১টা branch |

**Deliverable:** `docker compose up` দিলে backend চালু হয়, DB কানেক্ট থাকে, `/health` endpoint 200 রিটার্ন করে।

---

# PHASE 1 — Core Operational Backend (Auth → Tracking)
**সময়: ৭-১০ দিন**

### 1.1 Auth Module
| Endpoint | কাজ |
|---|---|
| `POST /api/v1/auth/register` | Merchant/Admin registration |
| `POST /api/v1/auth/login` | JWT access + refresh token issue |
| `POST /api/v1/auth/refresh` | নতুন access token |
| `POST /api/v1/auth/logout` | refresh token invalidate |
| Middleware | JWT verify + role check (RBAC থেকে role match) |

### 1.2 Merchant Module
| Endpoint | কাজ |
|---|---|
| `POST /merchants` | নতুন merchant তৈরি (admin only) |
| `GET /merchants` | তালিকা, pagination + search |
| `GET /merchants/:id` | detail |
| `PATCH /merchants/:id` | update |
| `DELETE /merchants/:id` | soft delete (`deletedAt`) |

### 1.3 Address Module
| Endpoint | কাজ |
|---|---|
| `POST /addresses` | merchant-এর pickup/delivery address যোগ |
| `GET /addresses?merchantId=` | merchant-ভিত্তিক তালিকা |
| `PATCH /addresses/:id` | update |

### 1.4 Pickup Request Module
| Endpoint | কাজ |
|---|---|
| `POST /pickup-requests` | merchant থেকে নতুন request |
| `GET /pickup-requests` | admin queue (status filter) |
| `PATCH /pickup-requests/:id/approve` | approve + rider assign |
| `PATCH /pickup-requests/:id/reject` | reject + reason |

### 1.5 Shipment Module (core — সবচেয়ে গুরুত্বপূর্ণ)
| Endpoint | কাজ |
|---|---|
| `POST /shipments` | tracking number generate + create |
| `GET /shipments/:id` | detail + status history |
| `GET /shipments?trackingNumber=` | public tracking lookup |
| `PATCH /shipments/:id/status` | **state machine validate** করে status update + history insert (transaction-এ) |
| `GET /shipments?merchantId=&status=` | merchant dashboard লিস্ট |

**Status state machine এখানেই lock করা — server-side enforced, client কে trust না করা।**

### 1.6 Rider Module
| Endpoint | কাজ |
|---|---|
| `POST /riders` | rider তৈরি |
| `GET /riders/:id/assignments` | assigned pickup/delivery লিস্ট |
| `PATCH /shipments/:id/assign-rider` | RiderAssignment row তৈরি |
| `PATCH /shipments/:id/confirm-pickup` | rider action → status → PICKED_UP |
| `PATCH /shipments/:id/confirm-delivery` | status → DELIVERED + `deliveredAt` |
| `PATCH /shipments/:id/mark-failed` | reasonCode সহ FAILED |

**Deliverable Phase 1:** Auth কাজ করছে, merchant/pickup/shipment/rider পুরো flow API দিয়ে চলছে, public tracking কাজ করছে।

---

# PHASE 2 — Business Operations Backend
**সময়: ১-২ সপ্তাহ**

### 2.1 Pricing Module
| Endpoint | কাজ |
|---|---|
| `POST /rate-cards` | rate card তৈরি |
| `POST /rate-cards/:id/rules` | zone/service-wise rule যোগ |
| `POST /pricing/calculate` | fees calculator (public, merchant/customer ইউজ করবে) |

### 2.2 Financial (Simple, Phase 2 লেভেল)
| Endpoint | কাজ |
|---|---|
| `GET /merchants/:id/dues` | isSettled=false shipment গুলোর sum |
| `POST /merchants/:id/payments` | manual payment mark |
| `GET /merchants/:id/statement` | history লিস্ট |

### 2.3 Complaints
| Endpoint | কাজ |
|---|---|
| `POST /complaints` | shipment reference সহ create |
| `GET /complaints` | admin queue |
| `PATCH /complaints/:id` | status update |

### 2.4 Customer Requests
| Endpoint | কাজ |
|---|---|
| `POST /customer-requests` | general request |
| `GET /customer-requests` | admin manage |

### 2.5 Public API (merchant website integration)
| Endpoint | কাজ |
|---|---|
| `POST /api/v1/public/shipments` | API-key auth, Idempotency-Key check |
| `GET /api/v1/public/shipments/:tracking` | status lookup |
| `POST /api/v1/public/webhooks` | webhook URL register |

### 2.6 Notification Jobs (BullMQ)
| Job | Trigger |
|---|---|
| SMS/Email send | status change event |
| Webhook delivery | status change event, retry backoff সহ |

**Deliverable Phase 2:** Pricing automated, financial visibility আছে, merchant website API দিয়ে connect করতে পারবে।

---

# PHASE 3 — Advanced/Enterprise Backend
**সময়: আলাদা scope, Phase 1+2 লাইভ হওয়ার পর**

| Module | কাজ |
|---|---|
| Manifest/Warehouse | scan-in/scan-out endpoint, branch transfer flow |
| Real GPS | rider location ping endpoint + live query |
| Double-entry Ledger | প্রতি event-এ DEBIT+CREDIT pair পোস্ট করার service |
| Settlement engine | period-wise auto-calculate + payout tracking |
| Full Accounting | ledger থেকে trial balance, P&L, balance sheet জেনারেট |
| WhatsApp Integration | BSP API + template message service |
| Fine-grained RBAC | Permission টেবিল actually enforce করা (এখন শুধু role name check) |
| Audit log enforcement | প্রতিটা sensitive action-এ AuditLog write |

---

# PHASE 4 — Hardening for 10-Year Longevity
**production লাইভ হওয়ার পরে, চলমান কাজ — একবারে শেষ হয় না**

| বিষয় | কাজ |
|---|---|
| **Backups** | Automated daily PostgreSQL backup + off-site copy |
| **Monitoring** | Uptime check, error alerting (email/Telegram bot) |
| **Load testing** | বছরে ১-২ বার — শিপমেন্ট ভলিউম বাড়লে bottleneck খুঁজে বের করা |
| **Dependency updates** | quarterly — Node/Prisma/npm packages patch |
| **DB query audit** | slow query log রিভিউ, নতুন index দরকার কিনা |
| **Documentation** | প্রতিটা module-এর README — নতুন developer/future-তুমি বুঝতে পারবে |
| **API versioning discipline** | breaking change মানেই নতুন version, পুরনো deprecate করে সময় দিয়ে সরানো |
| **Security review** | বছরে অন্তত একবার — dependency vulnerability scan, JWT secret rotation |

---

## সারসংক্ষেপ টাইমলাইন

| Phase | Scope | সময় |
|---|---|---|
| Phase 0 | Foundation/setup | ১-২ দিন |
| Phase 1 | Core operational backend | ৭-১০ দিন |
| Phase 2 | Business operations backend | ১-২ সপ্তাহ |
| Phase 3 | Advanced/enterprise backend | আলাদা scope |
| Phase 4 | Hardening/maintenance | চলমান, লাইভের পর থেকে সারাজীবন |

---

## ১০ বছর টেকার আসল কারণ (recap)

এই প্ল্যান ১০ বছর টিকবে কারণ ফিচার বেশি থাকার জন্য না — বরং:
- Status ও টাকার হিসাব কখনো overwrite হয় না, শুধু append হয়
- Business logic route থেকে আলাদা, তাই individual module বদলানো নিরাপদ
- API versioned, তাই পুরনো integration ভাঙে না
- Migration সবসময় additive, তাই পুরনো ডেটা হারায় না

**এই ৪টা discipline মেনে চললে, ফিচার যতই বাড়ুক, foundation ভাঙবে না।**
