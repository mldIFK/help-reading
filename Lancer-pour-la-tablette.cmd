@echo off
title My English Helper - mode tablette
cd /d "%~dp0"

if not exist "node_modules" (
  echo Premiere utilisation : installation en cours...
  call npm install
)

echo.
echo =========================================================
echo   Mode tablette (HTTPS, necessaire pour le micro)
echo.
echo   1. Note l'adresse "Network" affichee ci-dessous
echo      (exemple : https://192.168.1.20:5173)
echo   2. Tape-la dans le navigateur de la tablette
echo      (meme wifi que ce PC)
echo   3. Accepte l'avertissement de securite
echo      (Parametres avances - Continuer)
echo =========================================================
echo.

call npm run tablette
pause
