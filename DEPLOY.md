# 3DCAY Website — Deployment-Anleitung

## Voraussetzungen
- GitHub Account (vorhanden)
- Netlify Account (kostenlos: https://app.netlify.com/signup)

---

## Schritt 1: Projektordner vorbereiten

Kopiere die deployment-relevanten Dateien nach `~/Developer/Projects/3dcay-website/`:

```bash
cd ~/Developer/Projects/3dcay-website

# Sicherstellen, dass diese Dateien vorhanden sind:
# index.html          ← Haupt-Website (mit Netlify Forms)
# ki-news.json        ← KI-Dialog News
# netlify.toml        ← Netlify-Konfiguration
# .gitignore          ← Git-Ausschlüsse
# images/             ← 10 PNG-Bilder
# 3dcay-intelligence-agent.py  ← KI-News Agent (optional)
# embed-images.py     ← Bild-Einbetter (optional)
```

## Schritt 2: Git-Repository initialisieren

```bash
cd ~/Developer/Projects/3dcay-website

git init
git branch -m main

git add index.html ki-news.json netlify.toml .gitignore images/
git commit -m "Initial commit: 3DCAY website with Netlify Forms"
```

## Schritt 3: GitHub-Repository erstellen

```bash
# Neues Repo auf GitHub erstellen (öffentlich oder privat)
gh repo create 3dcay-website --private --source=. --remote=origin --push

# ODER manuell:
# 1. github.com → New repository → "3dcay-website"
# 2. Dann:
git remote add origin https://github.com/DEIN-USERNAME/3dcay-website.git
git push -u origin main
```

## Schritt 4: Netlify verbinden

1. Gehe zu **https://app.netlify.com**
2. "Add new site" → "Import an existing project"
3. "Deploy with GitHub" wählen
4. Repository **3dcay-website** auswählen
5. Build-Einstellungen:
   - **Branch to deploy:** `main`
   - **Build command:** *(leer lassen)*
   - **Publish directory:** `.`
6. "Deploy site" klicken

Die Seite ist sofort live unter `https://RANDOM-NAME.netlify.app`

## Schritt 5: Custom Domain (optional)

1. Netlify Dashboard → "Domain settings"
2. "Add custom domain" → `3dcay.de` eingeben
3. DNS-Einträge bei deinem Domain-Provider anpassen:
   - **A-Record:** `75.2.60.5`
   - **CNAME:** `www` → `DEIN-SITE-NAME.netlify.app`

## Schritt 6: Netlify Forms — E-Mail-Benachrichtigungen

Nach dem ersten Deploy erkennt Netlify automatisch die zwei Formulare:
- **newsletter** (KI-Newsletter Anmeldungen)
- **briefing** (CTA Kontaktanfragen)

E-Mail-Benachrichtigungen einrichten:
1. Netlify Dashboard → **Forms** → Beide Formulare sollten sichtbar sein
2. **Site configuration** → **Notifications** → **Emails and webhooks**
3. "Add notification" → "Form submission"
4. E-Mail-Adresse eingeben (z.B. `info@3dcay.de`)
5. Formular auswählen → Speichern
6. Für das zweite Formular wiederholen

## Fertig!

Nach dem Deploy:
- Website: `https://DEIN-SITE.netlify.app`
- Newsletter-Anmeldungen: erscheinen im Netlify Dashboard unter "Forms"
- Briefing-Anfragen: erscheinen im Netlify Dashboard unter "Forms"
- E-Mail-Benachrichtigungen: kommen automatisch bei jeder Formular-Einreichung
