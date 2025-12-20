-- NUR DIESES STATEMENT AUSFÜHREN - Schritt 1: Tabelle erstellen
-- Wenn das erfolgreich ist, können Sie die anderen Schritte ausführen

CREATE TABLE IF NOT EXISTS public.bestellungen (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    street TEXT NOT NULL,
    zip TEXT NOT NULL,
    city TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.19,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_transaction_id TEXT,
    order_status TEXT DEFAULT 'pending',
    versendet BOOLEAN DEFAULT FALSE NOT NULL
);

