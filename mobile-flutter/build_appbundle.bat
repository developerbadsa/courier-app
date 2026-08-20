@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo   📦 Building Google Play Store App Bundle (.aab)
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

echo [1/3] Cleaning previous build cache...
call %FLUTTER_CMD% clean

echo.
echo [2/3] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get

echo.
echo [3/3] Compiling Play Store Release App Bundle (bundleRelease)...
call %FLUTTER_CMD% build appbundle --release --no-tree-shake-icons --android-skip-build-dependency-validation

echo.
if exist "build\app\outputs\bundle\release\app-release.aab" (
    echo ========================================================
    echo ✅ SUCCESS: Google Play App Bundle Built Successfully!
    echo ========================================================
    echo Location: %~dp0build\app\outputs\bundle\release\app-release.aab
    echo.
    echo Upload this .aab file directly to Google Play Console!
) else (
    echo [!] Build finished. Check build\app\outputs\bundle\release\
)
echo.
pause
