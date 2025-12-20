# Einrichtungsanleitung: Supabase und Zahlungsintegration

Diese Anleitung erklärt, wie Sie die Supabase-Integration und Zahlungsabwicklung für die Website einrichten.

## Schritt 1: Supabase einrichten

### 1.1 Supabase-Account erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein kostenloses Konto oder melden Sie sich an
3. Erstellen Sie ein neues Projekt

### 1.2 Datenbanktabelle erstellen
1. Gehen Sie in Ihrem Supabase Dashboard zu **SQL Editor**
2. Klicken Sie auf **New Query**
3. Öffnen Sie die Datei `supabase-migration.sql` aus diesem Projekt
4. Kopieren Sie den gesamten SQL-Inhalt
5. Fügen Sie ihn in den SQL Editor ein und klicken Sie auf **Run**

Dies erstellt die Tabelle `bestellungen` für Ihre Bestellungen.

### 1.3 API-Schlüssel abrufen
1. Gehen Sie in Ihrem Supabase Dashboard zu **Settings** → **API**
2. Kopieren Sie die folgenden Werte:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`) - finden Sie oben auf der API-Seite
   - **Publishable key** (unter "Publishable key" → der Key mit "default" Name) - das ist der öffentliche Schlüssel für Frontend-Code
   
**WICHTIG:** Verwenden Sie NICHT den "Secret key" - dieser ist nur für Backend/Server!

### 1.4 Konfiguration aktualisieren
1. Öffnen Sie die Datei `config.js`
2. Ersetzen Sie `YOUR_SUPABASE_URL` mit Ihrer Project URL
3. Ersetzen Sie `YOUR_SUPABASE_ANON_KEY` mit Ihrem anon/public key

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co', // Ihre Supabase URL hier (oben auf der API-Seite)
    anonKey: 'sb_publishable_1N8ucC_7z6_JkV4027n_zA_-kKFu...' // Ihr Publishable key hier (aus "Publishable key" Sektion)
};
```

## Schritt 2: PayPal einrichten (Optional)

Wenn Sie PayPal-Zahlungen aktivieren möchten:

### 2.1 PayPal Business Account
1. Gehen Sie zu [paypal.com/de/business](https://www.paypal.com/de/business)
2. Erstellen Sie ein Business-Konto
3. Bestätigen Sie Ihre E-Mail-Adresse

### 2.2 PayPal Developer Account
1. Gehen Sie zu [developer.paypal.com](https://developer.paypal.com)
2. Melden Sie sich mit Ihrem PayPal Business Account an
3. Gehen Sie zu **Dashboard** → **Apps & Credentials**
4. Klicken Sie auf **Create App**
5. Geben Sie einen Namen ein (z.B. "Camillo Industries Shop")
6. Wählen Sie **Merchant** als App-Typ
7. Kopieren Sie die **Client ID**

### 2.3 PayPal SDK aktivieren
1. Öffnen Sie `checkout.html`
2. Finden Sie die Zeile:
   ```html
   <!-- <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=EUR"></script> -->
   ```
3. Entfernen Sie die Kommentarzeichen (`<!--` und `-->`)
4. Ersetzen Sie `YOUR_PAYPAL_CLIENT_ID` mit Ihrer PayPal Client ID

### 2.4 PayPal in config.js konfigurieren
1. Öffnen Sie `config.js`
2. Ersetzen Sie `YOUR_PAYPAL_CLIENT_ID` mit Ihrer PayPal Client ID

```javascript
const PAYPAL_CONFIG = {
    clientId: 'AeA1QIZXiflr1_-d-...' // Ihre PayPal Client ID hier
};
```

**Hinweis:** Für eine vollständige PayPal-Integration benötigen Sie auch ein Backend. Die aktuelle Implementierung speichert Bestellungen direkt in Supabase.

## Schritt 3: Stripe einrichten (Optional - für Kreditkarten)

Wenn Sie Stripe für direkte Kreditkartenzahlungen verwenden möchten:

### 3.1 Stripe Account erstellen
1. Gehen Sie zu [stripe.com](https://stripe.com)
2. Erstellen Sie ein kostenloses Konto
3. Verifizieren Sie Ihr Geschäft

### 3.2 API-Schlüssel abrufen
1. Gehen Sie in Ihrem Stripe Dashboard zu **Developers** → **API keys**
2. Kopieren Sie den **Publishable key** (beginnend mit `pk_`)

### 3.3 Stripe SDK aktivieren
1. Öffnen Sie `checkout.html`
2. Finden Sie die Zeile:
   ```html
   <!-- <script src="https://js.stripe.com/v3/"></script> -->
   ```
3. Entfernen Sie die Kommentarzeichen

### 3.4 Stripe in config.js konfigurieren
1. Öffnen Sie `config.js`
2. Ersetzen Sie `YOUR_STRIPE_PUBLISHABLE_KEY` mit Ihrem Stripe Publishable Key

```javascript
const STRIPE_CONFIG = {
    publishableKey: 'pk_test_...' // Ihr Stripe Publishable Key hier
};
```

**Wichtig:** Stripe benötigt ein Backend für Payment Intents. Die aktuelle Implementierung speichert Bestellungen direkt in Supabase. Für echte Kreditkartenzahlungen sollten Sie Stripe Elements und ein Backend einrichten.

## Schritt 4: Testen

1. Öffnen Sie die Website in Ihrem Browser
2. Gehen Sie zum Checkout
3. Füllen Sie das Bestellformular aus
4. Wählen Sie eine Zahlungsmethode
5. Klicken Sie auf "Bestellung abschließen"
6. Die Bestellung sollte in Ihrer Supabase-Datenbank gespeichert werden

### Bestellungen in Supabase anzeigen
1. Gehen Sie in Ihrem Supabase Dashboard zu **Table Editor**
2. Wählen Sie die Tabelle `bestellungen`
3. Sie sollten alle Bestellungen sehen

## Fehlerbehebung

### "Supabase Client nicht initialisiert"
- Überprüfen Sie, ob `config.js` korrekt ausgefüllt ist
- Stellen Sie sicher, dass die Supabase SDK korrekt geladen wird
- Überprüfen Sie die Browser-Konsole auf Fehler

### "Fehler beim Speichern der Bestellung"
- Überprüfen Sie, ob die Tabelle `bestellungen` in Supabase erstellt wurde
- Überprüfen Sie die RLS (Row Level Security) Policies
- Stellen Sie sicher, dass die Policy "Allow public insert" aktiviert ist

### Zahlungen funktionieren nicht
- Die aktuelle Implementierung speichert Bestellungen direkt in Supabase
- Für echte Zahlungsabwicklung benötigen Sie ein Backend
- PayPal und Stripe sind optional und müssen separat eingerichtet werden

## Nächste Schritte

Für eine vollständige Zahlungsintegration sollten Sie:
1. Ein Backend einrichten (z.B. mit Supabase Edge Functions)
2. PayPal Orders API vollständig integrieren
3. Stripe Payment Intents mit Elements integrieren
4. Webhooks für Zahlungsbestätigungen einrichten

