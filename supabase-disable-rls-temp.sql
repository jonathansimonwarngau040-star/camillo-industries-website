-- TEMPORÄRE Lösung: RLS deaktivieren (NUR für Testzwecke!)
-- WARNUNG: Dies deaktiviert die Sicherheit. Verwenden Sie dies nur zum Testen!
-- Für Produktion sollten Sie die RLS Policy korrekt konfigurieren.

-- RLS deaktivieren
ALTER TABLE IF EXISTS public.bestellungen DISABLE ROW LEVEL SECURITY;

-- Überprüfung
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

-- Wenn rowsecurity = false, ist RLS deaktiviert

