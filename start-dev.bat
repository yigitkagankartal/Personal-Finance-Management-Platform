@echo off
title Finance App - Full Stack Starter

echo ================================
echo  Starting Finance Backend...
echo ================================
start cmd /k "cd finance-backend && mvn spring-boot:run"

timeout /t 3 >nul

echo ================================
echo  Starting Frontend (Vite)...
echo ================================
start cmd /k "cd frontend && npm run dev"

echo.
echo All systems running! 🚀
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:5173
echo.
pause
