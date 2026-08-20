@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   📦 Building Shohnaat Logistics Android Release APK
echo ========================================================
echo.

set "FLUTTER_CMD=flutter"

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\src\flutter\bin\flutter.bat" (
        set "FLUTTER_CMD=C:\src\flutter\bin\flutter.bat"
    ) else (
        echo [!] Flutter SDK is not found in PATH.
        echo [!] You can build the APK in 2 ways:
        echo     1. Via GitHub Actions (Cloud Builder): Push to git and download APK from Actions tab.
        echo     2. Local Windows: Run powershell -ExecutionPolicy Bypass -File install_flutter_windows.ps1
        echo.
        pause
        exit /b 1
    )
)

echo [1/3] Setting up Android build files...
call %FLUTTER_CMD% create . --platforms=android --org com.shohnaat

echo [2/3] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get

echo [3/3] Compiling Release APK...
call %FLUTTER_CMD% build apk --release --android-skip-build-dependency-validation

echo.
if exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo ========================================================
    echo ✅ SUCCESS: Release APK Built Successfully!
    echo ========================================================
    echo Location: %~dp0build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo You can transfer this APK to any Android phone via USB/WhatsApp/Drive to install!
) else (
    echo [!] Build completed. Check build\app\outputs\flutter-apk\
)
echo.
pause
