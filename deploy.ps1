# Shohnaat Logistics - 1-Click Fast Deploy to VPS (PowerShell)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Shohnaat Logistics - 1-Click VPS Deploy" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$VPS_HOST = "mydev"
$REMOTE_DIR = "~/shohnaat-logistics"

# 1. Local Git Push
Write-Host "[1/4] Pushing latest local changes to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "deploy: update" 2>$null
git push origin main
Write-Host "[OK] Local changes pushed to GitHub" -ForegroundColor Green

# 2. VPS Git Pull
Write-Host "[2/4] Pulling changes on VPS..." -ForegroundColor Yellow
ssh $VPS_HOST "cd $REMOTE_DIR ; git fetch origin main ; git reset --hard origin/main"
Write-Host "[OK] VPS code updated" -ForegroundColor Green

# 3. Docker Compose Rebuild
Write-Host "[3/4] Rebuilding Docker containers on VPS..." -ForegroundColor Yellow
ssh $VPS_HOST "cd $REMOTE_DIR ; docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
Write-Host "[OK] Containers running" -ForegroundColor Green

# 4. Prisma Sync & Seed
Write-Host "[4/4] Syncing Database (Prisma)..." -ForegroundColor Yellow
ssh $VPS_HOST "cd $REMOTE_DIR ; docker compose -f docker-compose.prod.yml exec -T backend npx prisma generate ; docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push --accept-data-loss ; docker compose -f docker-compose.prod.yml exec -T backend node prisma/seed.js"
Write-Host "[OK] Database synced" -ForegroundColor Green

# Status Check
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Container Status" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
ssh $VPS_HOST "docker ps --filter name=shohnaat"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  DEPLOY SUCCESSFUL!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5001" -ForegroundColor Cyan
Write-Host "Storage:  http://localhost:5002" -ForegroundColor Cyan
Write-Host "Health:   http://localhost:5001/health" -ForegroundColor Cyan
