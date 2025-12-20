-- Umfassende RLS Policy Reparatur für bestellungen Tabelle
-- Führen Sie dieses SQL aus, um alle RLS Probleme zu beheben

-- Schritt 1: Alle bestehenden Policies löschen (sauberer Start)
DROP POLICY IF EXISTS "Allow public insert" ON public.bestellungen;
DROP POLICY IF EXISTS "allow_public_insert" ON public.bestellungen;
DROP POLICY IF EXISTS "Allow public insert" ON bestellungen;
DROP POLICY IF EXISTS "allow_public_insert" ON bestellungen;

-- Schritt 2: RLS aktivieren (falls noch nicht aktiviert)
ALTER TABLE IF EXISTS public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Schritt 3: Policy mit verschiedenen Ansätzen erstellen
-- Ansatz 1: Standard Policy für anon
CREATE POLICY IF NOT EXISTS "Allow public insert" 
ON public.bestellungen
FOR INSERT
TO anon
WITH CHECK (true);

-- Ansatz 2: Zusätzliche Policy für authenticated (falls benötigt)
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" 
ON public.bestellungen
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Schritt 4: Überprüfung - zeigt alle Policies für bestellungen
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
WHERE tablename = 'bestellungen'
ORDER BY policyname;

-- Schritt 5: Überprüfung ob RLS aktiviert ist
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bestellungen';

