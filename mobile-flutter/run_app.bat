@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   🚀 Starting Shohnaat Logistics Flutter Mobile App
echo ========================================================
echo.

set "FLUTTER_CMD=flutter"

where flutter >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\src\flutter\bin\flutter.bat" (
        set "FLUTTER_CMD=C:\src\flutter\bin\flutter.bat"
    ) else (
        echo [!] Flutter SDK was not found in your system PATH.
        echo.
        echo To setup Flutter automatically, run in PowerShell:
        echo   powershell -ExecutionPolicy Bypass -File install_flutter_windows.ps1
        echo.
        pause
        exit /b 1
    )
)

echo [1/3] Fetching Flutter dependencies...
call %FLUTTER_CMD% pub get

echo.
echo [2/3] Checking connected devices / Chrome browser...
call %FLUTTER_CMD% devices

echo.
echo [3/3] Launching App...
echo - To run in Chrome browser: %FLUTTER_CMD% run -d chrome
echo - To run on Android:        %FLUTTER_CMD% run
echo.
call %FLUTTER_CMD% run

pause
