# ==============================================================================
# 🐦 Shohnaat Logistics — 1-Click Flutter SDK & Java Setup for Windows
# ==============================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   🚀 Installing Prerequisites for Flutter APK Build" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Install Java 17 OpenJDK if not present
if (-not (Get-Command "javac" -ErrorAction SilentlyContinue)) {
    Write-Host "[1/3] Installing Microsoft OpenJDK 17..." -ForegroundColor Yellow
    winget install Microsoft.OpenJDK.17 --silent --accept-source-agreements --accept-package-agreements
} else {
    Write-Host "[1/3] Java JDK already installed." -ForegroundColor Green
}

# 2. Check or install Flutter SDK
$flutterDir = "C:\src\flutter"
if (-not (Test-Path "$flutterDir\bin\flutter.bat")) {
    Write-Host "[2/3] Downloading Flutter SDK Stable to C:\src\flutter..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "C:\src" | Out-Null
    
    $zipPath = "$env:TEMP\flutter_windows.zip"
    $flutterUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.5-stable.zip"
    
    Write-Host "Downloading Flutter zip archive..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $flutterUrl -OutFile $zipPath
    
    Write-Host "Extracting to C:\src\..." -ForegroundColor Gray
    Expand-Archive -Path $zipPath -DestinationPath "C:\src" -Force
    Remove-Item $zipPath -Force
} else {
    Write-Host "[2/3] Flutter SDK already present at $flutterDir" -ForegroundColor Green
}

# 3. Add Flutter to User PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*C:\src\flutter\bin*") {
    Write-Host "[3/3] Adding C:\src\flutter\bin to User PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$userPath;C:\src\flutter\bin", "User")
    $env:Path += ";C:\src\flutter\bin"
} else {
    Write-Host "[3/3] Flutter bin already in User PATH." -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Installation Complete! Verifying flutter doctor..." -ForegroundColor Green
& "C:\src\flutter\bin\flutter.bat" doctor
