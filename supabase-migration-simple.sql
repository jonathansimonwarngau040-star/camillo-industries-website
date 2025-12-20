-- Supabase Migration: Bestellungstabelle erstellen (Schritt-für-Schritt Version)
-- Führen Sie diese Statements NACH EINANDER aus, falls es Probleme gibt

-- Schritt 1: Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.bestellungen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Kundendaten
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    street TEXT NOT NULL,
    zip TEXT NOT NULL,
    city TEXT NOT NULL,
    
    -- Bestelldaten
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.19,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Zahlungsdaten
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_transaction_id TEXT,
    
    -- Status
    order_status TEXT DEFAULT 'pending',
    versendet BOOLEAN DEFAULT FALSE NOT NULL
);

-- Schritt 2: Farbvalidierung hinzufügen (falls Schritt 1 erfolgreich war)
ALTER TABLE public.bestellungen 
ADD CONSTRAINT bestellungen_color_check 
CHECK (color IN ('weiß', 'schwarz', 'orange', 'blau', 'gelb', 'grau', 'grün', 'pink', 'rot'));

-- Schritt 3: Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_bestellungen_email ON public.bestellungen(email);
CREATE INDEX IF NOT EXISTS idx_bestellungen_created_at ON public.bestellungen(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bestellungen_versendet ON public.bestellungen(versendet) WHERE versendet = FALSE;

-- Schritt 4: RLS aktivieren
ALTER TABLE public.bestellungen ENABLE ROW LEVEL SECURITY;

-- Schritt 5: Policy erstellen (für öffentliche Bestellungen)
DROP POLICY IF EXISTS "Allow public insert" ON public.bestellungen;
CREATE POLICY "Allow public insert" ON public.bestellungen
    FOR INSERT
    TO anon
    WITH CHECK (true);

