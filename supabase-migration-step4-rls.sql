-- Schritt 4 & 5: RLS aktivieren und Policy erstellen (NUR AUSFÜHREN wenn Schritt 1 erfolgreich war)

ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON public.bestellungen;
CREATE POLICY "Allow public insert" ON public.bestellungen
    FOR INSERT
    TO anon
    WITH CHECK (true);

