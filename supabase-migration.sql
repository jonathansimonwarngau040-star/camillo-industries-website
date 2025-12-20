-- Supabase Migration: Bestellungstabelle erstellen
-- Führen Sie dieses SQL in Ihrem Supabase SQL Editor aus (unter SQL Editor > New Query)

-- Tabelle für Bestellungen erstellen
CREATE TABLE IF NOT EXISTS bestellungen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Kundendaten
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    street TEXT NOT NULL,
    zip TEXT NOT NULL,
    city TEXT NOT NULL,
    
    -- Bestelldaten
    color TEXT NOT NULL CHECK (color IN ('weiß', 'schwarz', 'orange', 'blau', 'gelb', 'grau', 'grün', 'pink', 'rot')),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.19,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Zahlungsdaten
    payment_method TEXT NOT NULL, -- 'paypal' oder 'creditcard'
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    payment_transaction_id TEXT, -- ID von PayPal/Stripe
    
    -- Status
    order_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    versendet BOOLEAN DEFAULT FALSE NOT NULL -- 'true' wenn Bestellung versendet wurde, 'false' wenn noch nicht versendet
);

-- Index für Email-Suchen erstellen
CREATE INDEX IF NOT EXISTS idx_bestellungen_email ON bestellungen(email);

-- Index für created_at erstellen
CREATE INDEX IF NOT EXISTS idx_bestellungen_created_at ON bestellungen(created_at DESC);

-- Index für "versendet"-Feld erstellen (für schnelle Filterung nach nicht versendeten Bestellungen)
CREATE INDEX IF NOT EXISTS idx_bestellungen_versendet ON bestellungen(versendet) WHERE versendet = FALSE;

-- RLS (Row Level Security) aktivieren - erlaubt allen, Bestellungen einzufügen
ALTER TABLE bestellungen ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Bestellungen einfügen (für öffentliche Bestellungen)
CREATE POLICY "Allow public insert" ON bestellungen
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Nur authentifizierte Benutzer können Bestellungen lesen (optional)
-- Wenn Sie nur Admin-Zugriff möchten, entfernen Sie diese Policy
-- CREATE POLICY "Allow authenticated read" ON bestellungen
--     FOR SELECT
--     TO authenticated
--     USING (true);

