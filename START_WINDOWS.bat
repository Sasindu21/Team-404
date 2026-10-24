@echo off
setlocal
cd /d "%~dp0"
title SafeRoute Sri Lanka - Local Dev Server
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Please install Node.js 22 LTS from https://nodejs.org/
  pause
  exit /b 1
)
if not exist ".env.local" (
  copy ".env.example" ".env.local" >nul
  echo Created .env.local. Add optional Gemini, ORS, and Supabase settings as needed.
)
if not exist "node_modules" (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
if errorlevel 1 (
  echo ERROR: Port 3000 is already in use. Close the existing server before starting SafeRoute.
  echo This launcher will not silently move the application to a different port.
  pause
  exit /b 1
)
echo.
echo SafeRoute Sri Lanka available at http://localhost:3000
start "" cmd /c "timeout /t 9 /nobreak >nul & start http://localhost:3000"
call npm run dev
pause
