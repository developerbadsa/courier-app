@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

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
        echo [!] Flutter SDK is not found at C:\src\flutter.
        pause
        exit /b 1
    )
)

echo [1/2] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get

echo.
echo [2/2] Compiling Release APK (assembleRelease)...
call %FLUTTER_CMD% build apk --release --no-tree-shake-icons --android-skip-build-dependency-validation

if exist "C:\tmp\shohnaat_b\app\outputs\flutter-apk\app-release.apk" (
    if not exist "build\app\outputs\flutter-apk" mkdir "build\app\outputs\flutter-apk"
    if not exist "release-apk" mkdir "release-apk"
    copy /y "C:\tmp\shohnaat_b\app\outputs\flutter-apk\app-release.apk" "build\app\outputs\flutter-apk\app-release.apk" >nul
    copy /y "C:\tmp\shohnaat_b\app\outputs\flutter-apk\app-release.apk" "release-apk\Shohnaat-Logistics-v1.0.0-release.apk" >nul
)

echo.
if exist "release-apk\Shohnaat-Logistics-v1.0.0-release.apk" (
    echo ========================================================
    echo ✅ SUCCESS: Release APK Built Successfully!
    echo ========================================================
    echo Location: %~dp0release-apk\Shohnaat-Logistics-v1.0.0-release.apk
    echo.
    echo You can transfer this APK to any Android phone via USB/WhatsApp/Drive to install!
) else if exist "build\app\outputs\flutter-apk\app-release.apk" (
    echo ========================================================
    echo ✅ SUCCESS: Release APK Built Successfully!
    echo ========================================================
    echo Location: %~dp0build\app\outputs\flutter-apk\app-release.apk
    echo.
) else (
    echo [!] Build completed. Check release-apk\ or build\app\outputs\flutter-apk\
)
echo.
pause
