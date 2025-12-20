# Schritt-für-Schritt Anleitung: Bezahlfunktion einrichten

## Übersicht
Diese Anleitung beschreibt, wie Sie PayPal und Kreditkarten-Zahlungen auf Ihrer Website einrichten.

---

## Option 1: PayPal Integration

### Schritt 1: PayPal Business Account erstellen
1. Gehen Sie zu [paypal.com/de/business](https://www.paypal.com/de/business)
2. Klicken Sie auf "Konto erstellen"
3. Wählen Sie "Business-Konto"
4. Füllen Sie die erforderlichen Informationen aus
5. Bestätigen Sie Ihre E-Mail-Adresse

### Schritt 2: PayPal Developer Account
1. Gehen Sie zu [developer.paypal.com](https://developer.paypal.com)
2. Melden Sie sich mit Ihrem PayPal Business Account an
3. Navigieren Sie zu "Dashboard" → "Apps & Credentials"

### Schritt 3: App erstellen
1. Klicken Sie auf "Create App"
2. Geben Sie einen Namen ein (z.B. "Camillo Industries Shop")
3. Wählen Sie "Merchant" als App-Typ
4. Klicken Sie auf "Create App"

### Schritt 4: API-Anmeldedaten kopieren
1. Nach der Erstellung sehen Sie:
   - **Client ID**
   - **Secret Key**
2. Kopieren Sie beide Werte sicher (sie werden nur einmal angezeigt)

### Schritt 5: PayPal SDK in die Website integrieren

Fügen Sie in die Datei `checkout.html` vor dem schließenden `</head>` Tag ein:

```html
<!-- PayPal SDK -->
<script src="https://www.paypal.com/sdk/js?client-id=IHR_CLIENT_ID_HIER&currency=EUR"></script>
```

Ersetzen Sie `IHR_CLIENT_ID_HIER` mit Ihrer tatsächlichen Client ID.

### Schritt 6: PayPal Button implementieren

Ersetzen Sie im Checkout-Formular den PayPal-Radio-Button-Bereich mit einem echten PayPal-Button:

In `checkout.html` im Bereich nach `<div class="payment-methods">`:

```html
<div id="paypal-button-container"></div>
```

Fügen Sie am Ende der checkout.html vor dem schließenden `</body>` Tag folgendes JavaScript ein:

```javascript
// PayPal Button Rendering
if (document.getElementById('paypal')) {
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: '9.99',
                        currency_code: 'EUR'
                    },
                    description: 'Premium Eiskratzer'
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                // Bestellung erfolgreich
                alert('Zahlung erfolgreich! ' + details.payer.name.given_name);
                // Weiterleitung zur Danke-Seite
                window.location.href = 'danke.html';
            });
        },
        onError: function(err) {
            console.error('PayPal Fehler:', err);
            alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
        }
    }).render('#paypal-button-container');
}
```

### Schritt 7: Sandbox-Testing (Testumgebung)
- PayPal stellt automatisch eine Sandbox-Umgebung bereit
- Verwenden Sie Test-Konten zum Testen
- Wechseln Sie später zu "Live" Modus für echte Zahlungen

---

## Option 2: Stripe für Kreditkarten (Empfohlen)

Stripe ist eine der sichersten und einfachsten Lösungen für Kreditkarten-Zahlungen.

### Schritt 1: Stripe Account erstellen
1. Gehen Sie zu [stripe.com](https://stripe.com)
2. Klicken Sie auf "Sign up"
3. Füllen Sie Ihre Geschäftsinformationen aus
4. Verifizieren Sie Ihre E-Mail-Adresse

### Schritt 2: Stripe Dashboard öffnen
1. Melden Sie sich an bei [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigieren Sie zu "Developers" → "API keys"
3. Sie finden hier:
   - **Publishable key** (öffentlich)
   - **Secret key** (geheim, nicht preisgeben!)

### Schritt 3: Stripe.js einbinden

Fügen Sie in `checkout.html` vor dem schließenden `</head>` Tag ein:

```html
<!-- Stripe.js -->
<script src="https://js.stripe.com/v3/"></script>
```

### Schritt 4: Backend-Server einrichten

Stripe benötigt einen Backend-Server für sichere Zahlungen. Sie haben zwei Optionen:

#### Option A: Node.js Backend (Einfachste Lösung)

Erstellen Sie eine Datei `server.js`:

```javascript
const express = require('express');
const stripe = require('stripe')('IHR_SECRET_KEY_HIER');
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.post('/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 999, // 9.99 EUR in Cent
            currency: 'eur',
            description: 'Premium Eiskratzer'
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});
```

Installation:
```bash
npm install express stripe
```

#### Option B: PHP Backend

Erstellen Sie `create-payment-intent.php`:

```php
<?php
require_once 'vendor/autoload.php';

\Stripe\Stripe::setApiKey('IHR_SECRET_KEY_HIER');

header('Content-Type: application/json');

try {
    $paymentIntent = \Stripe\PaymentIntent::create([
        'amount' => 999, // 9.99 EUR in Cent
        'currency' => 'eur',
        'description' => 'Premium Eiskratzer'
    ]);

    echo json_encode(['clientSecret' => $paymentIntent->client_secret]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

### Schritt 5: Stripe Elements im Frontend

Fügen Sie in `checkout.html` im Kreditkarten-Bereich ein:

```html
<div id="card-element">
    <!-- Stripe Elements werden hier eingefügt -->
</div>
<div id="card-errors" role="alert"></div>
```

Fügen Sie JavaScript vor dem schließenden `</body>` Tag ein:

```javascript
// Stripe Initialisierung
const stripe = Stripe('IHR_PUBLISHABLE_KEY_HIER');

// Card Element erstellen
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Fehlerbehandlung
cardElement.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// Formular absenden
const form = document.getElementById('checkoutForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    if (document.getElementById('creditcard').checked) {
        // Payment Intent erstellen (vom Backend)
        const {clientSecret} = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }).then(r => r.json());
        
        // Zahlung bestätigen
        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement
            }
        });
        
        if (error) {
            alert('Zahlung fehlgeschlagen: ' + error.message);
        } else if (paymentIntent.status === 'succeeded') {
            window.location.href = 'danke.html';
        }
    }
});
```

### Schritt 6: Test-Kreditkarten

Im Testmodus verwenden Sie:
- **Kartennummer**: 4242 4242 4242 4242
- **Ablaufdatum**: Beliebige zukünftige Daten
- **CVC**: Beliebige 3 Ziffern

---

## Option 3: Mollie (Alternative für Deutschland)

Mollie ist eine deutsche Zahlungslösung, die PayPal, Kreditkarten und viele andere Methoden unterstützt.

### Schritt 1: Mollie Account
1. Gehen Sie zu [mollie.com](https://www.mollie.com)
2. Erstellen Sie ein kostenloses Konto
3. Verifizieren Sie Ihr Geschäft

### Schritt 2: API-Key erhalten
1. Dashboard → "Developers" → "API keys"
2. Kopieren Sie Ihren API-Key

### Schritt 3: Integration
- Detaillierte Anleitung: [docs.mollie.com](https://docs.mollie.com)
- Mollie bietet SDKs für verschiedene Programmiersprachen

---

## Sicherheitshinweise

1. **Niemals Secret Keys im Frontend-Code speichern!**
   - Secret Keys gehören immer auf den Server
   - Nur Publishable Keys dürfen im Frontend verwendet werden

2. **HTTPS verwenden**
   - Alle Zahlungsseiten müssen über HTTPS erreichbar sein
   - Kostenlose SSL-Zertifikate: Let's Encrypt

3. **Webhook einrichten**
   - Für automatische Bestätigung von Zahlungen
   - PayPal/Stripe senden Bestätigungen an Ihre Server-URL

4. **Daten validieren**
   - Alle Eingaben auf dem Server validieren
   - Niemals Frontend-Validierung als Sicherheitsmaßnahme betrachten

---

## Empfehlung

Für den Start empfehle ich **Stripe**, da es:
- Einfach zu integrieren ist
- Sehr gute Dokumentation hat
- Sicher ist
- Kreditkarten und weitere Zahlungsmethoden unterstützt
- Gute Test-Tools bietet

---

## Nächste Schritte

1. Wählen Sie eine Zahlungsmethode
2. Richten Sie den entsprechenden Service ein
3. Testen Sie ausgiebig im Testmodus
4. Gehen Sie live, wenn alles funktioniert
5. Überwachen Sie Ihre Transaktionen regelmäßig

Bei Fragen wenden Sie sich an den Support des jeweiligen Anbieters.


