// Vercel Serverless Function für Zoho Mail API
// Sendet E-Mails über die Zoho Mail API

export default async function handler(req, res) {
    // CORS-Header setzen (immer zuerst)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // OPTIONS-Request für Preflight handhaben
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Nur POST-Requests erlauben
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed', allowedMethods: ['POST'], receivedMethod: req.method });
        return;
    }

    // Logging für Debugging
    console.log('API Request erhalten:', {
        method: req.method,
        headers: req.headers,
        bodyKeys: req.body ? Object.keys(req.body) : 'no body'
    });

    try {
        const { 
            to, 
            subject, 
            htmlBody, 
            textBody,
            fromEmail,
            fromName 
        } = req.body;

        // Validierung
        if (!to || !subject || !htmlBody) {
            return res.status(400).json({ error: 'Missing required fields: to, subject, htmlBody' });
        }

        // Zoho Mail API Konfiguration aus Umgebungsvariablen
        const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID;
        const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET;
        const ZOHO_REFRESH_TOKEN = process.env.ZOHO_REFRESH_TOKEN;
        const ZOHO_ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || '6887007000000002002'; // Fallback

        if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
            console.error('Zoho Mail API Konfiguration fehlt');
            return res.status(500).json({ error: 'Zoho Mail API not configured' });
        }

        // 1. Access Token mit Refresh Token erhalten
        const tokenResponse = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                refresh_token: ZOHO_REFRESH_TOKEN,
                client_id: ZOHO_CLIENT_ID,
                client_secret: ZOHO_CLIENT_SECRET,
                grant_type: 'refresh_token'
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Fehler beim Abrufen des Access Tokens:', errorText);
            return res.status(500).json({ 
                error: 'Failed to get access token',
                details: errorText 
            });
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return res.status(500).json({ error: 'No access token received' });
        }

        // 2. E-Mail über Zoho Mail API senden
        const emailResponse = await fetch(`https://mail.zoho.eu/api/accounts/${ZOHO_ACCOUNT_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromAddress: fromEmail || 'jonathan.simon@camillo-industries.de',
                toAddress: to,
                subject: subject,
                content: htmlBody,
                mailFormat: 'html'
            })
        });

        if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('Fehler beim Senden der E-Mail:', errorText);
            return res.status(500).json({ 
                error: 'Failed to send email',
                details: errorText 
            });
        }

        const emailData = await emailResponse.json();
        
        return res.status(200).json({ 
            success: true,
            messageId: emailData.data?.messageId || 'unknown'
        });

    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

