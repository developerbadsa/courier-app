@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ========================================================
echo   🌐 Launching Shohnaat Mobile in Chrome (Fast Preview)
echo ========================================================
echo.
echo 💡 TIP: Once Chrome opens, press Ctrl+Shift+M (or F12) 
echo    to toggle Mobile Phone View (iPhone / Galaxy / Pixel)!
echo.
echo ⚡ HOT RELOAD: Press 'r' in this window to reload in 0.5s!
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

echo [1/2] Checking dependencies...
call %FLUTTER_CMD% pub get

echo.
echo [2/2] Launching Fast Chrome Preview (Port 5050)...
call %FLUTTER_CMD% run -d chrome --web-port 5050

pause
