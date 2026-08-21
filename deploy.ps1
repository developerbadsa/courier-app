# ============================================================
# Shohnaat Logistics — 1-Click Deploy to VPS
# ============================================================
# Usage:  .\deploy.ps1           (full deploy)
#         .\deploy.ps1 -NoAPK    (skip APK upload)
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
    Write-Host "  ✅ $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🚀 Shohnaat Logistics — 1-Click Deploy" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ── Pre-flight Checks ──────────────────────────────────────
Write-Step "0/6" "Pre-flight checks..."

# Check git status
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "  ⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    $gitStatus | Select-Object -First 5 | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkYellow }
    Write-Host "  Auto-committing..." -ForegroundColor Yellow
}

# Check SSH connectivity
$sshTest = ssh $VPS_HOST "echo ok" 2>$null
if ($sshTest -ne "ok") {
    Write-Fail "Cannot connect to VPS ($VPS_HOST). Check SSH config."
    exit 1
}
Write-OK "SSH connection to $VPS_HOST"

# Check APK file
if (-not $NoAPK -and (Test-Path $APK_LOCAL)) {
    $apkSize = (Get-Item $APK_LOCAL).Length / 1MB
    Write-OK "APK found: $([math]::Round($apkSize, 1)) MB"
} elseif (-not $NoAPK) {
    Write-Host "  ⚠️  APK not found at $APK_LOCAL — skipping APK upload" -ForegroundColor Yellow
    $NoAPK = $true
}

# ── Step 1: Git Push ────────────────────────────────────────
Write-Step "1/6" "Pushing to GitHub..."
git add -A 2>$null
$commitMsg = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMsg 2>$null
git push origin main 2>$null
Write-OK "Code pushed to GitHub"

# ── Step 2: VPS Git Pull ───────────────────────────────────
Write-Step "2/6" "Pulling on VPS..."
ssh $VPS_HOST "cd $REMOTE_DIR && git fetch origin main && git reset --hard origin/main" 2>$null
Write-OK "VPS code updated"

# ── Step 3: Upload APK ─────────────────────────────────────
if (-not $NoAPK) {
    Write-Step "3/6" "Uploading APK ($([math]::Round((Get-Item $APK_LOCAL).Length / 1MB, 1)) MB)..."
    scp $APK_LOCAL "${VPS_HOST}:${APK_REMOTE}" 2>$null
    Write-OK "APK uploaded to VPS"
} else {
    Write-Step "3/6" "Skipping APK upload"
}

# ── Step 4: Rebuild Frontend ────────────────────────────────
Write-Step "4/6" "Rebuilding frontend container..."
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --no-deps frontend" 2>$null
Write-OK "Frontend rebuilt"

# ── Step 5: Rebuild Backend (if needed) ─────────────────────
Write-Step "5/6" "Checking backend..."
ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build --no-deps backend" 2>$null
Write-OK "Backend checked"

# ── Step 6: Database Sync ──────────────────────────────────
if (-not $SkipDB) {
    Write-Step "6/6" "Syncing database & seeding..."
    ssh $VPS_HOST "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml exec -T backend node prisma/seed.js" 2>$null
    Write-OK "Database seeded"
} else {
    Write-Step "6/6" "Skipping database sync"
}

# ── Status Check ────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  📊 Status Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
ssh $VPS_HOST "docker ps --filter 'name=shohnaat' --format 'table {{.Names}}\t{{.Status}}'" 2>$null

# ── Final Result ────────────────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  🎉 DEPLOY COMPLETE!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 Site:       https://shohnaat.rahimbadsa.me" -ForegroundColor Cyan
Write-Host "  🔌 API:        https://api-shohnaat.rahimbadsa.me" -ForegroundColor Cyan
Write-Host "  📱 APK:        https://shohnaat.rahimbadsa.me/downloads/shohnaat-rider.apk" -ForegroundColor Cyan
Write-Host "  ❤️  Health:     https://api-shohnaat.rahimbadsa.me/health" -ForegroundColor Cyan
Write-Host ""
