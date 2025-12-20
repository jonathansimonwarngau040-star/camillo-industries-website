# Lösung für RLS Policy Fehler

## Problem
Der Fehler `new row violates row-level security policy for table "bestellungen"` tritt weiterhin auf, obwohl die Policy erstellt wurde.

## Lösung Schritt für Schritt

### Option 1: Vollständige Diagnose und Reparatur (EMPFOHLEN)

1. Öffnen Sie das Supabase Dashboard
2. Gehen Sie zu **SQL Editor** → **New Query**
3. Öffnen Sie die Datei `supabase-diagnose-rls.sql`
4. Kopieren Sie den gesamten Inhalt
5. Fügen Sie ihn in den SQL Editor ein
6. Klicken Sie auf **Run**

Dieses Script:
- Prüft, ob die Tabelle existiert
- Zeigt alle vorhandenen Policies an
- Löscht alle bestehenden Policies
- Erstellt neue Policies für anon, authenticated und service_role
- Zeigt die Ergebnisse an

### Option 2: Temporär RLS deaktivieren (NUR ZUM TESTEN!)

**WARNUNG:** Dies deaktiviert die Sicherheit! Verwenden Sie dies nur zum Testen!

1. Öffnen Sie `supabase-disable-rls-temp.sql`
2. Kopieren Sie den Inhalt
3. Führen Sie ihn im SQL Editor aus

**Wichtig:** Wenn das funktioniert, wissen wir, dass es ein RLS-Problem ist. Aktivieren Sie RLS dann wieder und verwenden Sie Option 1.

### Option 3: Manuelle Prüfung im Dashboard

1. Gehen Sie zu **Authentication** → **Policies** (oder **Database** → **Tables** → **bestellungen**)
2. Prüfen Sie, ob Policies für die Tabelle `bestellungen` existieren
3. Falls keine Policy existiert:
   - Klicken Sie auf "New Policy"
   - Policy name: "Allow public insert"
   - Allowed operation: INSERT
   - Target roles: anon
   - USING expression: (leer lassen)
   - WITH CHECK expression: `true`

### Häufige Probleme

#### Problem 1: Policy existiert nicht
**Lösung:** Führen Sie `supabase-diagnose-rls.sql` aus

#### Problem 2: RLS ist nicht aktiviert
**Lösung:** 
```sql
ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;
```

#### Problem 3: Policy ist für falschen Benutzer erstellt
**Lösung:** Die Policy muss für `anon` erstellt sein (nicht `authenticated` oder `public`)

#### Problem 4: Schema-Problem
**Lösung:** Stellen Sie sicher, dass Sie `public.bestellungen` verwenden (nicht nur `bestellungen`)

## Nach der Reparatur testen

1. Öffnen Sie die Website
2. Versuchen Sie eine Bestellung abzuschließen
3. Der Fehler sollte nicht mehr auftreten

## Überprüfung

Führen Sie diese Abfrage aus, um zu prüfen, ob alles korrekt ist:

```sql
-- Prüfen ob RLS aktiviert ist
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'bestellungen';

-- Prüfen welche Policies existieren
SELECT policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'bestellungen';
```

**Erwartetes Ergebnis:**
- `rowsecurity` sollte `true` sein
- Es sollte mindestens eine Policy mit `roles = {anon}` und `cmd = INSERT` existieren

