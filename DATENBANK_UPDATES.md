# Datenbank-Updates

## Neue Felder

### 1. `versendet` (Boolean)
- **Typ**: Boolean (TRUE/FALSE)
- **Standardwert**: FALSE
- **Beschreibung**: Gibt an, ob die Bestellung bereits versendet wurde
- **Verwendung**: Setzen Sie dieses Feld auf TRUE, wenn Sie die Bestellung versandt haben

### 2. `color` (Text mit Validierung)
- **Typ**: TEXT mit CHECK Constraint
- **Erlaubte Werte**: 
  - weiß
  - schwarz
  - orange
  - blau
  - gelb
  - grau
  - grün
  - pink
  - rot
- **Beschreibung**: Speichert die gewählte Farbe des Eiskratzers

## Migration ausführen

### Für neue Installationen (Tabelle existiert noch NICHT)
**WICHTIG:** Wenn Sie die Fehlermeldung `relation "bestellungen" does not exist` erhalten, verwenden Sie diese Datei:

Führen Sie `supabase-migration.sql` im Supabase SQL Editor aus. Diese Datei erstellt die komplette Tabelle mit allen Feldern inklusive `versendet` und Farbvalidierung.

### Für bestehende Installationen (Tabelle existiert bereits)
Führen Sie `supabase-migration-update.sql` im Supabase SQL Editor aus, um die neuen Felder (`versendet` und Farbvalidierung) zu einer bereits existierenden Tabelle hinzuzufügen.

## "Versendet"-Status aktualisieren

### Option 1: Über Supabase Dashboard
1. Gehen Sie zu **Table Editor** → **bestellungen**
2. Klicken Sie auf die Zeile der Bestellung
3. Ändern Sie das Feld `versendet` von `false` zu `true`
4. Speichern Sie die Änderung

### Option 2: Über SQL
```sql
-- Einzelne Bestellung als versendet markieren
UPDATE bestellungen 
SET versendet = TRUE 
WHERE id = 'BESTELLUNG_ID_HIER';

-- Alle Bestellungen einer bestimmten Person als versendet markieren
UPDATE bestellungen 
SET versendet = TRUE 
WHERE email = 'kunde@example.com';

-- Alle Bestellungen eines bestimmten Datums als versendet markieren
UPDATE bestellungen 
SET versendet = TRUE 
WHERE DATE(created_at) = '2024-01-15';
```

### Option 3: Nicht versendete Bestellungen anzeigen
```sql
-- Alle noch nicht versendeten Bestellungen anzeigen
SELECT * FROM bestellungen 
WHERE versendet = FALSE 
ORDER BY created_at ASC;
```

## Index für Performance

Ein Index wurde erstellt, um Abfragen nach nicht versendeten Bestellungen zu beschleunigen:
- `idx_bestellungen_versendet` - für schnelle Filterung nach `versendet = FALSE`

