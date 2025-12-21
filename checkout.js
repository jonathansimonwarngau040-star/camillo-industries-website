// Checkout-Logik mit Supabase und Zahlungsintegration

// Supabase Client initialisieren
let supabaseClient = null;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    initializeCheckoutPage();
    initializePaymentMethods();
    // EmailJS wird nicht mehr verwendet - Zoho Mail API wird direkt verwendet
});

// Supabase initialisieren
function initializeSupabase() {
    if (typeof SUPABASE_CONFIG === 'undefined' || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
        console.error('Supabase-Konfiguration fehlt! Bitte füllen Sie config.js aus.');
        return;
    }

    // Supabase Client erstellen (wenn Supabase SDK geladen ist)
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            },
            db: {
                schema: 'public'
            }
        });
        console.log('Supabase Client initialisiert:', supabaseClient);
    } else {
        console.error('Supabase SDK nicht geladen!');
    }
}

// Checkout-Seite initialisieren
function initializeCheckoutPage() {
    // Load selected color from localStorage
    const selectedColor = localStorage.getItem('selectedColor') || 'orange';
    const selectedImage = localStorage.getItem('selectedImage') || 'orange.png';
    
    if (selectedImage) {
        document.getElementById('summaryImage').src = selectedImage;
    }
    
    // Update color text
    const colorNames = {
        'orange': 'Orange',
        'blau': 'Blau',
        'gelb': 'Gelb',
        'grau': 'Grau',
        'grün': 'Grün',
        'pink': 'Pink',
        'rot': 'Rot',
        'schwarz': 'Schwarz',
        'weiß': 'Weiß'
    };
    document.getElementById('summaryColor').textContent = 'Farbe: ' + colorNames[selectedColor];

    // Update summary quantities and prices
    const quantity = parseInt(localStorage.getItem('quantity')) || 1;
    const unitPrice = 9.99;
    const shippingCost = 4.19;
    const subtotal = unitPrice * quantity;
    const total = subtotal + shippingCost;

    document.getElementById('summaryQuantity').textContent = 'Menge: ' + quantity;
    document.getElementById('summaryUnitPrice').textContent = unitPrice.toFixed(2).replace('.', ',') + ' €';
    document.getElementById('summarySubtotal').textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
    document.getElementById('summaryTotal').textContent = total.toFixed(2).replace('.', ',') + ' €';

    // Credit card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Card expiry formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
}

// PayPal Button Instance
let paypalButtonsInstance = null;

// Zahlungsmethoden initialisieren
function initializePaymentMethods() {
    const paypalRadio = document.getElementById('paypal');
    const creditCardRadio = document.getElementById('creditcard');
    const creditCardFields = document.getElementById('creditCardFields');
    const checkoutForm = document.getElementById('checkoutForm');
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    const standardSubmitButton = document.getElementById('standardSubmitButton');

    // Payment method toggle
    paypalRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardFields.style.display = 'none';
            standardSubmitButton.style.display = 'none';
            paypalButtonContainer.style.display = 'block';
            // PayPal SDK laden, wenn noch nicht geladen
            if (!window.paypal) {
                loadPayPalSDK();
            } else {
                // PayPal Buttons rendern, wenn SDK bereits geladen
                renderPayPalButtons();
            }
        }
    });

    creditCardRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardFields.style.display = 'block';
            paypalButtonContainer.style.display = 'none';
            standardSubmitButton.style.display = 'block';
        }
    });

    // Initial PayPal Buttons laden, wenn PayPal als Standard gewählt ist
    if (paypalRadio.checked) {
        // PayPal Container anzeigen
        paypalButtonContainer.style.display = 'block';
        standardSubmitButton.style.display = 'none';
        loadPayPalSDK();
    } else {
        // PayPal Container verstecken, wenn nicht gewählt
        paypalButtonContainer.style.display = 'none';
    }

    // Form submission (nur für Kreditkarte/Überweisung, PayPal hat eigenen Button)
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(checkoutForm);
        const paymentMethod = formData.get('payment');
        
        // Wenn PayPal gewählt ist, sollte der PayPal-Button verwendet werden
        if (paymentMethod === 'paypal') {
            alert('Bitte verwenden Sie den PayPal-Button, um mit PayPal zu bezahlen.');
            return;
        }
        
        // Validierung
        if (!validateForm(formData, paymentMethod)) {
            return;
        }

        // Bestelldaten sammeln
        const orderData = collectOrderData(formData);

        // Zahlungsabwicklung basierend auf gewählter Methode
        try {
            if (paymentMethod === 'creditcard') {
                await processCreditCardPayment(orderData);
            }
        } catch (error) {
            console.error('Zahlungsfehler:', error);
            alert('Ein Fehler ist aufgetreten: ' + error.message);
        }
    });
}

