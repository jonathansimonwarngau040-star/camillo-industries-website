# Supabase Integration - Schnellstart

Diese Website ist jetzt mit Supabase verbunden. Alle Bestellungen werden automatisch in Ihrer Supabase-Datenbank gespeichert.

## Schnelleinrichtung (3 Schritte)

### 1. Supabase konfigurieren

1. Erstellen Sie ein Projekt auf [supabase.com](https://supabase.com)
2. Öffnen Sie `supabase-migration.sql` und führen Sie den SQL-Code im Supabase SQL Editor aus
3. Kopieren Sie Ihre Supabase URL (oben auf der API-Seite) und den Publishable key (aus "Publishable key" Sektion) aus Settings → API

### 2. config.js ausfüllen

Öffnen Sie `config.js` und ersetzen Sie:
```javascript
const SUPABASE_CONFIG = {
    url: 'Ihre Supabase URL hier', // z.B. https://xxxxx.supabase.co (oben auf der API-Seite)
    anonKey: 'Ihr Publishable key hier'   // Aus "Publishable key" Sektion, beginnt mit sb_publishable_...
};
```

### 3. Testen

1. Öffnen Sie die Website
2. Gehen Sie zum Checkout
3. Geben Sie eine Testbestellung auf
4. Überprüfen Sie in Supabase → Table Editor → bestellungen, ob die Bestellung gespeichert wurde

## Wichtige Hinweise

- **Zahlungen**: Die aktuelle Implementierung speichert Bestellungen direkt in Supabase. Für echte Zahlungsabwicklung benötigen Sie zusätzlich PayPal oder Stripe (siehe SETUP.md).

- **Sicherheit**: Die Supabase RLS (Row Level Security) ist so konfiguriert, dass jeder Bestellungen einfügen kann. Für Produktionsumgebungen sollten Sie zusätzliche Sicherheitsmaßnahmen implementieren.

- **PayPal/Stripe**: Diese sind optional. Die Website funktioniert auch ohne sie, speichert dann aber Bestellungen ohne echte Zahlungsabwicklung.

## Detaillierte Anleitung

Für vollständige Anweisungen zur Einrichtung von PayPal und Stripe siehe `SETUP.md`.

