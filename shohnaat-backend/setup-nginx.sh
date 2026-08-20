#!/bin/bash
# ════════════════════════════════════════════════════════════
# Shohnaat Logistics — Apply Nginx Config + SSL + Rebuild
# Run on VPS: sudo bash setup-nginx.sh
# ════════════════════════════════════════════════════════════
set -e

echo "🔧 Shohnaat Nginx + SSL Setup"
echo ""

# ─── 1. NGINX FRONTEND CONFIG ──────────────────────────
echo "📋 Creating frontend nginx config..."
cat > /etc/nginx/sites-available/shohnaat.rahimbadsa.me << 'NGINX_FE'
server {
    listen 80;
    listen [::]:80;
    server_name shohnaat.rahimbadsa.me www.shohnaat.rahimbadsa.me;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        proxy_buffering off;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
NGINX_FE

# ─── 2. NGINX API CONFIG ───────────────────────────────
echo "📋 Creating API nginx config..."
cat > /etc/nginx/sites-available/api.shohnaat.rahimbadsa.me << 'NGINX_API'
server {
    listen 80;
    listen [::]:80;
    server_name api.shohnaat.rahimbadsa.me;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location /health {
        proxy_pass http://127.0.0.1:5001;
        access_log off;
    }
}
NGINX_API

# ─── 3. ENABLE SITES ──────────────────────────────────
echo "🔗 Enabling sites..."
ln -sf /etc/nginx/sites-available/shohnaat.rahimbadsa.me /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.shohnaat.rahimbadsa.me /etc/nginx/sites-enabled/

# ─── 4. SSL WITH CERTBOT ──────────────────────────────
echo ""
echo "🔒 Setting up SSL..."
if command -v certbot &> /dev/null; then
    echo "Certbot found, requesting certificates..."
    certbot --nginx -d shohnaat.rahimbadsa.me -d www.shohnaat.rahimbadsa.me -d api.shohnaat.rahimbadsa.me --non-interactive --agree-tos --email admin@rahimbadsa.me --redirect || {
        echo "⚠️  Certbot failed (DNS may not be configured yet). HTTP will work via Cloudflare."
    }
else
    echo "⚠️  Certbot not found. Installing..."
    apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx
    certbot --nginx -d shohnaat.rahimbadsa.me -d www.shohnaat.rahimbadsa.me -d api.shohnaat.rahimbadsa.me --non-interactive --agree-tos --email admin@rahimbadsa.me --redirect || {
        echo "⚠️  Certbot failed. HTTP will work via Cloudflare."
    }
fi

# Auto-renew cron
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" > /etc/cron.d/certbot-renew

# ─── 5. TEST & RELOAD ─────────────────────────────────
echo ""
echo "🔄 Testing and reloading nginx..."
nginx -t && systemctl reload nginx
echo "✅ Nginx configured and reloaded!"

# ─── 6. REBUILD DOCKER ────────────────────────────────
echo ""
echo "🐳 Rebuilding Docker containers..."
cd ~/shohnaat-logistics

# Stop old containers
docker compose down

# Use production compose
if [ -f docker-compose.prod.yml ]; then
    cp docker-compose.prod.yml docker-compose.yml
fi

# Build and start
docker compose up -d --build

echo ""
echo "⏳ Waiting for containers to start..."
sleep 15

# ─── 7. VERIFY ────────────────────────────────────────
echo ""
echo "🔍 Verification:"
echo ""
docker ps --filter 'name=shohnaat' --format '  {{.Names}} — {{.Status}}'

echo ""
echo "Testing endpoints..."
curl -s -o /dev/null -w "  Frontend (port 3000): HTTP %{http_code}\n" http://localhost:3000 || echo "  Frontend: FAIL"
curl -s -o /dev/null -w "  Backend  (port 5001): HTTP %{http_code}\n" http://localhost:5001/health || echo "  Backend:  FAIL"
curl -s -o /dev/null -w "  Nginx frontend:      HTTP %{http_code}\n" http://localhost -H "Host: shohnaat.rahimbadsa.me" || echo "  Nginx FE: FAIL"
curl -s -o /dev/null -w "  Nginx API:           HTTP %{http_code}\n" http://localhost -H "Host: api.shohnaat.rahimbadsa.me" || echo "  Nginx API: FAIL"

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend: https://shohnaat.rahimbadsa.me"
echo "  🔌 API:      https://api.shohnaat.rahimbadsa.me"
echo "  📊 Tracking: https://shohnaat.rahimbadsa.me/track"
echo ""
echo "  ⚠️  NEXT: Edit API keys in .env"
echo "  nano ~/shohnaat-logistics/shohnaat-backend/.env"
echo "  Then: cd ~/shohnaat-logistics && docker compose up -d --build"
echo ""
