@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo   ⚡ Super Fast Release APK Build (Split-per-ABI)
echo   🚀 Size: ~20MB (3x Smaller & Much Faster Build)
echo ========================================================
echo.

set "FLUTTER_CMD=flutter"

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\src\flutter\bin\flutter.bat" (
        set "FLUTTER_CMD=C:\src\flutter\bin\flutter.bat"
    ) else (
        echo [!] Flutter SDK is not found.
        pause
        exit /b 1
    )
)

echo [1/2] Fetching dependencies...
call %FLUTTER_CMD% pub get

echo.
echo [2/2] Compiling Fast Optimized APKs...
call %FLUTTER_CMD% build apk --release --split-per-abi --no-tree-shake-icons --android-skip-build-dependency-validation

if not exist "release-apk" mkdir "release-apk"
if exist "build\app\outputs\flutter-apk\app-arm64-v8a-release.apk" (
    copy /y "build\app\outputs\flutter-apk\app-arm64-v8a-release.apk" "release-apk\Shohnaat-Logistics-v1.0.0-arm64.apk" >nul
)

echo.
if exist "release-apk\Shohnaat-Logistics-v1.0.0-arm64.apk" (
    echo.
    echo   [Auto-Deploy] Copying to web downloads folder...
    set "WEB_DL=..\frontend\public\downloads\shohnaat-rider.apk"
    copy /y "release-apk\Shohnaat-Logistics-v1.0.0-arm64.apk" "!WEB_DL!" >nul 2>&1
    if exist "!WEB_DL!" (
        echo   ✅ APK deployed to web: /downloads/shohnaat-rider.apk
        echo   🌐 Download URL: https://shohnaat.rahimbadsa.me/downloads/shohnaat-rider.apk
    )
    echo ========================================================
    echo ✅ SUCCESS: Fast ARM64 APK Built Successfully!
    echo ========================================================
    echo Location: %~dp0release-apk\Shohnaat-Logistics-v1.0.0-arm64.apk
    echo (Perfect for all modern Android phones: Samsung, Xiaomi, Realme, Vivo, etc.)
) else (
    echo [!] Check build\app\outputs\flutter-apk\
)
echo.
pause
