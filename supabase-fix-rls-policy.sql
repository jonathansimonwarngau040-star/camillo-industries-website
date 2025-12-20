-- RLS Policy Reparatur für bestellungen Tabelle
-- Führen Sie dieses SQL aus, um die RLS Policy zu reparieren/erstellen

-- Schritt 1: Alle bestehenden Policies löschen (sauberer Start)
DROP POLICY IF EXISTS "Allow public insert" ON public.bestellungen;
DROP POLICY IF EXISTS "allow_public_insert" ON public.bestellungen;
DROP POLICY IF EXISTS "Allow public insert" ON bestellungen;

-- Schritt 2: RLS aktivieren (wichtig!)
ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Schritt 3: Policy für anon (anonyme Benutzer) erstellen
CREATE POLICY "Allow public insert" ON public.bestellungen
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Schritt 4: Zusätzliche Policy für authenticated (falls nötig)
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON public.bestellungen
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Schritt 4: Überprüfen - diese Abfrage sollte die Policy anzeigen
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

