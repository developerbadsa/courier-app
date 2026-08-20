@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo   ⚡ Instant Fast Debug APK Build (Testing in Seconds)
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
echo [2/2] Compiling Fast Debug APK...
call %FLUTTER_CMD% build apk --debug --android-skip-build-dependency-validation

if not exist "release-apk" mkdir "release-apk"
if exist "build\app\outputs\flutter-apk\app-debug.apk" (
    copy /y "build\app\outputs\flutter-apk\app-debug.apk" "release-apk\Shohnaat-Logistics-v1.0.0-debug.apk" >nul
)

echo.
if exist "release-apk\Shohnaat-Logistics-v1.0.0-debug.apk" (
    echo ========================================================
    echo ✅ SUCCESS: Instant Debug APK Ready!
    echo ========================================================
    echo Location: %~dp0release-apk\Shohnaat-Logistics-v1.0.0-debug.apk
)
echo.
pause