// Formular validieren
function validateForm(formData, paymentMethod) {
    const name = formData.get('name');
    const email = formData.get('email');
    const street = formData.get('street');
    const zip = formData.get('zip');
    const city = formData.get('city');

    if (!name || !email || !street || !zip || !city) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return false;
    }

    // Email-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        return false;
    }

    // Kreditkartenvalidierung (falls Kreditkarte gewählt)
    if (paymentMethod === 'creditcard') {
        // Für echte Kreditkartenzahlungen sollten wir Stripe verwenden
        // Hier nur Basis-Validierung
        const cardNumber = formData.get('cardNumber');
        const cardExpiry = formData.get('cardExpiry');
        const cardCVC = formData.get('cardCVC');

        if (!cardNumber || !cardExpiry || !cardCVC) {
            alert('Bitte füllen Sie alle Kreditkarteninformationen aus.');
            return false;
        }
    }

    return true;
}

// Bestelldaten sammeln
function collectOrderData(formData) {
    const quantity = parseInt(localStorage.getItem('quantity')) || 1;
    const unitPrice = 9.99;
    const shippingCost = 4.19;
    const subtotal = unitPrice * quantity;
    const totalPrice = subtotal + shippingCost;

    return {
        name: formData.get('name'),
        email: formData.get('email'),
        street: formData.get('street'),
        zip: formData.get('zip'),
        city: formData.get('city'),
        color: localStorage.getItem('selectedColor') || 'orange',
        produkttyp: localStorage.getItem('produkttyp') || 'Eiskratzer', // Produkttyp aus localStorage oder Standard
        quantity: quantity,
        unitPrice: unitPrice,
        shippingCost: shippingCost,
        totalPrice: totalPrice,
        paymentMethod: formData.get('payment')
    };
}

