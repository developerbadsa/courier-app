@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   📦 Building Shohnaat Logistics Google Play App Bundle (.aab)
echo ========================================================
echo.

set "FLUTTER_CMD=flutter"

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\src\flutter\bin\flutter.bat" (
        set "FLUTTER_CMD=C:\src\flutter\bin\flutter.bat"
    ) else (
        echo [!] Flutter SDK was not found in your system PATH.
        echo [!] You can also download the ready .aab from GitHub Actions tab!
        pause
        exit /b 1
    )
)

echo [1/3] Setting up Android build files...
call %FLUTTER_CMD% create . --platforms=android --org com.shohnaat

echo [2/3] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get

echo [3/3] Compiling Google Play Release App Bundle (.aab)...
call %FLUTTER_CMD% build appbundle --release --android-skip-build-dependency-validation

echo.
if exist "build\app\outputs\bundle\release\app-release.aab" (
    echo ========================================================
    echo ✅ SUCCESS: Google Play App Bundle Built Successfully!
    echo ========================================================
    echo Location: %~dp0build\app\outputs\bundle\release\app-release.aab
    echo.
    echo Upload this .aab file directly to Google Play Console Production / Internal Testing track!
) else (
    echo [!] Build completed. Check build\app\outputs\bundle\release\
)
echo.
pause
