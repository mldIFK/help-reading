@echo off
title My English Helper
cd /d "%~dp0"

if not exist "node_modules" (
  echo Premiere utilisation : installation en cours...
  call npm install
)

echo.
echo ====================================================
echo   My English Helper demarre...
echo   Une fenetre de navigateur va s'ouvrir.
echo   Laisse cette fenetre noire ouverte pendant l'usage.
echo ====================================================
echo.

start "" http://localhost:5173
call npm run dev
pause