// PayPal SDK laden
function loadPayPalSDK() {
    console.log('loadPayPalSDK aufgerufen');
    
    // Prüfen ob PayPal Client ID konfiguriert ist
    if (typeof PAYPAL_CONFIG === 'undefined' || !PAYPAL_CONFIG.clientId || PAYPAL_CONFIG.clientId === 'YOUR_PAYPAL_CLIENT_ID') {
        console.warn('PayPal Client ID nicht konfiguriert. Bitte fügen Sie Ihre Client ID in config.js hinzu.');
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = '<p style="color: #d32f2f;">PayPal ist nicht konfiguriert. Bitte wenden Sie sich an den Administrator.</p>';
        }
        const submitButton = document.getElementById('standardSubmitButton');
        if (submitButton) {
            submitButton.style.display = 'block';
        }
        return;
    }

    console.log('PayPal Client ID gefunden:', PAYPAL_CONFIG.clientId.substring(0, 20) + '...');

    // Prüfen ob SDK bereits geladen wurde
    if (window.paypal && typeof window.paypal.Buttons === 'function') {
        console.log('PayPal SDK bereits vollständig geladen, rendere Buttons...');
        renderPayPalButtons();
        return;
    } else if (window.paypal) {
        console.log('PayPal SDK geladen, aber Buttons API noch nicht verfügbar, warte...');
        // Warte bis Buttons API verfügbar ist
        const checkInterval = setInterval(function() {
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
                clearInterval(checkInterval);
                console.log('PayPal Buttons API jetzt verfügbar');
                renderPayPalButtons();
            }
        }, 100);
        
        // Timeout nach 5 Sekunden
        setTimeout(function() {
            clearInterval(checkInterval);
            if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
                console.error('PayPal Buttons API nach 5 Sekunden immer noch nicht verfügbar');
                const container = document.getElementById('paypal-button-container');
                if (container) {
                    container.innerHTML = '<p style="color: #d32f2f;">Fehler beim Laden von PayPal. Bitte laden Sie die Seite neu.</p>';
                }
            }
        }, 5000);
        return;
    }

    // SDK laden
    console.log('Lade PayPal SDK...');
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=EUR&locale=de_DE`;
    script.async = true;
    script.onload = function() {
        console.log('✅ PayPal SDK Script geladen');
        // Warte kurz, bis das SDK vollständig initialisiert ist
        const checkReady = setInterval(function() {
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
                clearInterval(checkReady);
                console.log('✅ PayPal SDK vollständig initialisiert, Buttons API verfügbar');
                renderPayPalButtons();
            }
        }, 50);
        
        // Timeout nach 5 Sekunden
        setTimeout(function() {
            clearInterval(checkReady);
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
                console.log('✅ PayPal SDK initialisiert (nach Timeout-Check)');
                renderPayPalButtons();
            } else {
                console.error('❌ PayPal SDK nicht vollständig initialisiert nach 5 Sekunden');
                const container = document.getElementById('paypal-button-container');
                if (container) {
                    container.innerHTML = '<p style="color: #d32f2f;">Fehler beim Initialisieren von PayPal. Bitte laden Sie die Seite neu.</p>';
                }
            }
        }, 5000);
    };
    script.onerror = function() {
        console.error('❌ Fehler beim Laden des PayPal SDK');
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = '<p style="color: #d32f2f;">Fehler beim Laden von PayPal. Bitte versuchen Sie es später erneut.</p>';
        }
        const submitButton = document.getElementById('standardSubmitButton');
        if (submitButton) {
            submitButton.style.display = 'block';
        }
    };
    document.head.appendChild(script);
}

// PayPal Smart Payment Buttons rendern
function renderPayPalButtons() {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    
    // Prüfen ob PayPal SDK vollständig geladen ist
    if (!window.paypal) {
        console.error('PayPal SDK nicht verfügbar');
        return;
    }
    
    // Prüfen ob paypal.Buttons verfügbar ist
    if (typeof window.paypal.Buttons !== 'function') {
        console.warn('paypal.Buttons noch nicht verfügbar, warte...');
        // Versuche es nach kurzer Zeit erneut
        setTimeout(function() {
            renderPayPalButtons();
        }, 100);
        return;
    }

    console.log('PayPal SDK vollständig geladen, Buttons API verfügbar');

    // Container leeren (wichtig: vor dem Rendern)
    paypalButtonContainer.innerHTML = '';
    
    // Falls bereits eine Instanz existiert, sollte sie nicht mehr verwendet werden
    paypalButtonsInstance = null;

    // Bestelldaten für PayPal berechnen
    const quantity = parseInt(localStorage.getItem('quantity')) || 1;
    const unitPrice = 9.99;
    const shippingCost = 4.19;
    const subtotal = unitPrice * quantity;
    const totalPrice = subtotal + shippingCost;

    console.log('Erstelle PayPal Buttons Konfiguration...');
    
    const buttonsConfig = {
        style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal'
        },
        onClick: function(data, actions) {
            console.log('PayPal Button geklickt!', data);
            // Erlaube den Klick - Validierung passiert in createOrder
            return true;
        },
        createOrder: function(data, actions) {
            console.log('PayPal createOrder aufgerufen');
            console.log('Bestelldaten - Menge:', quantity, 'Gesamtpreis:', totalPrice.toFixed(2));
            
            // Order erstellen (Formular-Validierung erfolgt in onApprove, bevor die Bestellung gespeichert wird)
            return actions.order.create({
                purchase_units: [{
                    description: 'Premium Eiskratzer - Camillo Industries',
                    amount: {
                        currency_code: 'EUR',
                        value: totalPrice.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: subtotal.toFixed(2)
                            },
                            shipping: {
                                currency_code: 'EUR',
                                value: shippingCost.toFixed(2)
                            }
                        }
                    },
                    items: [{
                        name: 'Premium Eiskratzer',
                        description: `Farbe: ${getColorName(localStorage.getItem('selectedColor') || 'orange')}, Menge: ${quantity}`,
                        quantity: quantity.toString(),
                        unit_amount: {
                            currency_code: 'EUR',
                            value: unitPrice.toFixed(2)
                        }
                    }]
                }],
                application_context: {
                    shipping_preference: 'NO_SHIPPING' // Adresse bereits im Formular erfasst
                }
            }).then(function(orderId) {
                console.log('PayPal Order erstellt:', orderId);
                return orderId;
            }).catch(function(error) {
                console.error('Fehler beim Erstellen der PayPal Order:', error);
                alert('Fehler beim Erstellen der Bestellung. Bitte versuchen Sie es erneut.');
                throw error;
            });
        },
        onApprove: async function(data, actions) {
            console.log('PayPal onApprove aufgerufen, Order ID:', data.orderID);
            try {
                // Formular validieren, bevor Zahlung verarbeitet wird
                const formData = new FormData(document.getElementById('checkoutForm'));
                const name = formData.get('name');
                const email = formData.get('email');
                const street = formData.get('street');
                const zip = formData.get('zip');
                const city = formData.get('city');

                if (!name || !email || !street || !zip || !city) {
                    alert('Bitte füllen Sie alle Pflichtfelder aus. Die Zahlung wurde abgebrochen.');
                    // Zahlung abbrechen - PayPal wird den User zurück zur Seite bringen
                    throw new Error('Formular nicht vollständig ausgefüllt');
                }

                // Email-Validierung
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Bitte geben Sie eine gültige E-Mail-Adresse ein. Die Zahlung wurde abgebrochen.');
                    throw new Error('Ungültige E-Mail-Adresse');
                }

                // Order Details abrufen
                console.log('Capturing PayPal Order...');
                const orderDetails = await actions.order.capture();
                console.log('✅ PayPal Zahlung erfolgreich:', orderDetails);

                // Bestelldaten sammeln
                const orderData = collectOrderData(formData);

                // Transaction ID aus PayPal Response extrahieren
                const transactionId = orderDetails.purchase_units[0].payments.captures[0].id;

                // Bestellung speichern mit PayPal Transaction ID
                await saveOrderToSupabase(orderData, 'paypal', transactionId, 'completed');
            } catch (error) {
                console.error('Fehler bei PayPal-Zahlung:', error);
                alert('Es gab einen Fehler bei der Zahlungsabwicklung. Bitte versuchen Sie es erneut.');
            }
        },
        onError: function(err) {
            console.error('❌ PayPal Fehler:', err);
            console.error('Fehler-Details:', {
                message: err.message,
                name: err.name,
                stack: err.stack
            });
            alert('Es gab einen Fehler mit PayPal: ' + (err.message || 'Unbekannter Fehler') + '. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsmethode.');
        },
        onCancel: function(data) {
            console.log('PayPal Zahlung abgebrochen:', data);
            // Benutzer kann erneut versuchen oder andere Zahlungsmethode wählen
        }
    };
    
    console.log('Rufe paypal.Buttons() auf...');
    console.log('paypal.Buttons Typ:', typeof window.paypal.Buttons);
    
    // Finale Prüfung bevor Buttons erstellt werden
    if (typeof window.paypal.Buttons !== 'function') {
        console.error('❌ paypal.Buttons ist keine Funktion! Verfügbare PayPal Properties:', Object.keys(window.paypal || {}));
        paypalButtonContainer.innerHTML = '<p style="color: #d32f2f;">PayPal SDK Fehler: Buttons API nicht verfügbar. Bitte laden Sie die Seite neu.</p>';
        const submitButton = document.getElementById('standardSubmitButton');
        if (submitButton) {
            submitButton.style.display = 'block';
        }
        return;
    }
    
    const buttons = window.paypal.Buttons(buttonsConfig);

    // Buttons rendern und Instanz speichern
    try {
        console.log('Rendere PayPal Buttons in Container...');
        paypalButtonsInstance = buttons;
        const renderResult = buttons.render('#paypal-button-container');
        console.log('✅ PayPal Buttons erfolgreich gerendert');
        
        // Prüfen ob Buttons tatsächlich gerendert wurden
        setTimeout(function() {
            const buttonElements = paypalButtonContainer.querySelectorAll('[data-paypal-button]');
            if (buttonElements.length === 0) {
                console.warn('⚠️ PayPal Buttons wurden möglicherweise nicht gerendert - keine Button-Elemente gefunden');
            } else {
                console.log('✅ PayPal Button-Elemente gefunden:', buttonElements.length);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Fehler beim Rendern der PayPal Buttons:', error);
        paypalButtonContainer.innerHTML = '<p style="color: #d32f2f;">Fehler beim Anzeigen des PayPal-Buttons. Bitte laden Sie die Seite neu.</p>';
        const submitButton = document.getElementById('standardSubmitButton');
        if (submitButton) {
            submitButton.style.display = 'block';
        }
    }
}

// Hilfsfunktion für Farbnamen
function getColorName(colorKey) {
    const colorNames = {
        'orange': 'Orange',
        'blau': 'Blau',
        'gelb': 'Gelb',
        'grau': 'Grau',
        'grün': 'Grün',
        'pink': 'Pink',
        'rot': 'Rot',
        'schwarz': 'Schwarz',
        'weiß': 'Weiß'
    };
    return colorNames[colorKey] || colorKey;
}

// PayPal-Zahlung verarbeiten (Legacy-Funktion für Fallback)
async function processPayPalPayment(orderData) {
    // Diese Funktion wird nur verwendet, wenn PayPal SDK nicht verfügbar ist
    // Normalerweise wird die Zahlung über renderPayPalButtons() abgewickelt
    const transactionId = 'paypal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    await saveOrderToSupabase(orderData, 'paypal', transactionId, 'pending');
}

// Kreditkartenzahlung verarbeiten
async function processCreditCardPayment(orderData) {
    // Hinweis: Für eine vollständige Kreditkartenzahlung benötigen Sie Stripe oder ein ähnliches System
    // Stripe erfordert ein Backend für Payment Intents (siehe SETUP.md)
    // Die aktuelle Implementierung speichert Bestellungen direkt in Supabase
    // In einer Produktionsumgebung sollten Sie Stripe Elements verwenden und
    // die Bestellung erst nach erfolgreicher Zahlung speichern
    
    // Für jetzt: Direkt in Supabase speichern
    // Transaction ID wird generiert (in Produktion würde diese von Stripe kommen)
    const transactionId = 'creditcard-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    await saveOrderToSupabase(orderData, 'creditcard', transactionId);
}

// Zoho Mail API - E-Mail an Kunden senden (Bestellbestätigung)
async function sendOrderConfirmationEmail(orderData) {
    try {
        const subject = 'Bestellbestätigung - Camillo Industries';
        const htmlBody = `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Bestellbestätigung - Camillo Industries</h2>
                    
                    <p>Hallo ${orderData.name},</p>
                    
                    <p>vielen Dank für Ihre Bestellung! Wir haben Ihre Bestellung erhalten und werden sie schnellstmöglich bearbeiten.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Bestelldetails:</h3>
                        <p><strong>Produkt:</strong> ${orderData.produkttyp || 'Eiskratzer'}</p>
                        <p><strong>Farbe:</strong> ${orderData.color}</p>
                        <p><strong>Menge:</strong> ${orderData.quantity}</p>
                        <p><strong>Gesamtpreis:</strong> €${orderData.totalPrice.toFixed(2)}</p>
                        <p><strong>Lieferadresse:</strong><br>
                        ${orderData.street}<br>
                        ${orderData.zip} ${orderData.city}</p>
                    </div>
                    
                    <p>Sie erhalten eine weitere E-Mail, sobald Ihre Bestellung versendet wurde.</p>
                    
                    <p>Bei Fragen können Sie uns jederzeit kontaktieren.</p>
                    
                    <p>Mit freundlichen Grüßen,<br>
                    <strong>Camillo Industries</strong></p>
                </div>
            </body>
            </html>
        `;

        // API-URL bestimmen - verwende absolute URL für bessere Kompatibilität
        // Fallback auf Vercel-URL, falls Custom Domain die API-Route nicht unterstützt
        let apiUrl;
        if (window.location.hostname.includes('camillo-industries.de')) {
            // Custom Domain - versuche erst Custom Domain, dann Vercel
            apiUrl = `${window.location.origin}/api/send-email`;
        } else {
            apiUrl = `${window.location.origin}/api/send-email`;
        }
        console.log('Sende E-Mail über API:', apiUrl, 'von:', window.location.origin);
        
        let response;
        try {
            const requestBody = {
                to: orderData.email,
                subject: subject,
                htmlBody: htmlBody,
                fromEmail: 'jonathan.simon@camillo-industries.de',
                fromName: 'Camillo Industries'
            };
            
            console.log('Sende Request an:', apiUrl);
            console.log('Request Body Keys:', Object.keys(requestBody));
            
            // Versuche erst Custom Domain, dann Fallback auf Vercel
            const vercelApiUrl = 'https://camillo-industries-website.vercel.app/api/send-email';
            
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                console.log('Response erhalten:', response.status, response.statusText);
            } catch (primaryError) {
                console.warn('Primary API-URL fehlgeschlagen, versuche Fallback:', primaryError.message);
                // Fallback auf Vercel-URL
                response = await fetch(vercelApiUrl, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                console.log('Fallback Response erhalten:', response.status, response.statusText);
            }
        } catch (fetchError) {
            console.error('Fetch-Fehler beim Senden der Bestellbestätigung:', fetchError);
            console.error('Fehler-Details:', {
                message: fetchError.message,
                name: fetchError.name,
                stack: fetchError.stack,
                apiUrl: apiUrl
            });
            // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
            return;
        }

        if (response && response.ok) {
            const result = await response.json();
            console.log('✅ Bestellbestätigung an Kunden gesendet:', result);
        } else if (response) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            const error = await response.json().catch(() => ({ error: errorText, status: response.status }));
            console.error('❌ Fehler beim Senden der Bestellbestätigung:', {
                status: response.status,
                statusText: response.statusText,
                error: error,
                headers: Object.fromEntries(response.headers.entries())
            });
        } else {
            console.error('❌ Keine Response erhalten - API-Route möglicherweise nicht verfügbar');
        }
    } catch (error) {
        console.error('Fehler beim Senden der Bestellbestätigung:', error);
        // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
    }
}

// Zoho Mail API - E-Mail an Admin senden (Neue Bestellung Benachrichtigung)
async function sendOrderNotificationEmail(orderData, paymentMethod) {
    try {
        const subject = 'Neue Bestellung eingegangen';
        const htmlBody = `
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Neue Bestellung eingegangen</h2>
                    
                    <p>Eine neue Bestellung wurde auf der Website aufgegeben:</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Bestelldetails:</h3>
                        <p><strong>Name:</strong> ${orderData.name}</p>
                        <p><strong>E-Mail:</strong> ${orderData.email}</p>
                        <p><strong>Adresse:</strong><br>
                        ${orderData.street}<br>
                        ${orderData.zip} ${orderData.city}</p>
                        <p><strong>Produkt:</strong> ${orderData.produkttyp || 'Eiskratzer'}</p>
                        <p><strong>Farbe:</strong> ${orderData.color}</p>
                        <p><strong>Menge:</strong> ${orderData.quantity}</p>
                        <p><strong>Gesamtpreis:</strong> €${orderData.totalPrice.toFixed(2)}</p>
                        <p><strong>Zahlungsmethode:</strong> ${paymentMethod}</p>
                    </div>
                    
                    <p>Bitte bearbeiten Sie die Bestellung im Bestellungen-Manager.</p>
                </div>
            </body>
            </html>
        `;

        // API-URL bestimmen - verwende absolute URL für bessere Kompatibilität
        // Fallback auf Vercel-URL, falls Custom Domain die API-Route nicht unterstützt
        let apiUrl;
        if (window.location.hostname.includes('camillo-industries.de')) {
            // Custom Domain - versuche erst Custom Domain, dann Vercel
            apiUrl = `${window.location.origin}/api/send-email`;
        } else {
            apiUrl = `${window.location.origin}/api/send-email`;
        }
        console.log('Sende Admin-Benachrichtigung über API:', apiUrl, 'von:', window.location.origin);
        
        let response;
        try {
            const requestBody = {
                to: 'jonathan@camillo-industries.de',
                subject: subject,
                htmlBody: htmlBody,
                fromEmail: 'jonathan.simon@camillo-industries.de',
                fromName: 'Camillo Industries Shop'
            };
            
            console.log('Sende Admin-Request an:', apiUrl);
            console.log('Request Body Keys:', Object.keys(requestBody));
            
            // Versuche erst Custom Domain, dann Fallback auf Vercel
            const vercelApiUrl = 'https://camillo-industries-website.vercel.app/api/send-email';
            
            try {
                response = await fetch(apiUrl, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                
                console.log('Admin Response erhalten:', response.status, response.statusText);
            } catch (primaryError) {
                console.warn('Primary API-URL fehlgeschlagen, versuche Fallback:', primaryError.message);
                // Fallback auf Vercel-URL
                response = await fetch(vercelApiUrl, {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                console.log('Fallback Admin Response erhalten:', response.status, response.statusText);
            }
        } catch (fetchError) {
            console.error('Fetch-Fehler beim Senden der Admin-Benachrichtigung:', fetchError);
            console.error('Fehler-Details:', {
                message: fetchError.message,
                name: fetchError.name,
                stack: fetchError.stack,
                apiUrl: apiUrl
            });
            // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
            return;
        }

        if (response && response.ok) {
            const result = await response.json();
            console.log('✅ Bestellbenachrichtigung an Admin gesendet:', result);
        } else if (response) {
            const errorText = await response.text().catch(() => 'Could not read error response');
            const error = await response.json().catch(() => ({ error: errorText, status: response.status }));
            console.error('❌ Fehler beim Senden der Admin-Benachrichtigung:', {
                status: response.status,
                statusText: response.statusText,
                error: error,
                headers: Object.fromEntries(response.headers.entries())
            });
        } else {
            console.error('❌ Keine Response erhalten - API-Route möglicherweise nicht verfügbar');
        }
    } catch (error) {
        console.error('Fehler beim Senden der Admin-Benachrichtigung:', error);
        // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
    }
}

// Bestellung in Supabase speichern
async function saveOrderToSupabase(orderData, paymentMethod, transactionId, paymentStatus = 'pending') {
    if (!supabaseClient) {
        throw new Error('Supabase Client nicht initialisiert. Bitte überprüfen Sie Ihre Konfiguration.');
    }

    try {
        const { data, error } = await supabaseClient
            .from('bestellungen')
            .insert([
                {
                    name: orderData.name,
                    email: orderData.email,
                    street: orderData.street,
                    zip: orderData.zip,
                    city: orderData.city,
                    color: orderData.color,
                    produkttyp: orderData.produkttyp || 'Eiskratzer', // Produkttyp hinzufügen
                    quantity: orderData.quantity,
                    unit_price: orderData.unitPrice,
                    shipping_cost: orderData.shippingCost,
                    total_price: orderData.totalPrice,
                    payment_method: paymentMethod,
                    payment_status: paymentStatus, // 'completed' für erfolgreiche PayPal-Zahlungen, 'pending' für andere
                    payment_transaction_id: transactionId,
                    order_status: 'pending',
                    versendet: false // Standardmäßig noch nicht versendet
                }
            ])
            .select();

        if (error) {
            console.error('Supabase Fehler:', error);
            throw new Error('Fehler beim Speichern der Bestellung: ' + error.message);
        }

        console.log('Bestellung erfolgreich gespeichert:', data);
        
        // E-Mails senden (nicht blockierend)
        sendOrderConfirmationEmail(orderData).catch(err => console.error('E-Mail Fehler:', err));
        sendOrderNotificationEmail(orderData, paymentMethod).catch(err => console.error('E-Mail Fehler:', err));
        
        // Bestelldaten für die Dankeseite speichern
        localStorage.setItem('orderData', JSON.stringify({
            ...orderData,
            orderId: data[0].id,
            transactionId: transactionId
        }));

        // Zur Dankeseite weiterleiten
        window.location.href = 'danke.html';
    } catch (error) {
        console.error('Fehler beim Speichern in Supabase:', error);
        throw error;
    }
}

