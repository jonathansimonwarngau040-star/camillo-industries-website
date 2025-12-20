# Fehlerbehebung: "new row violates row-level security policy"

## Problem
Der Fehler `new row violates row-level security policy for table "bestellungen"` bedeutet, dass die RLS (Row Level Security) Policy nicht korrekt konfiguriert ist.

## Lösung

### Schritt 1: RLS Policy reparieren

1. Öffnen Sie das Supabase Dashboard
2. Gehen Sie zu **SQL Editor** → **New Query**
3. Öffnen Sie die Datei `supabase-fix-rls-policy.sql`
4. Kopieren Sie den gesamten Inhalt
5. Fügen Sie ihn in den SQL Editor ein
6. Klicken Sie auf **Run**

### Schritt 2: Überprüfung

Nach der Ausführung sollten Sie eine Tabelle sehen, die die Policy anzeigt. Wenn eine Zeile mit `policyname = "Allow public insert"` angezeigt wird, wurde die Policy erfolgreich erstellt.

### Alternative: Policy manuell überprüfen

Führen Sie diese Abfrage aus, um alle Policies für die `bestellungen` Tabelle zu sehen:

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bestellungen';
```

**Erwartetes Ergebnis:**
- `policyname`: "Allow public insert"
- `roles`: {anon}
- `cmd`: INSERT

### Falls die Policy noch nicht existiert

Falls die obige Abfrage keine Ergebnisse zurückgibt, führen Sie diese Befehle aus:

```sql
-- RLS aktivieren
ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Policy erstellen
CREATE POLICY "Allow public insert" ON public.bestellungen
    FOR INSERT
    TO anon
    WITH CHECK (true);
```

## Überprüfung im Dashboard

1. Gehen Sie zu **Authentication** → **Policies** (oder **Database** → **Tables** → **bestellungen** → **Policies**)
2. Sie sollten die Policy "Allow public insert" für die Tabelle `bestellungen` sehen

## Test

Nach der Reparatur:
1. Versuchen Sie erneut, eine Bestellung über die Website abzuschließen
2. Der Fehler sollte jetzt nicht mehr auftreten

