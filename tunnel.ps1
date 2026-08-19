# ============================================================
# Shohnaat Logistics — VPS Port Forwarding Tunnel to Windows
# ============================================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Connecting VPS Ports to Windows PC..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3001" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5001" -ForegroundColor Green
Write-Host "  Storage:  http://localhost:5002" -ForegroundColor Green
Write-Host "  Database: localhost:5432" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Tunnel is ACTIVE. Keep this window open." -ForegroundColor Yellow

ssh -L 3001:localhost:3001 -L 5001:localhost:5001 -L 5002:localhost:5002 -L 5432:localhost:5432 -N mydev
