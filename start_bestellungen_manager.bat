@echo off
chcp 65001 >nul
title Bestellungen Manager - Camillo Industries

echo ========================================
echo  Bestellungen Manager - Camillo Industries
echo ========================================
echo.

REM Prüfen ob Python installiert ist
python --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Python ist nicht installiert oder nicht im PATH!
    echo Bitte installieren Sie Python von https://www.python.org/
    pause
    exit /b 1
)

echo Python gefunden!
echo.

REM Prüfen ob requirements.txt existiert
if exist requirements.txt (
    echo Installiere/Überprüfe benötigte Pakete...
    python -m pip install -q --upgrade pip
    python -m pip install -q -r requirements.txt
    if errorlevel 1 (
        echo WARNUNG: Fehler beim Installieren der Pakete!
        echo Versuche trotzdem das Programm zu starten...
        echo.
    ) else (
        echo Pakete erfolgreich installiert!
        echo.
    )
) else (
    echo WARNUNG: requirements.txt nicht gefunden!
    echo Installiere Supabase-Paket manuell...
    python -m pip install -q supabase
    echo.
)

REM Starte das Programm
echo Starte Bestellungen Manager...
echo.
python bestellungen_manager.py

if errorlevel 1 (
    echo.
    echo FEHLER: Das Programm wurde mit einem Fehler beendet!
    pause
    exit /b 1
)

pause

