-- Migration: ID-Spalte als Auto-Increment (BIGSERIAL) konfigurieren
-- Diese Migration stellt sicher, dass die ID automatisch mit jeder Bestellung steigt

-- Schritt 1: Prüfen, ob die ID-Spalte bereits als Serial/BigSerial konfiguriert ist
-- Falls die ID bereits existiert aber nicht als Serial ist, müssen wir sie ändern

-- Option A: Falls die Tabelle noch keine Daten hat oder ID-Spalte noch nicht existiert
-- (Diese Befehle werden nur ausgeführt, wenn die Spalte noch nicht als Serial konfiguriert ist)

-- Zuerst: Prüfen, welche Datentyp die ID-Spalte hat
-- In PostgreSQL/Supabase sollte die ID normalerweise bereits als BIGSERIAL erstellt werden,
-- aber falls nicht, stellen wir es sicher

DO $$
BEGIN
    -- Prüfen, ob die ID-Spalte bereits eine Sequenz verwendet
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_attrdef ad
        JOIN pg_attribute a ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
        JOIN pg_class c ON a.attrelid = c.oid
        WHERE c.relname = 'bestellungen' 
        AND a.attname = 'id'
        AND pg_get_expr(ad.adbin, ad.adrelid) LIKE 'nextval%'
    ) THEN
        -- ID-Spalte als BIGSERIAL konfigurieren (nur wenn noch nicht so konfiguriert)
        
        -- 1. Sequenz erstellen (falls noch nicht vorhanden)
        IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'bestellungen_id_seq') THEN
            CREATE SEQUENCE bestellungen_id_seq;
        END IF;
        
        -- 2. Aktuellen Max-Wert der ID ermitteln und Sequenz darauf setzen
        PERFORM setval('bestellungen_id_seq', COALESCE((SELECT MAX(id) FROM bestellungen), 0), true);
        
        -- 3. ID-Spalte auf BIGSERIAL umstellen (nur wenn sie nicht bereits BIGINT ist)
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'bestellungen' 
            AND column_name = 'id'
            AND data_type != 'bigint'
        ) THEN
            ALTER TABLE bestellungen 
            ALTER COLUMN id TYPE BIGINT;
        END IF;
        
        -- 4. Standardwert auf Sequenz setzen
        ALTER TABLE bestellungen 
        ALTER COLUMN id SET DEFAULT nextval('bestellungen_id_seq');
        
        -- 5. Sequenz der Spalte zuordnen
        ALTER SEQUENCE bestellungen_id_seq OWNED BY bestellungen.id;
        
        RAISE NOTICE 'ID-Spalte wurde erfolgreich als Auto-Increment konfiguriert.';
    ELSE
        RAISE NOTICE 'ID-Spalte ist bereits als Auto-Increment konfiguriert.';
    END IF;
END $$;

-- Schritt 2: Sicherstellen, dass die ID-Spalte als Primary Key markiert ist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'bestellungen'::regclass 
        AND conname LIKE '%_pkey'
        AND contype = 'p'
    ) THEN
        ALTER TABLE bestellungen ADD PRIMARY KEY (id);
        RAISE NOTICE 'Primary Key Constraint wurde hinzugefügt.';
    ELSE
        RAISE NOTICE 'Primary Key Constraint existiert bereits.';
    END IF;
END $$;

-- Schritt 3: Optional - Kommentar hinzufügen
COMMENT ON COLUMN bestellungen.id IS 'Automatisch generierte, eindeutige ID (Auto-Increment)';

