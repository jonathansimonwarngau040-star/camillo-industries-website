# Bestellungen Manager - Python Programm

Dieses Python-Programm ermöglicht die Verwaltung von Bestellungen aus der Supabase-Datenbank.

## Installation

1. Stellen Sie sicher, dass Python 3.7 oder höher installiert ist.

2. Installieren Sie die benötigten Pakete:
```bash
pip install -r requirements.txt
```

Oder manuell:
```bash
pip install supabase
```

## Konfiguration

Öffnen Sie die Datei `bestellungen_manager.py` und aktualisieren Sie die Supabase-Konfiguration (falls nötig):

```python
SUPABASE_URL = 'https://tqeepddjmgdzdwndyeoj.supabase.co'
SUPABASE_KEY = 'Ihr-Publishable-Key-hier'
```

## Verwendung

Starten Sie das Programm:
```bash
python bestellungen_manager.py
```

## Features

- **Offene Bestellungen** (links, rot): Zeigt alle Bestellungen mit `versendet = false` an, sortiert nach neuesten zuerst
- **Archiv** (rechts, grün): Zeigt alle Bestellungen mit `versendet = true` an
- **Gesamtmenge**: Zeigt die Summe aller `quantity`-Werte im Archiv
- **Als versendet markieren**: Wählen Sie eine offene Bestellung aus und klicken Sie auf den Button, um sie als versendet zu markieren
- **Auto-Refresh**: Das Programm aktualisiert die Daten automatisch alle 30 Sekunden

## Tkinter

Das Programm verwendet Tkinter für die GUI, welches standardmäßig mit Python installiert ist.

## Troubleshooting

### "ModuleNotFoundError: No module named 'supabase'"
Lösen Sie dies durch:
```bash
pip install supabase
```

### Supabase-Verbindungsfehler
- Überprüfen Sie, ob URL und Key in `bestellungen_manager.py` korrekt sind
- Stellen Sie sicher, dass die Tabelle `bestellungen` in Supabase existiert
- Überprüfen Sie, ob RLS (Row Level Security) korrekt konfiguriert ist

