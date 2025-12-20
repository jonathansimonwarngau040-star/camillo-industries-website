# Supabase Keys - Erklärung

## Wichtige Unterscheidung

Es gibt **drei verschiedene Werte** in Ihrem Supabase Dashboard:

### 1. Project URL (Projekt-URL)
- **Wo finden**: Settings → API → **Project URL**
- **Aussehen**: `https://xxxxx.supabase.co`
- **Verwendung**: In `config.js` als `SUPABASE_CONFIG.url`
- **Sicherheit**: Öffentlich, kann im Frontend-Code verwendet werden

### 2. Publishable key (Öffentlicher Schlüssel)
- **Wo finden**: Settings → API → **Publishable key** Sektion → Key mit Name "default"
- **Aussehen**: String, beginnt mit `sb_publishable_...`
- **Verwendung**: In `config.js` als `SUPABASE_CONFIG.anonKey`
- **Sicherheit**: Öffentlich, speziell für Client-seitigen Code entwickelt
- **Rechte**: Eingeschränkt, respektiert RLS (Row Level Security)
- **Hinweis**: Dies ist das neue Format - entspricht dem alten "anon public" key

### 3. Secret key (Geheimer Schlüssel) ⚠️ GEFÄHRLICH
- **Wo finden**: Settings → API → **Secret keys** Sektion → Key mit Name "default"
- **Aussehen**: String, beginnt mit `sb_secret_...` (maskiert angezeigt)
- **Verwendung**: **NIEMALS im Frontend-Code!** Nur im Backend/Server
- **Sicherheit**: Sehr geheim, hat Admin-Rechte
- **Rechte**: Umgeht RLS, hat vollen Zugriff auf die Datenbank
- **Warnung**: Wenn dieser Key gestohlen wird, kann jemand Ihre gesamte Datenbank manipulieren!
- **Hinweis**: Dies ist das neue Format - entspricht dem alten "service_role" key

## Was Sie für diese Website brauchen

Für die `config.js` Datei benötigen Sie **NUR**:
- ✅ **Project URL** (z.B. `https://xxxxx.supabase.co`) - finden Sie oben auf der API-Seite
- ✅ **Publishable key** (aus der "Publishable key" Sektion, Name "default") - beginnt mit `sb_publishable_...`

**NICHT verwenden:**
- ❌ **Secret key** - Dieser gehört NICHT in den Frontend-Code! (aus "Secret keys" Sektion)

## Beispiel config.js

```javascript
const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co', // <- Project URL (oben auf der API-Seite)
    anonKey: 'sb_publishable_1N8ucC_7z6_JkV4027n_zA_-kKFu...' // <- Publishable key (aus "Publishable key" Sektion)
};
```

## Wo finde ich diese Werte?

1. Loggen Sie sich in Ihr Supabase Dashboard ein
2. Gehen Sie zu **Settings** (Einstellungen) → **API**
3. Sie sehen dort:
   - **Project URL**: Oben auf der Seite, z.B. `https://xxxxx.supabase.co`
   - **Publishable key** Sektion: 
     - Key mit Name "default" - Das ist der Publishable key (für Frontend) ✅
   - **Secret keys** Sektion:
     - Key mit Name "default" (maskiert) - Das ist der Secret key (NICHT verwenden im Frontend!) ❌

## Sicherheit

- ✅ **Publishable key im Frontend**: Sicher, da er RLS respektiert
- ❌ **Secret key im Frontend**: Sehr unsicher! Niemals verwenden!

Der Secret key sollte nur verwendet werden in:
- Server-seitigem Code (Backend)
- Supabase Edge Functions
- Automatisierte Skripte auf sicheren Servern

