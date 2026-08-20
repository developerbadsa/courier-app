@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo   [Shohnaat] Building Release APK
echo ========================================================
echo.

:: ── Detect Flutter ──────────────────────────────────────
set "FLUTTER_CMD=flutter"
where flutter >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\src\flutter\bin\flutter.bat" (
        set "FLUTTER_CMD=C:\src\flutter\bin\flutter.bat"
    ) else (
        echo [ERROR] Flutter SDK not found. Install from https://flutter.dev
        pause
        exit /b 1
    )
)

:: ── Detect SDK Manager ──────────────────────────────────
set "SDKMANAGER=%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat"
if not exist "%SDKMANAGER%" (
    echo [WARN] sdkmanager not found at default path, skipping SDK pre-install.
    set "SDKMANAGER="
)

:: ── Kill stale Gradle daemons (prevents file-lock issues) ──
echo [0/4] Stopping stale Gradle daemons...
if exist "android\gradlew.bat" (
    call "android\gradlew.bat" --stop >nul 2>&1
)
echo.

:: ── Pre-install Android SDK Platform 37 (permission_handler requires it) ──
echo [1/4] Ensuring Android SDK Platform 37 is installed...
if defined SDKMANAGER (
    call "%SDKMANAGER%" "platforms;android-37" >nul 2>&1
    if %errorlevel% neq 0 (
        echo [WARN] Could not auto-install SDK 37 via sdkmanager. Trying flutter...
        call %FLUTTER_CMD% doctor --android-licenses >nul 2>&1
    )
) else (
    echo [INFO] sdkmanager not available, SDK 37 must be installed manually.
)
echo.

:: ── Clean old build artifacts ──────────────────────────
echo [2/4] Cleaning old build artifacts...
if exist "release-apk\Shohnaat-Logistics-v1.0.0-release.apk" (
    del /f /q "release-apk\Shohnaat-Logistics-v1.0.0-release.apk" >nul 2>&1
)
call %FLUTTER_CMD% clean >nul 2>&1
echo.

:: ── Fetch dependencies ──────────────────────────────────
echo [3/4] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] flutter pub get failed with exit code %errorlevel%.
    pause
    exit /b 1
)
echo.

:: ── Build release APK ──────────────────────────────────
echo [4/4] Compiling Release APK...
echo.
call %FLUTTER_CMD% build apk --release --no-tree-shake-icons --android-skip-build-dependency-validation
set "BUILD_EXIT_CODE=%errorlevel%"
echo.

:: ── Locate the APK (could be in build/ or C:\tmp\shohnaat_b\) ──
set "APK_SOURCE="
set "APK_DEST=release-apk\Shohnaat-Logistics-v1.0.0-release.apk"

if exist "build\app\outputs\flutter-apk\app-release.apk" (
    set "APK_SOURCE=build\app\outputs\flutter-apk\app-release.apk"
) else if exist "C:\tmp\shohnaat_b\app\outputs\flutter-apk\app-release.apk" (
    set "APK_SOURCE=C:\tmp\shohnaat_b\app\outputs\flutter-apk\app-release.apk"
)

:: ── Report result ──────────────────────────────────────
echo ========================================================
if %BUILD_EXIT_CODE% equ 0 if defined APK_SOURCE (
    if not exist "release-apk" mkdir "release-apk"
    copy /y "!APK_SOURCE!" "%APK_DEST%" >nul
    for %%A in ("%APK_DEST%") do set "APK_SIZE=%%~zA"
    set /a "APK_MB=!APK_SIZE! / 1048576"
    echo   SUCCESS: Release APK Built
    echo ========================================================
    echo.
    echo   File: %~dp0%APK_DEST%
    echo   Size: !APK_MB! MB
    echo.
    echo   Transfer this APK to your Android phone to install!
) else (
    echo   FAILED: Build did not produce an APK.
    echo ========================================================
    echo.
    echo   Build exit code: %BUILD_EXIT_CODE%
    echo   Check the errors above and fix them before retrying.
)
echo ========================================================
echo.
pause
