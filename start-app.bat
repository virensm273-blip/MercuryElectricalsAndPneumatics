@echo off
echo ==========================================
echo       MERCURY APP - STARTUP SCRIPT
echo ==========================================
echo.

echo [1/3] Starting Backend Server...
start "Mercury Backend" cmd /k "cd backend && npm start"

echo.
echo [2/3] Starting Frontend React App...
echo (The browser will open automatically once ready)
start "Mercury Frontend" cmd /k "cd frontend && npm run dev -- --host --open"

echo.
echo [3/3] Generating QR Code for mobile...
start "Mercury QR" cmd /k "cd backend && npm run qr"

echo.
echo ==========================================
echo All services are starting up! 
echo Keep these windows open while using the app.
echo ==========================================
pause
