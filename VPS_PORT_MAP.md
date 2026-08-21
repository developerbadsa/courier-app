# 🗺️ VPS Port Allocation Map

> **VPS Host:** `mydev` (rahimbadsa723@devrahimbadsa)
> **Purpose:** Every port used on VPS — NEVER assign a conflicting port.

---

## Port Allocation Table

| Port | Service | Protocol | Binding | Status |
|------|---------|----------|---------|--------|
| **22** | SSH | TCP | `0.0.0.0` | 🟢 Always on |
| **53** | DNS (systemd-resolved) | TCP/UDP | `127.0.0.53` | 🟢 System |
| **80** | Nginx (HTTP) | TCP | `0.0.0.0` | 🟢 Always on |
| **443** | Nginx (HTTPS) | TCP | `0.0.0.0` | 🟢 Always on |
| **4000** | bike-server (PM2) | TCP | `*` | 🟢 PM2 managed |
| **5000** | ISP App Backend (PM2) | TCP | `*` | 🟢 PM2 managed |
| **5001** | Shohnaat Backend (Docker) | TCP | `0.0.0.0` | ⚔️ Manual start |
| **5002** | Shohnaat Storage (Docker) | TCP | `0.0.0.0` | ⚔️ Manual start |
| **3000** | Shohnaat Frontend (Docker) | TCP | — | ⚔️ Manual start |
| **5432** | PostgreSQL (Docker) | TCP | `127.0.0.1` | 🟢 Always on |
| **6379** | Redis (Docker) | TCP | `6379` | 🟢 Always on |
| **8090** | ISP App Frontend (Docker) | TCP | `127.0.0.1` | 🟢 Always on |
| **5100** | ISP App Backend (Docker) | TCP | `127.0.0.1` | 🟢 Always on |
| **5900** | VNC | TCP | `127.0.0.1` | 🟡 Remote access |
| **61209** | glances (monitoring) | TCP | `127.0.0.1` | 🟡 Monitoring |
| **8728** | socat (tunnel) | TCP | `0.0.0.0` | 🟢 Tunnel |
| **18212** | FreeRADIUS auth (UDP) | UDP | `0.0.0.0` | 🟢 ISP service |
| **18213** | FreeRADIUS acct (UDP) | UDP | `0.0.0.0` | 🟢 ISP service |

---

## 🚫 Reserved / Do-Not-Use Ports

| Port | Why Reserved |
|------|-------------|
| **3000** | Shohnaat Frontend ONLY. Never assign to podesk or other apps. |
| **5001** | Shohnaat Backend API ONLY. |
| **5002** | Shohnaat Storage Service ONLY. |
| **5432** | PostgreSQL ONLY. |
| **6379** | Redis ONLY. |

---

## ⚠️ Rules for New Services

1. **NEVER use port 3000, 5001, 5002, 5432, or 6379** for any other service.
2. For new Docker containers, use ports starting from **5003+**.
3. For new PM2 apps, use ports starting from **4001+**.
4. Before assigning a port, run: `ssh mydev "ss -tlnp | grep :PORT"`
5. After starting a service, verify: `ssh mydev "docker ps --format '{{.Names}} {{.Ports}}'"`

---

## Cloudflare Tunnel Routes

| Domain | Target | Port |
|--------|--------|------|
| `shohnaat.rahimbadsa.me` | `localhost:3000` | Shohnaat Frontend ✅ |
| `api-shohnaat.rahimbadsa.me` | `localhost:5001` | Shohnaat Backend API |
| `bike-server.rahimbadsa.me` | `localhost:4000` | Bike Server |
| `podesk.rahimbadsa.me` | `localhost:9999` | ⛔ OFF (Vercel) |
| `isp.rahimbadsa.me` | `localhost:80` | ISP App |

---

*Last updated: August 20, 2026*
