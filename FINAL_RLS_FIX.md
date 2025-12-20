# FINALE Lösung für RLS Fehler

## Problem
Der Fehler `new row violates row-level security policy for table "bestellungen"` tritt weiterhin auf.

## Schritt-für-Schritt Lösung

### Schritt 1: Prüfen Sie die Policies im Supabase Dashboard

1. Gehen Sie zu **Database** → **Tables** → **bestellungen**
2. Klicken Sie auf den Tab **Policies**
3. Prüfen Sie, ob Policies existieren

### Schritt 2: Führen Sie das definitive SQL Script aus

1. Öffnen Sie `supabase-fix-rls-definitive.sql` im Supabase SQL Editor
2. Kopieren Sie den gesamten Inhalt
3. Führen Sie ihn aus
4. **WICHTIG:** Prüfen Sie die Ausgabe - es sollten 3 Policies erstellt werden

### Schritt 3: Überprüfung

Nach der Ausführung sollten Sie diese Policies sehen:
- `Allow anon insert` - für anon
- `Allow authenticated insert` - für authenticated  
- `Allow public insert` - für public

### Schritt 4: Falls es immer noch nicht funktioniert

#### Option A: RLS temporär deaktivieren (NUR ZUM TESTEN!)

```sql
ALTER TABLE public.bestellungen DISABLE ROW LEVEL SECURITY;
```

**Testen Sie die Website.** Wenn es funktioniert, ist es definitiv ein RLS-Problem.

Dann aktivieren Sie RLS wieder und verwenden Sie Schritt 2.

#### Option B: Prüfen Sie den verwendeten Key

In Ihrer `config.js` verwenden Sie einen JWT-Token (beginnt mit `eyJ...`). Das ist korrekt, aber stellen Sie sicher, dass es wirklich der **Publishable key** ist, nicht der Secret key.

### Schritt 5: Manuelle Policy-Erstellung im Dashboard

Falls SQL nicht funktioniert:

1. Gehen Sie zu **Database** → **Tables** → **bestellungen**
2. Klicken Sie auf **Policies** Tab
3. Klicken Sie auf **New Policy**
4. Wählen Sie **For full customization**
5. Policy name: `Allow anon insert`
6. Allowed operation: `INSERT`
7. Target roles: Wählen Sie `anon`
8. USING expression: (leer lassen)
9. WITH CHECK expression: `true`
10. Klicken Sie auf **Review** und dann **Save policy**

### Schritt 6: Code wurde aktualisiert

Ich habe auch `checkout.js` aktualisiert, um explizit das `public` Schema zu verwenden. Das sollte helfen.

## Nach all diesen Schritten

1. **Löschen Sie den Browser-Cache** (oder testen Sie im Inkognito-Modus)
2. **Laden Sie die Website neu**
3. **Testen Sie eine Bestellung**

Der Fehler sollte jetzt behoben sein!

