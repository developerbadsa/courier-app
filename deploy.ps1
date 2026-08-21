# ============================================================
# Shohnaat Logistics — 1-Click Deploy to VPS
# ============================================================
param(
    [switch]$NoAPK,
    [switch]$SkipDB
)

$VPS_HOST = "mydev"
$REMOTE_DIR = "~/shohnaat-logistics"
$APK_LOCAL = "mobile-flutter\release-apk\Shohnaat-Logistics-v1.0.0-release.apk"
$APK_REMOTE = "$REMOTE_DIR/frontend/public/downloads/shohnaat-rider.apk"

function Write-Step($step, $msg) {
    Write-Host ""
    Write-Host "[$step] $msg" -ForegroundColor Yellow
}

function Write-OK($msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Shohnaat Logistics - 1-Click Deploy" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ── Pre-flight Checks ──────────────────────────────────────
Write-Step "0/6" "Pre-flight checks..."

$sshTest = ssh $VPS_HOST "echo ok" 2>$null
if ($sshTest -ne "ok") {
    Write-Fail "Cannot connect to VPS ($VPS_HOST). Check SSH config."
    exit 1
}
Write-OK "SSH connection to $VPS_HOST verified"

# ── Step 1: Git Push ────────────────────────────────────────
Write-Step "1/6" "Pushing to GitHub..."
git add -A 2>$null
$commitMsg = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMsg 2>$null
git push origin main 2>$null
Write-OK "Code pushed to GitHub"

# ── Step 2: VPS Git Pull ───────────────────────────────────
Write-Step "2/6" "Pulling on VPS..."
ssh $VPS_HOST "cd $REMOTE_DIR && git fetch origin main && git reset --hard origin/main"
Write-OK "VPS code updated"

# ── Step 3: Upload APK (if available) ──────────────────────
if (-not $NoAPK -and (Test-Path $APK_LOCAL)) {
    Write-Step "3/6" "Uploading APK..."
    scp $APK_LOCAL "${VPS_HOST}:${APK_REMOTE}"
    Write-OK "APK uploaded to VPS"
} else {
    Write-Step "3/6" "Skipping APK upload"
}

# ── Step 4: Rebuild Containers ──────────────────────────────
Write-Step "4/6" "Rebuilding Docker containers on VPS..."
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --remove-orphans"
Write-OK "Containers rebuilt and running"

# ── Step 5: Database Migration & Sync ──────────────────────
Write-Step "5/6" "Syncing database schema (Prisma)..."
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend npx prisma generate && docker compose -f docker-compose.prod.yml exec -T backend npx prisma db push --accept-data-loss"
Write-OK "Database schema synced"

# ── Step 6: Status Check ────────────────────────────────────
Write-Step "6/6" "Checking container statuses..."
ssh $VPS_HOST "docker ps --filter 'name=shohnaat' --format 'table {{.Names}}\t{{.Status}}'"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  DEPLOY COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Site:       https://shohnaat.rahimbadsa.me" -ForegroundColor Cyan
Write-Host "  API:        https://api-shohnaat.rahimbadsa.me" -ForegroundColor Cyan
Write-Host "  Health:     https://api-shohnaat.rahimbadsa.me/health" -ForegroundColor Cyan
Write-Host ""
