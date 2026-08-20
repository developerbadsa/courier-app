@echo off
echo ========================================================
echo   📦 Building Shohnaat Logistics Android APK...
echo ========================================================
echo.

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Flutter SDK not found in system PATH!
    echo Please install Flutter SDK to build release APK.
    pause
    exit /b 1
)

echo [1/2] Fetching dependencies...
call flutter pub get

echo [2/2] Building release APK...
call flutter build apk --release

echo.
echo ✅ Build Complete! Your APK is located at:
echo build\app\outputs\flutter-apk\app-release.apk
echo.
pause
