@echo off
echo.
echo ===========================================
echo   Shohnaat Logistics - 1-Click Deploy
echo ===========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0deploy.ps1" %*
pause
