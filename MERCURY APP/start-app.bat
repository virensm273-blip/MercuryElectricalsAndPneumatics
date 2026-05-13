@echo off
echo Starting Mercury App...

echo Starting Backend Server...
start cmd /k "cd backend && npm start"

echo.
echo Starting Frontend React App...
start cmd /k "cd frontend && npm run dev -- --host"

echo.
echo Generating QR Code for mobile access...
start cmd /k "cd backend && npm run qr"

echo All services are starting up in separate windows!
pause
