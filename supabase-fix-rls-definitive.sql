-- DEFINITIVE Lösung für RLS Policy Problem
-- Führen Sie dieses SQL komplett aus

-- Schritt 1: Alle bestehenden Policies komplett löschen
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bestellungen' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.bestellungen';
    END LOOP;
END $$;

-- Schritt 2: RLS sicherstellen (aktivieren)
ALTER TABLE IF EXISTS public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Schritt 3: Policy für anon erstellen (anonyme Benutzer über Browser)
CREATE POLICY "Allow anon insert" 
ON public.bestellungen
FOR INSERT
TO anon
WITH CHECK (true);

-- Schritt 4: Policy für authenticated erstellen
CREATE POLICY "Allow authenticated insert" 
ON public.bestellungen
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Schritt 5: Policy für public Rolle (zur Sicherheit)
CREATE POLICY "Allow public insert" 
ON public.bestellungen
FOR INSERT
TO public
WITH CHECK (true);

-- Schritt 6: Überprüfung - zeigen Sie alle Policies
SELECT 
    policyname,
    roles,
    cmd as command_type,
    with_check
FROM pg_policies 
WHERE tablename = 'bestellungen' 
AND schemaname = 'public'
ORDER BY policyname;

-- Schritt 7: Überprüfung - RLS Status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

