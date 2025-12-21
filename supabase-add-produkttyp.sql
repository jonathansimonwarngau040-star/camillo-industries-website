-- Migration: Spalte "produkttyp" zur Tabelle "bestellungen" hinzufügen
-- Diese Migration fügt eine neue Spalte für den Produkttyp hinzu

-- Spalte hinzufügen
ALTER TABLE bestellungen
ADD COLUMN IF NOT EXISTS produkttyp TEXT;

-- Optional: Standardwert für vorhandene Einträge setzen
UPDATE bestellungen
SET produkttyp = 'Eiskratzer'
WHERE produkttyp IS NULL;

-- Optional: Kommentar hinzufügen (PostgreSQL)
COMMENT ON COLUMN bestellungen.produkttyp IS 'Art des Produkts (z.B. Eiskratzer)';

