-- Supabase Migration Update: "Versendet"-Feld hinzufügen und Farbvalidierung
-- Führen Sie dieses SQL in Ihrem Supabase SQL Editor aus, FALLS die Tabelle bereits existiert
-- Wenn die Tabelle noch nicht existiert, verwenden Sie stattdessen supabase-migration.sql

-- "Versendet"-Feld hinzufügen (falls noch nicht vorhanden)
ALTER TABLE bestellungen 
ADD COLUMN IF NOT EXISTS versendet BOOLEAN DEFAULT FALSE NOT NULL;

-- Farbvalidierung hinzufügen (optional, aber empfohlen für Datenintegrität)
-- Falls bereits ein CHECK Constraint existiert, wird dieser Befehl fehlschlagen - das ist in Ordnung
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'bestellungen_color_check'
    ) THEN
        ALTER TABLE bestellungen
        ADD CONSTRAINT bestellungen_color_check 
        CHECK (color IN ('weiß', 'schwarz', 'orange', 'blau', 'gelb', 'grau', 'grün', 'pink', 'rot'));
    END IF;
END $$;

-- Index für "versendet"-Feld erstellen (für schnelle Filterung)
CREATE INDEX IF NOT EXISTS idx_bestellungen_versendet ON bestellungen(versendet) WHERE versendet = FALSE;

-- Kommentar für das Feld hinzufügen
COMMENT ON COLUMN bestellungen.versendet IS 'Gibt an, ob die Bestellung bereits versendet wurde (true) oder noch nicht (false)';

