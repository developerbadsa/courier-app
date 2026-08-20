# 🛡️ Shohnaat Logistics — Security & Hardening Master Plan (Post-MVP)

> **Document Version:** 1.0.0  
> **Status:** Roadmap & Action Plan for High-Scale Enterprise Security  
> **Target Scope:** Infrastructure, Application Layer, Data Protection, Auth, and Compliance

---

## 📌 Executive Summary

This master plan outlines the comprehensive security hardening roadmap for Shohnaat Logistics. It is divided into 5 distinct security domains to be implemented in phases as the business scales from MVP to high-volume commercial operations.

---

## 🏛️ Domain 1: Authentication & Authorization Hardening

### 1.1 Multi-Factor Authentication (MFA / 2FA)
- [ ] **TOTP (Time-based One-Time Password):** Integrate Google Authenticator / Authy support for Admin and Merchant accounts.
- [ ] **SMS / WhatsApp 2FA:** Backup OTP delivery for field riders and merchants using Twilio / WhatsApp Business API.
- [ ] **Recovery Codes:** 8 single-use emergency backup recovery codes generated on MFA setup.

### 1.2 Session Security & Token Rotation
- [ ] **Refresh Token Rotation (RTR):** Invalidate old refresh tokens immediately upon rotation to prevent replay attacks.
- [ ] **Redis Token Blacklisting:** Instant token revocation on user password change, logout, or account suspension.
- [ ] **Device Fingerprinting:** Track IP, User-Agent, and location on login; alert user on new/suspicious logins.

### 1.3 Strict Role-Based & Attribute-Based Access Control (RBAC / ABAC)
- [ ] **Hub-Level Data Isolation:** Branch managers restricted strictly to parcels within their hub's geographic boundary.
- [ ] **Rider Geofencing:** Rider can only mark "Delivered" if GPS coordinates are within 100 meters of the delivery destination.

---

## 🗄️ Domain 2: Database & Data Protection

### 2.1 Encryption at Rest & In Transit
- [ ] **TLS 1.3 Everywhere:** Strict HTTPS on all internal microservices and external gateways.
- [ ] **Field-Level Encryption (Envelope Encryption):** Encrypt sensitive PII (Customer phone numbers, National IDs, Stripe Customer IDs) using AES-256-GCM before saving to PostgreSQL.
- [ ] **PostgreSQL Transparent Data Encryption (TDE) / Disk Encryption:** Full LUKS / AWS KMS disk encryption on storage volumes.

### 2.2 Immutable Audit Trails & Nonce Hashing
- [ ] **Ledger Cryptographic Chaining:** Add SHA-256 block hash to each `LedgerEntry` pointing to previous row hash (blockchain-like tamper-evident ledger).
- [ ] **Superadmin Action Audit:** Every status override, manual rate change, and wallet adjustment logged with timestamp, actor IP, and diff snapshot.

### 2.3 Automated Backup & Disaster Recovery (DR)
- [ ] **Automated Hourly WAL Archiving:** Point-in-Time Recovery (PITR) for PostgreSQL database.
- [ ] **Off-Site Encrypted S3 Backups:** Daily encrypted database dumps uploaded to Cloudflare R2 / AWS S3 with 30-day retention.
- [ ] **Disaster Recovery Drill:** Quarterly automated restore verification into staging environment.

---

## 🌐 Domain 3: Network & Edge Security (Cloudflare & VPS)

### 3.1 Cloudflare WAF & DDoS Protection
- [ ] **WAF Managed Rules:** Enable OWASP Core Rule Set on Cloudflare (SQLi, XSS, RCE protection).
- [ ] **Custom Rate Limiting Rules:**
  - Login endpoint: Max 5 attempts per minute per IP.
  - Tracking endpoint: Max 30 requests per minute per IP.
  - API endpoints: Max 100 requests per minute per Merchant API Key.
- [ ] **Bot Management & Challenge:** Cloudflare Turnstile CAPTCHA on signup and public parcel tracking lookups.

### 3.2 VPS & Linux OS Hardening
- [ ] **Fail2ban Integration:** Automatically ban IPs with multiple failed SSH attempts.
- [ ] **SSH Hardening:** Disable password authentication, enable key-only auth with ED25519 keys on non-standard port.
- [ ] **UFW Firewall:** Close all inbound ports except Cloudflare Tunnel egress (zero exposed public ports).
- [ ] **Rootless Docker:** Run Docker daemon and all 6 containers under unprivileged non-root users.

---

## 📦 Domain 4: Microservice & Application Layer Defense

### 4.1 Storage Microservice Sandboxing
- [ ] **Antivirus & Malware Scanning:** Run ClamAV scan on uploaded KYC documents, avatar images, and POD photos before moving to permanent storage.
- [ ] **Strict Magic Byte Verification:** Reject files where file extension does not match true binary magic bytes (`image/jpeg`, `image/png`, `application/pdf`).
- [ ] **Filename Sanitization:** Strip all metadata (EXIF GPS tags) and generate random UUIDv4 filenames.

### 4.2 API Security & HMAC Signature
- [ ] **Webhook Replay Protection:** Timestamp window (5 minutes max) + HMAC SHA-256 signature verification for all outgoing and incoming webhooks.
- [ ] **Payload Sanitization:** Schema-strict payload validation using Zod on every API request.
- [ ] **Content Security Policy (CSP):** Strict CSP headers disallowing inline script execution and unauthorized external domains.

---

## 🔍 Domain 5: Monitoring, Vulnerability Scanning & Compliance

### 5.1 Real-Time Threat Monitoring & Alerting
- [ ] **Sentry Error Tracking:** Real-time exception and security anomaly tracking for Frontend and Backend.
- [ ] **Telegram / Slack Admin Alerts:** Immediate alert on 500 errors, database connection drops, or abnormal rate limit spikes.
- [ ] **Uptime Robot / Better Uptime:** 1-minute interval health checks with automated SMS alerts.

### 5.2 CI/CD Security Scanning
- [ ] **Dependency Vulnerability Scanning:** Automated `npm audit` and Snyk scans in GitHub Actions CI/CD.
- [ ] **SonarQube / CodeQL Static Analysis:** Automated SAST scanning on every pull request.
- [ ] **Secret Scanning:** GitGuardian / TruffleHog to ensure zero `.env` or API keys get committed.

### 5.3 Regulatory & Industry Compliance
- [ ] **GDPR / CCPA Right to be Forgotten:** Automated tool to redact customer PII after regulatory retention periods (7 years for financial records, 90 days for tracking logs).
- [ ] **PCI-DSS Compliance:** Zero storage of credit card numbers on servers (100% tokenized via Stripe Elements & PayPal SDK).

---

## 🚀 Implementation Timeline Matrix

| Priority | Phase | Target Timeline | Focus Area |
|---|---|---|---|
| **P0 (Critical)** | Phase 1 | Pre-Commercial Go-Live (1-2 days) | Cloudflare WAF, DB Daily Backups, Live API Key Isolation |
| **P1 (High)** | Phase 2 | Month 1 Post-Launch | 2FA / TOTP for Admins, Refresh Token Rotation, Magic Byte Upload Scan |
| **P2 (Medium)** | Phase 3 | Month 2-3 | Sentry Monitoring, Geofenced Rider Delivery, Cryptographic Ledger Hash |
| **P3 (Enterprise)**| Phase 4 | Quarter 2 | ClamAV Antivirus, GDPR PII Anonymizer, Automated DR Drills |

---
*Created for Shohnaat Logistics Enterprise Architecture — Ready for Phase-by-Phase Application.*
