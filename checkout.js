// Checkout-Logik mit Supabase und Zahlungsintegration

// Supabase Client initialisieren
let supabaseClient = null;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    initializeSupabase();
    initializeCheckoutPage();
    initializePaymentMethods();
    initEmailJS(); // EmailJS initialisieren
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

// Zahlungsmethoden initialisieren
function initializePaymentMethods() {
    const paypalRadio = document.getElementById('paypal');
    const creditCardRadio = document.getElementById('creditcard');
    const creditCardFields = document.getElementById('creditCardFields');
    const checkoutForm = document.getElementById('checkoutForm');

    // Payment method toggle
    paypalRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardFields.style.display = 'none';
        }
    });

    creditCardRadio.addEventListener('change', function() {
        if (this.checked) {
            creditCardFields.style.display = 'block';
        }
    });

    // Form submission
    checkoutForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(checkoutForm);
        const paymentMethod = formData.get('payment');
        
        // Validierung
        if (!validateForm(formData, paymentMethod)) {
            return;
        }

        // Bestelldaten sammeln
        const orderData = collectOrderData(formData);

        // Zahlungsabwicklung basierend auf gewählter Methode
        try {
            if (paymentMethod === 'paypal') {
                await processPayPalPayment(orderData);
            } else if (paymentMethod === 'creditcard') {
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
        quantity: quantity,
        unitPrice: unitPrice,
        shippingCost: shippingCost,
        totalPrice: totalPrice,
        paymentMethod: formData.get('payment')
    };
}

// PayPal-Zahlung verarbeiten
async function processPayPalPayment(orderData) {
    // Hinweis: Für eine vollständige PayPal-Integration benötigen Sie ein Backend
    // Die aktuelle Implementierung speichert Bestellungen direkt in Supabase
    // In einer Produktionsumgebung sollten Sie PayPal Buttons SDK verwenden und
    // die Bestellung erst nach erfolgreicher PayPal-Zahlung speichern
    
    // Für jetzt: Direkt in Supabase speichern
    // Transaction ID wird generiert (in Produktion würde diese von PayPal kommen)
    const transactionId = 'paypal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    await saveOrderToSupabase(orderData, 'paypal', transactionId);
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

// EmailJS initialisieren
function initEmailJS() {
    if (typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.publicKey && typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        console.log('EmailJS initialisiert');
        return true;
    } else {
        console.warn('EmailJS nicht konfiguriert');
        return false;
    }
}

// E-Mail an Kunden senden (Bestellbestätigung)
async function sendOrderConfirmationEmail(orderData) {
    if (!EMAILJS_CONFIG || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateIdOrderConfirmation || typeof emailjs === 'undefined') {
        console.warn('EmailJS nicht konfiguriert - E-Mail wird nicht gesendet', {
            hasConfig: !!EMAILJS_CONFIG,
            hasServiceId: !!EMAILJS_CONFIG?.serviceId,
            hasTemplateId: !!EMAILJS_CONFIG?.templateIdOrderConfirmation,
            hasEmailJS: typeof emailjs !== 'undefined'
        });
        return;
    }

    try {
        const templateParams = {
            name: orderData.name,
            customer_email: orderData.email,
            color: orderData.color,
            quantity: orderData.quantity,
            total_price: orderData.totalPrice.toFixed(2),
            street: orderData.street,
            zip: orderData.zip,
            city: orderData.city
        };

        const result = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateIdOrderConfirmation,
            templateParams
        );
        console.log('Bestellbestätigung an Kunden gesendet:', result);
    } catch (error) {
        console.error('Fehler beim Senden der Bestellbestätigung:', error);
        // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
    }
}

// E-Mail an Admin senden (Neue Bestellung Benachrichtigung)
async function sendOrderNotificationEmail(orderData, paymentMethod) {
    if (!EMAILJS_CONFIG || !EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.templateIdAdminNotification || typeof emailjs === 'undefined') {
        console.warn('EmailJS nicht konfiguriert - E-Mail wird nicht gesendet', {
            hasConfig: !!EMAILJS_CONFIG,
            hasServiceId: !!EMAILJS_CONFIG?.serviceId,
            hasTemplateId: !!EMAILJS_CONFIG?.templateIdAdminNotification,
            hasEmailJS: typeof emailjs !== 'undefined'
        });
        return;
    }

    try {
        const templateParams = {
            name: orderData.name,
            customer_email: orderData.email,
            street: orderData.street,
            zip: orderData.zip,
            city: orderData.city,
            color: orderData.color,
            quantity: orderData.quantity,
            total_price: orderData.totalPrice.toFixed(2),
            payment_method: paymentMethod
        };

        const result = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateIdAdminNotification,
            templateParams
        );
        console.log('Bestellbenachrichtigung an Admin gesendet:', result);
    } catch (error) {
        console.error('Fehler beim Senden der Admin-Benachrichtigung:', error);
        // E-Mail-Fehler sollen den Bestellprozess nicht blockieren
    }
}

// Bestellung in Supabase speichern
async function saveOrderToSupabase(orderData, paymentMethod, transactionId) {
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
                    quantity: orderData.quantity,
                    unit_price: orderData.unitPrice,
                    shipping_cost: orderData.shippingCost,
                    total_price: orderData.totalPrice,
                    payment_method: paymentMethod,
                    payment_status: 'pending', // Wird auf 'completed' gesetzt, sobald Zahlung bestätigt ist
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
        initEmailJS();
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

