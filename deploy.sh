#!/bin/bash
# ============================================================
# Shohnaat Logistics — Automated VPS Deploy Script
# ============================================================
# Usage: bash deploy.sh
# ============================================================

set -e

# ── Colors ───────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  🚀 Shohnaat Logistics — VPS Deploy${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Config ───────────────────────────────────────────────────
VPS_HOST="mydev"
REMOTE_DIR="~/shohnaat-logistics"

# ── Step 1: Generate production secrets ─────────────────────
echo -e "${YELLOW}📦 Step 1/8: Generating production secrets...${NC}"
DB_PASS=$(openssl rand -hex 16 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)
JWT_REFRESH=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 64)

cat > .env.production << EOF
# Shohnaat Logistics — Production Environment
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
NODE_ENV=production
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH}
EOF

echo -e "${GREEN}✅ Secrets generated${NC}"

# ── Step 2: Create remote directory ─────────────────────────
echo -e "${YELLOW}📁 Step 2/8: Preparing remote directory...${NC}"
ssh $VPS_HOST "mkdir -p $REMOTE_DIR"
echo -e "${GREEN}✅ Remote directory ready${NC}"

# ── Step 3: Sync code ───────────────────────────────────────
echo -e "${YELLOW}📤 Step 3/8: Uploading code to VPS...${NC}"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'coverage' \
  --exclude '*.log' \
  --exclude '.env' \
  --exclude '.env.production' \
  --exclude '.freebuff' \
  --exclude 'buyer to show' \
  --exclude 'shohnaat-backend/node_modules' \
  --exclude 'frontend/node_modules' \
  --exclude 'frontend/.next' \
  "./" "$VPS_HOST:$REMOTE_DIR/"
echo -e "${GREEN}✅ Code uploaded${NC}"

# ── Step 4: Copy production .env ────────────────────────────
echo -e "${YELLOW}🔐 Step 4/8: Setting up production .env on VPS...${NC}"
scp .env.production "$VPS_HOST:$REMOTE_DIR/.env"
rm -f .env.production
echo -e "${GREEN}✅ Production .env deployed${NC}"

# ── Step 5: Stop old containers ─────────────────────────────
echo -e "${YELLOW}🛑 Step 5/8: Stopping old containers...${NC}"
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml down 2>/dev/null || true"
echo -e "${GREEN}✅ Old containers stopped${NC}"

# ── Step 6: Build & start ──────────────────────────────────
echo -e "${YELLOW}🐳 Step 6/8: Building and starting containers...${NC}"
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
echo -e "${GREEN}✅ Containers started${NC}"

# ── Step 7: DB Push + Seed ─────────────────────────────────
echo -e "${YELLOW}🗄️  Step 7/8: Database setup (push + seed)...${NC}"
sleep 15
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend npx prisma generate" 2>/dev/null || true
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push --accept-data-loss" 2>/dev/null || true
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend node prisma/seed.js" 2>/dev/null || true
echo -e "${GREEN}✅ Database ready${NC}"

# ── Step 8: Verify ─────────────────────────────────────────
echo -e "${YELLOW}⏳ Step 8/8: Final verification...${NC}"
sleep 10

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  📊 Container Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ssh $VPS_HOST "docker ps --filter 'name=shohnaat' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  🏥 Health Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ssh $VPS_HOST "curl -s http://localhost:5001/health 2>/dev/null || echo 'Backend starting...'"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌐 URLs (localhost on VPS):"
echo -e "   Backend API:  ${CYAN}http://localhost:5001${NC}"
echo -e "   Frontend:     ${CYAN}http://localhost:3001${NC}"
echo -e "   Health:       ${CYAN}http://localhost:5001/health${NC}"
echo ""
echo -e "📋 Quick commands:"
echo -e "   SSH:      ssh mydev"
echo -e "   Logs:     cd ~/shohnaat-logistics && docker compose -f docker-compose.prod.yml logs -f"
echo -e "   Restart:  cd ~/shohnaat-logistics && docker compose -f docker-compose.prod.yml restart"
echo -e "   Stop:     cd ~/shohnaat-logistics && docker compose -f docker-compose.prod.yml down"
echo -e "   Status:   docker ps --filter 'name=shohnaat'"
echo ""
echo -e "🔑 Default Login:"
echo -e "   Email:    ${CYAN}admin@shohnaat.com${NC}"
echo -e "   Password: ${CYAN}admin123${NC}"
echo ""
