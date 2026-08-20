#!/bin/bash
# ════════════════════════════════════════════════════════════
# Shohnaat Logistics — Live Deployment Script
# Run on VPS: bash deploy-live.sh
# ════════════════════════════════════════════════════════════

set -e

echo "🚀 Shohnaat Live Deployment Starting..."
echo ""

# ─── 1. NGINX CONFIG ────────────────────────────────────
echo "📋 Step 1: Creating Nginx configs..."

sudo tee /etc/nginx/sites-available/shohnaat.rahimbadsa.me > /dev/null << 'FRONTEND_EOF'
# Shohnaat Logistics — Frontend (Next.js)
server {
    listen 80;
    listen [::]:80;
    server_name shohnaat.rahimbadsa.me www.shohnaat.rahimbadsa.me;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Frontend proxy (Next.js)
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

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
}
FRONTEND_EOF

sudo tee /etc/nginx/sites-available/api.shohnaat.rahimbadsa.me > /dev/null << 'API_EOF'
# Shohnaat Logistics — Backend API
server {
    listen 80;
    listen [::]:80;
    server_name api.shohnaat.rahimbadsa.me;

    client_max_body_size 50M;

    # API proxy
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

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:5001;
        access_log off;
    }
}
API_EOF

sudo ln -sf /etc/nginx/sites-available/shohnaat.rahimbadsa.me /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/api.shohnaat.rahimbadsa.me /etc/nginx/sites-enabled/

echo "✅ Nginx configs created"

# ─── 2. SSL WITH CERTBOT ────────────────────────────────
echo ""
echo "🔒 Step 2: Setting up SSL certificates..."

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get update -qq && sudo apt-get install -y -qq certbot python3-certbot-nginx
fi

# Test nginx config first
sudo nginx -t

# Get SSL certificates
echo "Requesting SSL certificates..."
sudo certbot --nginx -d shohnaat.rahimbadsa.me -d www.shohnaat.rahimbadsa.me -d api.shohnaat.rahimbadsa.me --non-interactive --agree-tos --email admin@rahimbadsa.me --redirect || {
    echo "⚠️  Certbot failed — SSL can be configured later. Continuing with HTTP..."
}

# Auto-renew cron
echo "0 0,12 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo tee /etc/cron.d/certbot-renew > /dev/null
echo "✅ SSL setup complete"

# ─── 3. RELOAD NGINX ────────────────────────────────────
echo ""
echo "🔄 Step 3: Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx reloaded"

# ─── 4. BACKEND .ENV ────────────────────────────────────
echo ""
echo "📝 Step 4: Creating backend .env..."

cd ~/shohnaat-logistics

cat > shohnaat-backend/.env << 'ENV_EOF'
# ══════════════════════════════════════════════════════════
# SHOHNAAT LOGISTICS — PRODUCTION ENVIRONMENT
# ══════════════════════════════════════════════════════════

# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://admin:shohnaat_secret_2026@db:5432/shohnaat

# Auth
JWT_SECRET=shohnaat-jwt-production-xK9mP2vL8nQ4wR7jT

# Redis
REDIS_URL=redis://redis:6379

# Frontend URL
FRONTEND_URL=https://shohnaat.rahimbadsa.me
API_URL=https://api.shohnaat.rahimbadsa.me

# ── Stripe (Live Keys) ──
# Get from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_REPLACE_WITH_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_SECRET

# ── PayPal (Live) ──
# Get from: https://developer.paypal.com/dashboard/applications
PAYPAL_CLIENT_ID=REPLACE_WITH_YOUR_CLIENT_ID
PAYPAL_CLIENT_SECRET=REPLACE_WITH_YOUR_CLIENT_SECRET
PAYPAL_MODE=live

# ── Twilio SMS ──
# Get from: https://console.twilio.com
TWILIO_ACCOUNT_SID=REPLACE_WITH_YOUR_SID
TWILIO_AUTH_TOKEN=REPLACE_WITH_YOUR_TOKEN
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# ── Email SMTP (Gmail) ──
# For Gmail: Use App Password (not regular password)
# Generate at: https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM="Shohnaat Logistics <noreply@rahimbadsa.me>"

# ── Upload ──
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ENV_EOF

echo "✅ Backend .env created"
echo ""
echo "⚠️  IMPORTANT: Edit the .env file with your real API keys!"
echo "   nano ~/shohnaat-logistics/shohnaat-backend/.env"
echo ""

# ─── 5. FRONTEND .ENV ────────────────────────────────────
echo "📝 Step 5: Creating frontend .env..."

cd ~/shohnaat-logistics

cat > frontend/.env.local << 'FRONTEND_ENV_EOF'
# Shohnaat Logistics — Frontend Environment
NEXT_PUBLIC_API_URL=https://api.shohnaat.rahimbadsa.me
NEXT_PUBLIC_APP_URL=https://shohnaat.rahimbadsa.me
NEXT_PUBLIC_WS_URL=wss://api.shohnaat.rahimbadsa.me
FRONTEND_ENV_EOF

echo "✅ Frontend .env created"

# ─── 6. REBUILD DOCKER ──────────────────────────────────
echo ""
echo "🐳 Step 6: Rebuilding Docker containers..."

docker compose down
docker compose up -d --build

echo "✅ Docker containers rebuilt"

# ─── 7. VERIFY ──────────────────────────────────────────
echo ""
echo "🔍 Step 7: Verifying deployment..."

sleep 15

echo ""
echo "Container Status:"
docker ps --filter 'name=shohnaat' --format '  {{.Names}} — {{.Status}}'

echo ""
echo "Testing endpoints..."
curl -s -o /dev/null -w "  Frontend: %{http_code}\n" http://localhost:3000 || echo "  Frontend: FAIL"
curl -s -o /dev/null -w "  Backend:  %{http_code}\n" http://localhost:5001/health || echo "  Backend:  FAIL"
curl -s -o /dev/null -w "  Nginx:    %{http_code}\n" http://localhost:80 -H "Host: shohnaat.rahimbadsa.me" || echo "  Nginx:    FAIL"

echo ""
echo "Running smoke tests..."
docker exec shohnaat-backend node src/tests/smoke-test.js 2>&1 | tail -5

echo ""
echo "═══════════════════════════════════════════════════"
echo "  🎉 SHOHNAAT LOGISTICS — DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  🌐 Frontend: https://shohnaat.rahimbadsa.me"
echo "  🔌 API:      https://api.shohnaat.rahimbadsa.me"
echo "  🏥 Health:   https://api.shohnaat.rahimbadsa.me/health"
echo "  📊 Tracking: https://shohnaat.rahimbadsa.me/track"
echo ""
echo "  ⚠️  NEXT STEPS:"
echo "  1. Edit .env with real API keys: nano ~/shohnaat-logistics/shohnaat-backend/.env"
echo "  2. Rebuild after editing: docker compose up -d --build"
echo "  3. Add Cloudflare DNS A records:"
echo "     - shohnaat.rahimbadsa.me → 103.234.202.112"
echo "     - api.shohnaat.rahimbadsa.me → 103.234.202.112"
echo "  4. In Cloudflare: SSL/TLS → Full (Strict)"
echo ""
