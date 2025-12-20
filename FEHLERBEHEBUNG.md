# Fehlerbehebung: "relation bestellungen does not exist"

## Problem
Der Fehler `ERROR: 42P01: relation "bestellungen" does not exist` tritt auf, wenn die Tabelle noch nicht existiert.

## Lösung: Schritt-für-Schritt Migration

Führen Sie die Schritte **nacheinander** im Supabase SQL Editor aus:

### Schritt 1: Tabelle erstellen
1. Öffnen Sie `supabase-migration-step1-only.sql`
2. Kopieren Sie den Inhalt
3. Fügen Sie ihn in den Supabase SQL Editor ein
4. Klicken Sie auf **Run**
5. **WICHTIG:** Überprüfen Sie, ob die Ausführung erfolgreich war (keine Fehlermeldung)

### Schritt 2: Farbvalidierung hinzufügen (optional)
1. Öffnen Sie `supabase-migration-step2-validation.sql`
2. Kopieren und ausführen
3. Überprüfen Sie auf Fehler

### Schritt 3: Indizes erstellen
1. Öffnen Sie `supabase-migration-step3-indices.sql`
2. Kopieren und ausführen
3. Überprüfen Sie auf Fehler

### Schritt 4: RLS aktivieren
1. Öffnen Sie `supabase-migration-step4-rls.sql`
2. Kopieren und ausführen
3. Überprüfen Sie auf Fehler

## Alternative: Alles auf einmal

Wenn Schritt 1 erfolgreich war, können Sie auch `supabase-migration-simple.sql` verwenden, die alle Schritte enthält.

## Überprüfung: Tabelle existiert?

Führen Sie diese Abfrage aus, um zu prüfen, ob die Tabelle existiert:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'bestellungen';
```

Wenn diese Abfrage eine Zeile zurückgibt, existiert die Tabelle bereits.

## Tabelle löschen (falls nötig)

Wenn Sie die Tabelle neu erstellen möchten (ACHTUNG: Alle Daten gehen verloren!):

```sql
DROP TABLE IF EXISTS public.bestellungen CASCADE;
```

Dann führen Sie die Migration erneut aus.

## Im Supabase Dashboard prüfen

1. Gehen Sie zu **Table Editor** im Supabase Dashboard
2. Prüfen Sie, ob die Tabelle `bestellungen` in der Liste erscheint
3. Wenn ja, wurde die Tabelle erfolgreich erstellt

