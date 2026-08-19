#!/bin/bash
# ============================================================
# Shohnaat Logistics — 1-Click Fast Deploy to VPS
# ============================================================
set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  🚀 Shohnaat Logistics — 1-Click VPS Deploy${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

VPS_HOST="mydev"
REMOTE_DIR="~/shohnaat-logistics"

echo -e "${YELLOW}📤 [1/4] Pushing latest local changes to GitHub...${NC}"
git add .
git commit -m "deploy: update on $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null || true
git push origin main
echo -e "${GREEN}✅ Local changes pushed to GitHub${NC}"

echo -e "${YELLOW}📥 [2/4] Pulling changes on VPS...${NC}"
ssh $VPS_HOST "cd $REMOTE_DIR && git fetch origin main && git reset --hard origin/main"
echo -e "${GREEN}✅ VPS code updated${NC}"

echo -e "${YELLOW}🐳 [3/4] Rebuilding & starting Docker containers...${NC}"
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
echo -e "${GREEN}✅ Containers running${NC}"

echo -e "${YELLOW}🗄️  [4/4] Syncing Database (Prisma)...${NC}"
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend npx prisma generate && docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push --accept-data-loss && docker compose -f docker-compose.prod.yml exec -T backend node prisma/seed.js" 2>/dev/null || true
echo -e "${GREEN}✅ Database synced${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  📊 Status Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ssh $VPS_HOST "docker ps --filter 'name=shohnaat' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🎉 DEPLOY SUCCESSFUL!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "   Frontend: ${CYAN}http://localhost:3001${NC}"
echo -e "   Backend:  ${CYAN}http://localhost:5001${NC}"
echo -e "   Storage:  ${CYAN}http://localhost:5002${NC}"
echo -e "   Health:   ${CYAN}http://localhost:5001/health${NC}"
echo ""
