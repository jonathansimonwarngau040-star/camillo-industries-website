# EmailJS Setup-Anleitung

## Schritt 1: EmailJS Account erstellen

1. Gehen Sie zu [emailjs.com](https://www.emailjs.com)
2. Erstellen Sie ein kostenloses Konto (erlaubt 200 E-Mails pro Monat)
3. Bestätigen Sie Ihre E-Mail-Adresse

## Schritt 2: E-Mail-Service hinzufügen (Zoho)

1. Gehen Sie in Ihr EmailJS Dashboard zu **Email Services**
2. Klicken Sie auf **Add New Service**
3. Wählen Sie **Zoho** aus der Liste

### Zoho-Konfiguration:

1. **Service Name**: Geben Sie einen Namen ein (z.B. "Camillo Industries Zoho")
2. **Zoho E-Mail**: Geben Sie Ihre Zoho E-Mail-Adresse ein (z.B. `info@camillo-industries.de` oder Ihre Zoho-Mail-Adresse)
3. **Zoho Passwort**: Geben Sie das Passwort für Ihr Zoho-Konto ein
   - **Wichtig**: Verwenden Sie das Passwort Ihres Zoho-Kontos, nicht das App-Passwort
   - Falls Sie 2FA aktiviert haben, müssen Sie möglicherweise ein App-Passwort erstellen

4. Klicken Sie auf **Create Service**
5. Kopieren Sie die **Service ID** (z.B. `service_xxxxx`) - Sie benötigen diese später

### Zoho-spezifische Hinweise:

- **Domain-E-Mail**: Wenn Sie eine eigene Domain verwenden (z.B. info@camillo-industries.de), stellen Sie sicher, dass diese in Zoho Mail konfiguriert ist
- **App-Passwort**: Falls Sie 2-Faktor-Authentifizierung aktiviert haben, müssen Sie ein App-Passwort in Ihrem Zoho-Konto erstellen:
  1. Gehen Sie zu [Zoho Account](https://accounts.zoho.com) → **Security** → **App Passwords**
  2. Klicken Sie auf **Generate New Password**
  3. Geben Sie einen Namen ein (z.B. "EmailJS")
  4. Kopieren Sie das generierte App-Passwort
  5. Verwenden Sie dieses App-Passwort (nicht Ihr normales Zoho-Passwort) in EmailJS
- **SMTP-Einstellungen**: EmailJS verwendet automatisch die Zoho SMTP-Einstellungen (smtp.zoho.com)
- **Zoho Mail Setup**: Falls Sie Zoho Mail noch nicht eingerichtet haben:
  - Für kostenlose Zoho-Mail: [zoho.com/mail](https://www.zoho.com/mail/)
  - Für Domain-E-Mail: Zoho Mail für Ihre Domain konfigurieren
- **Testen**: Nach der Konfiguration können Sie in EmailJS einen Test senden, um zu prüfen, ob alles funktioniert

## Schritt 3: E-Mail-Templates erstellen

Gehen Sie zu **Email Templates** und erstellen Sie 3 Templates:

### Template 1: Bestellbestätigung an Kunden

**Template Name:** `order_confirmation_customer`

**Subject:** `Bestellbestätigung - Camillo Industries`

**Content (HTML):**
```html
<p>Hallo {{name}},</p>

<p>vielen Dank für Ihre Bestellung bei Camillo Industries!</p>

<p><strong>Ihre Bestellung:</strong></p>
<ul>
  <li>Produkt: Premium Eiskratzer</li>
  <li>Farbe: {{color}}</li>
  <li>Menge: {{quantity}}</li>
  <li>Gesamtpreis: {{total_price}} €</li>
</ul>

<p><strong>Lieferadresse:</strong><br>
{{street}}<br>
{{zip}} {{city}}</p>

<p>Wir bearbeiten Ihre Bestellung schnellstmöglich und senden Ihnen eine Versandbestätigung, sobald das Paket auf den Weg gebracht wurde.</p>

<p>Mit freundlichen Grüßen<br>
Camillo Industries</p>
```

**To Email:** `{{customer_email}}`

**From Name:** `Camillo Industries`

**Reply To:** `info@camillo-industries.de`

### Template 2: Benachrichtigung an Sie (jonathansimonwarngau040@gmail.com)

**Template Name:** `order_notification_admin`

**Subject:** `Neue Bestellung eingegangen`

**Content (HTML):**
```html
<p>Neue Bestellung erhalten!</p>

<p><strong>Kundendaten:</strong></p>
<ul>
  <li>Name: {{name}}</li>
  <li>E-Mail: {{customer_email}}</li>
  <li>Straße: {{street}}</li>
  <li>PLZ: {{zip}}</li>
  <li>Ort: {{city}}</li>
</ul>

<p><strong>Bestelldaten:</strong></p>
<ul>
  <li>Farbe: {{color}}</li>
  <li>Menge: {{quantity}}</li>
  <li>Gesamtpreis: {{total_price}} €</li>
  <li>Zahlungsmethode: {{payment_method}}</li>
</ul>
```

**To Email:** `jonathansimonwarngau040@gmail.com`

**From Name:** `Camillo Industries Shop`

### Template 3: Versandbestätigung an Kunden

**Template Name:** `shipping_confirmation_customer`

**Subject:** `Versandbestätigung - Ihre Bestellung ist unterwegs`

**Content (HTML):**
```html
<p>Hallo {{name}},</p>

<p>gute Nachrichten! Ihre Bestellung wurde versandt.</p>

<p><strong>Versanddetails:</strong></p>
<ul>
  <li>Bestellung: Premium Eiskratzer - {{color}}</li>
  <li>Menge: {{quantity}}</li>
  <li>Gesendet an: {{street}}, {{zip}} {{city}}</li>
</ul>

<p>Ihr Paket sollte in den nächsten Tagen bei Ihnen ankommen.</p>

<p>Mit freundlichen Grüßen<br>
Camillo Industries</p>
```

**To Email:** `{{customer_email}}`

**From Name:** `Camillo Industries`

## Schritt 4: Public Key abrufen

1. Gehen Sie zu **Account** → **General**
2. Kopieren Sie Ihren **Public Key** (z.B. `xxxxx`)

## Schritt 5: Konfiguration in config.js

Fügen Sie die EmailJS-Konfiguration zu `config.js` hinzu:

```javascript
// EmailJS Konfiguration
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY_HIER', // Ihr Public Key von EmailJS
    serviceId: 'YOUR_SERVICE_ID_HIER'  // Ihre Service ID (z.B. service_xxxxx)
};
```

## Schritt 6: Code-Integration

Der Code wurde bereits in `checkout.js` integriert, um E-Mails beim Bestellabschluss zu senden.

Für das Python-Programm wurde die EmailJS REST API verwendet, um E-Mails zu senden, wenn "versendet" auf true gesetzt wird.

## Testen

1. Geben Sie eine Testbestellung auf der Website auf
2. Prüfen Sie, ob die E-Mails versendet wurden:
   - Bestätigung an den Kunden
   - Benachrichtigung an jonathansimonwarngau040@gmail.com
3. Markieren Sie eine Bestellung als versendet im Python-Programm
4. Prüfen Sie, ob die Versandbestätigung an den Kunden gesendet wurde

## Wichtige Hinweise

- Im kostenlosen Plan sind 200 E-Mails pro Monat enthalten
- Für mehr E-Mails benötigen Sie einen kostenpflichtigen Plan
- Stellen Sie sicher, dass die E-Mail-Adresse, die Sie für den Service verwenden, korrekt ist
- Testen Sie zuerst mit Test-E-Mails

### Zoho-spezifische Hinweise:

- **2FA (Zwei-Faktor-Authentifizierung)**: Wenn Sie 2FA aktiviert haben, müssen Sie ein App-Passwort verwenden, nicht Ihr normales Zoho-Passwort
- **App-Passwort erstellen**: 
  1. Gehen Sie zu [accounts.zoho.com](https://accounts.zoho.com)
  2. Navigieren Sie zu **Security** → **App Passwords**
  3. Erstellen Sie ein neues App-Passwort speziell für EmailJS
  4. Verwenden Sie dieses App-Passwort in EmailJS (nicht Ihr normales Passwort)
- **Domain-E-Mail**: Wenn Sie eine eigene Domain verwenden, stellen Sie sicher, dass:
  - Die Domain in Zoho Mail konfiguriert ist
  - Die DNS-Einstellungen korrekt sind (MX-Records)
  - Die E-Mail-Adresse aktiv ist und E-Mails senden kann
- **Test-E-Mail**: Nach der Konfiguration sollten Sie eine Test-E-Mail in EmailJS senden, um sicherzustellen, dass alles funktioniert

