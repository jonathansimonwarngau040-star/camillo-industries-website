# PayPal Integration Setup

## Schritt 1: PayPal Client ID abrufen

1. **Melden Sie sich bei Ihrem PayPal Business Account an:**
   - Gehen Sie zu https://developer.paypal.com/
   - Loggen Sie sich mit Ihren Business-Account-Daten ein

2. **Dashboard öffnen:**
   - Nach dem Login werden Sie automatisch zum PayPal Developer Dashboard weitergeleitet
   - Falls nicht, klicken Sie oben rechts auf "Dashboard"

3. **Neue App erstellen (falls noch nicht vorhanden):**
   - Klicken Sie auf "Create App" oder "Apps" → "Create App"
   - Geben Sie einen App-Namen ein (z.B. "Camillo Industries Shop")
   - Wählen Sie "Merchant" als Integration Type
   - Klicken Sie auf "Create App"

4. **Client ID kopieren:**
   - Nach der Erstellung sehen Sie Ihre App-Details
   - Kopieren Sie die **Client ID** (nicht die Secret ID!)
   - Es gibt zwei Umgebungen:
     - **Sandbox** - für Tests (empfohlen zum Testen)
     - **Live** - für echte Zahlungen (für Produktion)

## Schritt 2: Client ID in config.js eintragen

Öffnen Sie die Datei `config.js` und ersetzen Sie `YOUR_PAYPAL_CLIENT_ID` mit Ihrer Client ID:

```javascript
const PAYPAL_CONFIG = {
    clientId: 'Ihre-PayPal-Client-ID-hier' // Ihre PayPal Client ID
};
```

**Beispiel:**
```javascript
const PAYPAL_CONFIG = {
    clientId: 'AeA1QIZXiflr1_-dQKr3hYvqXm5dXRxMZxJrEeJqCqDqCqDqCqDqCqDqCqDqCq'
};
```

## Schritt 3: Testen

1. **Sandbox-Test:**
   - Verwenden Sie zunächst die Sandbox Client ID
   - Erstellen Sie Test-Konten in PayPal Sandbox:
     - Gehen Sie zu https://developer.paypal.com/ → "Sandbox" → "Accounts"
     - Erstellen Sie einen Test-Käufer-Account
   - Testen Sie den Checkout-Prozess mit dem Test-Account

2. **Live-Betrieb:**
   - Wenn alles funktioniert, ersetzen Sie die Sandbox Client ID mit der Live Client ID
   - Stellen Sie sicher, dass Ihre Website über HTTPS erreichbar ist (erforderlich für PayPal)

## Wichtige Hinweise

- **HTTPS erforderlich:** PayPal funktioniert nur auf HTTPS-Websites. Stellen Sie sicher, dass Ihre Website SSL-Zertifikat hat.
- **Sandbox vs. Live:** Verwenden Sie Sandbox zum Testen, Live nur für echte Zahlungen.
- **Client ID vs. Secret:** Die Secret ID wird nur für Server-seitige Operationen benötigt. Für die Smart Payment Buttons benötigen Sie nur die Client ID.
- **Währung:** Die Integration ist auf EUR (Euro) eingestellt. Wenn Sie eine andere Währung benötigen, müssen Sie `currency=EUR` im PayPal SDK Script anpassen.

## Unterstützung

Bei Problemen:
- PayPal Developer Dokumentation: https://developer.paypal.com/docs/
- PayPal Support: https://www.paypal.com/de/webapps/mpp/contact

