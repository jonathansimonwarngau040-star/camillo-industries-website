# Zoho Mail API Setup-Anleitung

Diese Anleitung erklärt, wie Sie die Zoho Mail API direkt integrieren, um E-Mails zu senden.

## Schritt 1: Zoho Developer Console - App erstellen

1. Gehen Sie zu [Zoho Developer Console](https://accounts.zoho.com/developerconsole)
2. Melden Sie sich mit Ihrem Zoho-Konto an (jonathansimonwarngau040@gmail.com)
3. Klicken Sie auf **"Add Client"** oder **"GET STARTED"**
4. Wählen Sie **"Server-based Applications"** aus
5. Füllen Sie das Formular aus:
   - **Client Name**: z.B. "Camillo Industries Website"
   - **Homepage URL**: Ihre Website-URL (z.B. `https://camillo-industries-website.vercel.app`)
   - **Authorized Redirect URIs**: 
     - Für lokale Tests: `http://localhost:3000/oauth/callback`
     - Für Produktion: `https://camillo-industries-website.vercel.app/oauth/callback`
6. Klicken Sie auf **"Create"**
7. **WICHTIG**: Notieren Sie sich:
   - **Client ID** (wird sofort angezeigt)
   - **Client Secret** (wird sofort angezeigt - kopieren Sie es sofort!)

## Schritt 2: OAuth 2.0 Authorization Code erhalten

1. Öffnen Sie einen Browser und navigieren Sie zu folgender URL:

```
https://accounts.zoho.eu/oauth/v2/auth?response_type=code&client_id=1000.GGLBL84VYO4CJMYWO7NWSSPRJ6B4EW&redirect_uri=https://camillo-industries-website.vercel.app/oauth/callback&scope=ZohoMail.messages.CREATE&access_type=offline
```

**WICHTIG:** Der Scope ist `ZohoMail.messages.CREATE` (nicht `.send`)

**Ihre Client ID:** `1000.GGLBL84VYO4CJMYWO7NWSSPRJ6B4EW`
**Ihr Client Secret:** `a0fe3f29b8e8cbedd3ccbf00b8455af0fbfc00e249`

2. Melden Sie sich mit Ihrem Zoho-Konto an
3. Erlauben Sie die Berechtigungen
4. Sie werden zu einer Redirect-URI weitergeleitet, die einen `code` Parameter enthält
5. **Kopieren Sie den `code` Parameter** aus der URL (z.B. `code=1000.abc123...`)

## Schritt 3: Refresh Token erhalten

1. Öffnen Sie ein Terminal oder verwenden Sie curl/Postman
2. Senden Sie eine POST-Anfrage an:

```bash
curl -X POST https://accounts.zoho.eu/oauth/v2/token \
  -d "grant_type=authorization_code" \
  -d "client_id=1000.GGLBL84VYO4CJMYWO7NWSSPRJ6B4EW" \
  -d "client_secret=a0fe3f29b8e8cbedd3ccbf00b8455af0fbfc00e249" \
  -d "redirect_uri=https://camillo-industries-website.vercel.app/oauth/callback" \
  -d "code=YOUR_AUTHORIZATION_CODE"
```

Ersetzen Sie `YOUR_AUTHORIZATION_CODE` mit dem Code aus der Redirect-URL (nach Schritt 2).

**Beispiel:** Wenn die Redirect-URL `https://camillo-industries-website.vercel.app/oauth/callback?code=1000.abc123...` ist, dann ist `1000.abc123...` Ihr Authorization Code.

3. Die Antwort enthält:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

4. **WICHTIG**: Kopieren Sie den `refresh_token` - dieser wird für zukünftige API-Aufrufe verwendet!

## Schritt 4: Vercel Umgebungsvariablen konfigurieren

1. Gehen Sie zu Ihrem Vercel Dashboard
2. Wählen Sie Ihr Projekt aus
3. Gehen Sie zu **Settings** → **Environment Variables**
4. Fügen Sie folgende Variablen hinzu:

```
ZOHO_CLIENT_ID=Ihre_Client_ID
ZOHO_CLIENT_SECRET=Ihr_Client_Secret
ZOHO_REFRESH_TOKEN=Ihr_Refresh_Token
ZOHO_ACCOUNT_ID=6887007000000002002
```

5. Klicken Sie auf **Save**

## Schritt 5: Python-Programm konfigurieren

1. Öffnen Sie `bestellungen_manager.py`
2. Suchen Sie nach der Funktion `init_zoho_mail()`
3. Ersetzen Sie die Platzhalter:

```python
ZOHO_CLIENT_ID = 'Ihre_Client_ID_hier'
ZOHO_CLIENT_SECRET = 'Ihr_Client_Secret_hier'
ZOHO_REFRESH_TOKEN = 'Ihr_Refresh_Token_hier'
ZOHO_ACCOUNT_ID = '6887007000000002002'  # Optional
```

## Schritt 6: Testen

1. Stellen Sie sicher, dass alle Umgebungsvariablen in Vercel gesetzt sind
2. Stellen Sie die Website erneut bereit (Redeploy)
3. Testen Sie eine Bestellung auf der Website
4. Überprüfen Sie, ob E-Mails gesendet werden

## Fehlerbehebung

### "Failed to get access token"
- Überprüfen Sie, ob Client ID, Client Secret und Refresh Token korrekt sind
- Stellen Sie sicher, dass der Refresh Token nicht abgelaufen ist

### "Failed to send email"
- Überprüfen Sie, ob die Account ID korrekt ist
- Stellen Sie sicher, dass die OAuth-Berechtigung `ZohoMail.messages.send` erteilt wurde

### "Zoho Mail API not configured"
- Überprüfen Sie, ob alle Umgebungsvariablen in Vercel gesetzt sind
- Stellen Sie sicher, dass die Variablen nach einem Redeploy verfügbar sind

## Wichtige Hinweise

- Der Refresh Token sollte sicher aufbewahrt werden
- Der Access Token läuft nach 1 Stunde ab und wird automatisch erneuert
- Die Account ID kann in der Zoho Mail API-Dokumentation gefunden werden oder wird automatisch ermittelt

## API-Endpunkte

- **Token-URL**: `https://accounts.zoho.eu/oauth/v2/token`
- **Mail API**: `https://mail.zoho.eu/api/accounts/{accountId}/messages`
- **Authorization URL**: `https://accounts.zoho.eu/oauth/v2/auth`

## Weitere Informationen

- [Zoho Mail API Dokumentation](https://www.zoho.com/mail/help/api/overview.html)
- [Zoho OAuth 2.0 Dokumentation](https://www.zoho.com/mail/help/api/authtoken.html)

