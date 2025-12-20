-- RLS Diagnose und Reparatur für bestellungen Tabelle
-- Führen Sie dieses SQL aus, um das Problem zu diagnostizieren und zu beheben

-- ============================================
-- DIAGNOSE: Prüfen Sie zuerst diese Abfragen
-- ============================================

-- 1. Prüfen ob Tabelle existiert
SELECT 
    tablename,
    schemaname,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

-- 2. Prüfen welche Policies existieren
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'bestellungen';

-- 3. Prüfen ob RLS überhaupt aktiviert ist
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

-- ============================================
-- REPARATUR: Führen Sie diese Schritte aus
-- ============================================

-- Schritt 1: Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "Allow public insert" ON public.bestellungen;
DROP POLICY IF EXISTS "allow_public_insert" ON public.bestellungen;
DROP POLICY IF EXISTS "Allow public insert" ON bestellungen;
DROP POLICY IF EXISTS "allow_public_insert" ON bestellungen;

-- Schritt 2: RLS aktivieren (wichtig!)
ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Schritt 3: Policy für anon (anonyme Benutzer) erstellen
CREATE POLICY "Allow public insert" 
ON public.bestellungen
FOR INSERT
TO anon
WITH CHECK (true);

-- Schritt 4: Policy für authenticated Benutzer (falls nötig)
CREATE POLICY "Allow authenticated insert" 
ON public.bestellungen
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Schritt 5: Policy für service_role (nur zur Sicherheit, sollte eigentlich nicht nötig sein)
CREATE POLICY "Allow service_role insert" 
ON public.bestellungen
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- ÜBERPRÜFUNG: Prüfen Sie erneut
-- ============================================

-- Alle Policies sollten jetzt sichtbar sein
SELECT 
    policyname,
    roles,
    cmd as command
FROM pg_policies 
WHERE tablename = 'bestellungen'
ORDER BY policyname;

-- RLS sollte aktiviert sein (rowsecurity = true)
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

