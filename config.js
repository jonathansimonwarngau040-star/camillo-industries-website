// Supabase Konfiguration
// WICHTIG: Ersetzen Sie diese Werte mit Ihren echten Supabase-Anmeldedaten
// Sie finden diese in Ihrem Supabase Dashboard unter Settings > API

const SUPABASE_CONFIG = {
    url: 'https://tqeepddjmgdzdwndyeoj.supabase.co', // z.B. https://xxxxx.supabase.co (oben auf der API-Seite)
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZWVwZGRqbWdkemR3bmR5ZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjc0NDUsImV4cCI6MjA4MTY0MzQ0NX0.CodFoJkvyIaC0TAWe-6BvuuD-G5GWm1R99E6d0qJsQU' // Ihr Publishable key (aus "Publishable key" Sektion, beginnt mit sb_publishable_...)
    // NICHT verwenden: Secret key (aus "Secret keys" Sektion) - dieser ist nur für Backend!
};

// PayPal Konfiguration (optional - nur wenn Sie PayPal verwenden möchten)
const PAYPAL_CONFIG = {
    clientId: 'YOUR_PAYPAL_CLIENT_ID' // Ihre PayPal Client ID
};

// Stripe Konfiguration (optional - nur wenn Sie Stripe für Kreditkarten verwenden möchten)
const STRIPE_CONFIG = {
    publishableKey: 'YOUR_STRIPE_PUBLISHABLE_KEY' // Ihre Stripe Publishable Key
};

