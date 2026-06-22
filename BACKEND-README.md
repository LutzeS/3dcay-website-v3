# 3DCAY Backend (MVP)

Serverless-Backend für die 3DCAY-Website auf Basis von **Netlify Functions** + **Netlify Blobs** (Datenspeicher) + **Mailjet** (Versand).
Kein redaktioneller Wasserkopf — Fokus auf Leads, Fit-Check-Statistik, Whitepaper-Steuerung, News und Newsletter.

## Module
- **Lead-Inbox** — Demo-/Kontakt-/Whitepaper-Leads, Status (neu → kontaktiert → qualifiziert → geschlossen).
- **Fit-Check-Funnel** — gestartet / abgeschlossen / danach angemeldet / Abbrecher.
- **Whitepaper-Manager** — PDFs eintragen/aktiv schalten, Download-Zähler, gated Download-Link.
- **News-Editor** — aktuelle KI-Meldungen pflegen.
- **Newsletter-Center** — Abonnenten (Double-Opt-In), Versand via Mailjet, Abmelde-Link automatisch.

## Admin
Oberfläche: **`/v5/admin.html`** (Login per Passwort).

## Benötigte Environment-Variablen (Netlify → Site configuration → Environment variables)
| Variable | Zweck |
|---|---|
| `ADMIN_PASSWORD` | Passwort für den Admin-Login |
| `ADMIN_SECRET` | langer Zufallsstring (signiert Login- & E-Mail-Tokens) |
| `MAILJET_API_KEY` | Mailjet API Key |
| `MAILJET_SECRET_KEY` | Mailjet Secret Key |
| `MAILJET_FROM_EMAIL` | verifizierte Absenderadresse (z. B. newsletter@3dcay.de) |
| `MAILJET_FROM_NAME` | Absendername (z. B. „3DCAY KI-Lab") |
| `INTERNAL_NOTIFY_EMAIL` | *(optional)* interne Adresse für Lead-Benachrichtigung |

> `ADMIN_SECRET` z. B. erzeugen mit: `openssl rand -hex 32`

## Deploy
1. `package.json`, `netlify.toml` und der Ordner `netlify/functions/` ins Repo committen & pushen.
2. Netlify baut beim Push automatisch die Functions (installiert `@netlify/blobs`).
3. Environment-Variablen setzen (siehe oben), danach **einmal neu deployen**.
4. **Netlify Blobs** ist auf Netlify automatisch aktiv — kein zusätzliches Setup.

## Endpunkte (Basis: `/.netlify/functions/`)
| Endpoint | Methode | Auth | Zweck |
|---|---|---|---|
| `admin-login` | POST | – | Passwort → Token |
| `admin-data` | GET | ✅ | Dashboard-Daten |
| `admin-content` | POST | ✅ | News/Whitepapers speichern·löschen, Lead-Status |
| `newsletter-send` | POST | ✅ | Versand an bestätigte Abonnenten |
| `subscribe` | POST | – | Newsletter-Anmeldung (Double-Opt-In) |
| `confirm` / `unsubscribe` | GET | – | Opt-In bestätigen / abmelden |
| `track` | POST | – | Funnel-Events (Fit-Check) |
| `lead` | POST | – | Lead speichern |
| `download?id=…` | GET | – | Whitepaper-Download (+Zähler) |

## Frontend verdrahten (nächster Schritt)
Diese Snippets verbinden die bestehenden Seiten mit dem Backend:

**Newsletter-Anmeldung** (`ki-lab-newsletter.html`) – Formular abschicken an:
```js
await fetch('/.netlify/functions/subscribe', {
  method:'POST', headers:{'content-type':'application/json'},
  body: JSON.stringify({ email, source:'ki-lab-newsletter' })
});
// danach: "Bitte E-Mail bestätigen"-Hinweis zeigen
```

**Fit-Check-Tracking** (`assessment.html`):
```js
const sid = (crypto.randomUUID && crypto.randomUUID()) || (''+Date.now()+Math.random());
const track = (event, meta={}) => fetch('/.netlify/functions/track',{method:'POST',
  headers:{'content-type':'application/json'}, body:JSON.stringify({event, sessionId:sid, meta})});
track('fitcheck_start');            // beim Laden / Start
// track('fitcheck_complete');      // bei Auswertung
// track('fitcheck_signup');        // wenn danach Anmeldung/Lead
```

**Whitepaper-Download** – Button verlinkt auf:
```
/.netlify/functions/download?id=<Whitepaper-ID aus dem Admin>
```

## Wichtig / Grenzen
- **Double-Opt-In** ist aktiv (DSGVO). Abmelde-Link wird jeder Ausgabe automatisch angehängt.
- **Zustellbarkeit:** SPF/DKIM/DMARC für die Absenderdomain bei Mailjet einrichten, sonst Spam.
- **Versand** läuft im MVP sequенziell in einer Function (Timeout ~10 s) — für große Verteiler später auf Mailjet-Kampagnen/Batch umstellen.
- **Netlify Blobs** ist persistent pro Site; lokale `netlify dev`-Tests brauchen ggf. `netlify link`.
