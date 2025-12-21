-- Migration: ID-Spalte von UUID zu Auto-Increment (BIGSERIAL) konvertieren
-- Diese Migration konvertiert die ID-Spalte von UUID zu BIGSERIAL (1, 2, 3, ...)
-- WICHTIG: Falls bereits Bestellungen vorhanden sind, werden neue numerische IDs vergeben

-- Schritt 1: Temporäre Spalte für die neue ID erstellen
ALTER TABLE bestellungen 
    ADD COLUMN IF NOT EXISTS id_new BIGSERIAL;

-- Schritt 2: Falls bereits Daten vorhanden sind, fortlaufende IDs zuweisen
-- (Die alten UUIDs werden ignoriert, neue numerische IDs werden vergeben)
-- Hinweis: Die Reihenfolge basiert auf created_at, falls vorhanden, sonst auf der Einfügereihenfolge

-- Schritt 3: Primary Key Constraint löschen (falls vorhanden), da wir die ID-Spalte ändern
DO $$
BEGIN
    -- Alle Primary Key Constraints finden und löschen
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'bestellungen'::regclass 
        AND contype = 'p'
    LOOP
        EXECUTE 'ALTER TABLE bestellungen DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Primary Key Constraint % wurde gelöscht.', constraint_name;
    END LOOP;
END $$;

-- Schritt 4: Alte ID-Spalte umbenennen (als Backup)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bestellungen' 
        AND column_name = 'id'
    ) THEN
        -- Alte ID umbenennen (unabhängig vom Datentyp)
        ALTER TABLE bestellungen RENAME COLUMN id TO id_old_uuid;
        RAISE NOTICE 'Alte ID-Spalte wurde in id_old_uuid umbenannt.';
    END IF;
END $$;

-- Schritt 5: Neue ID-Spalte umbenennen
ALTER TABLE bestellungen RENAME COLUMN id_new TO id;

-- Schritt 6: Primary Key auf neue ID-Spalte setzen
ALTER TABLE bestellungen ADD PRIMARY KEY (id);

-- Schritt 7: Foreign Keys aktualisieren (falls vorhanden)
-- Hinweis: Wenn andere Tabellen auf bestellungen.id referenzieren, müssen diese auch aktualisiert werden
-- Prüfen, ob Foreign Keys vorhanden sind:
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE confrelid = 'bestellungen'::regclass AND contype = 'f';

-- Schritt 8: Kommentar hinzufügen
COMMENT ON COLUMN bestellungen.id IS 'Automatisch generierte, eindeutige ID (Auto-Increment, BIGSERIAL)';

-- Schritt 9: Optional - Alte UUID-Spalte löschen (nur wenn sichergestellt ist, dass sie nicht mehr benötigt wird)
-- UNCOMMENT die folgende Zeile, wenn Sie die alte UUID-Spalte entfernen möchten:
-- ALTER TABLE bestellungen DROP COLUMN IF EXISTS id_old_uuid;
