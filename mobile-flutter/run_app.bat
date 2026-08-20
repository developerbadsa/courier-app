@echo off
echo ========================================================
echo   🚀 Starting Shohnaat Logistics Flutter Mobile App...
echo ========================================================
echo.

:: Check if flutter command is available
where flutter >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Flutter SDK was not found in your system PATH!
    echo.
    echo Please install Flutter SDK from https://docs.flutter.dev/get-started/install/windows
    echo or add your existing Flutter bin directory to your Environment Variables PATH.
    echo.
    echo Example PATH: C:\src\flutter\bin
    echo.
    pause
    exit /b 1
)

echo [1/3] Fetching Flutter dependencies...
call flutter pub get

echo.
echo [2/3] Checking connected devices / Chrome browser...
call flutter devices

echo.
echo [3/3] Launching App...
echo - To run in Chrome browser: flutter run -d chrome
echo - To run on Android Emulator/Device: flutter run
echo.
call flutter run

pause
