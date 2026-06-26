# 3DCAY v5 — Handover / Stand (für neuen Chat)

> Kurzbriefing zum Reinkopieren in eine neue Cowork-Session, damit nahtlos an der **v5** weitergearbeitet werden kann.

## Setup
- Projekt-Root (User): `~/Documents/3DCAY/website-projekt/`
- Repo `LutzeS/3dcay-website-v3`, Branch **main**. v5 lebt im Unterordner **`v5/`** (self-contained, eigene Asset-Kopie unter `v5/images/`).
- **Workflow:** Claude macht Edits, **Lutz committet/pusht** (knappe Befehlsblöcke). Bestehende Versionen (v3 `index.html` etc., v4 im `v4/`-Ordner/Branch) **nicht anfassen** — nur `v5/`.
- Verifikation: headless Render via Playwright in der Sandbox (Chromium liegt im Cache; bei „libXdamage fehlt" die deps aus `/tmp/deps` neu ziehen + `LD_LIBRARY_PATH` + `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`).

## Design-Basis
- Look der Seite `index-v4` (Space-Grotesk-Hero, dunkler Hero mit geschichtetem Layer: Gradient + Bild @opacity 0.4 + Overlay-Gradient, Rot `#e3101a`).
- **Helles Seitenlayout der v4-Web-to-Publish** für alle Unterseiten: Hero → helle **Kacheln** (`.tile`: gray-50, 1px gray-200, radius ~20px) → **Feature-Karten-Grid** (`.feature-cards`, 2-spaltig, weiße Karten mit 56px-Icon-Box) + `.solution-tagline`-Box → **helle Case-Study-Kacheln** (`.case-study`, NIE dunkel) → 3-Schritt-Banner (01/02/03) → rote CTA → schwarzer Footer.
- Eyebrows als `.label` (rot, mono, uppercase). Wo gemischte Schreibweise nötig: `style="text-transform:none;"`.

## Dateien in `v5/`
- `index.html` — ursprüngliche Home (index-v4-Inhalt + Hero angepasst).
- `index-alt.html` — **briefing-treue** Alternative-Startseite (aus `startseite-3dcay`): Hero → „Zahlen, die für sich sprechen" (20+/30+/50+, animierte Count-up) → „Was ist 3DCAY?" (inkl. KI-Bullets) → „Was uns besonders macht" (Kachel) → „Unsere Lösungen" = **6 Kacheln** (Shop, Web-to-Publish, Cashback, App, Services–Individuelle IT, Forschungszulage 2026) → „Bereit für den nächsten Schritt?" (CTA „Jetzt Kontakt aufnehmen").
- `shop.html`, `web-to-publish.html`, `cashback.html`, `3dcay-app.html` — 4 Produktseiten.
- `services.html` — Services (3 Leistungsfelder + 4 Case-Studies: Helmholtz, BAT & dieBayerische, Philips, BAT-Systemintegration). Case-Studies 1:1 ans Briefing angeglichen.
- `ki-lab.html` — neue KI-Lab-Seite (enthält den KI-POWERED-Block: Stats, F&E-Karten, EGGER-Case). Nav „KI-Lab" zeigt auf `index-alt.html`/`ki-lab.html` bereits hierhin.

## Navigation (Sitemap)
Home · Produkte (Dropdown: Shop, Web-to-Publish, Cashback, App) · Services · KI-Lab · Referenzen · Blog.
- KI-Lab → `ki-lab.html` (nur auf `index-alt.html` + `ki-lab.html`); auf den anderen Seiten noch `../ki-lab-newsletter.html`.
- Referenzen → `../referenzen.html`, Blog → extern `https://3dcay.de/marketing-logistik-blog/`.

## Briefing-Quellen (Word-Docs, vom User hochgeladen)
`startseite-3dcay`, `produktseite-3dcay-shop`, `-web-to-publish`, `-cashback`, `-app`, `leistungsseite-services-3dcay`. (Bei Neustart ggf. erneut hochladen.)

## Offene Punkte / Entscheidungen
1. **Welche Home gilt?** `index.html` (alt) oder die briefing-treue `index-alt.html`. Wenn `index-alt` übernommen wird: `index-alt.html` → `index.html` umbenennen **und** Nav „KI-Lab" auf allen Seiten (shop/w2p/cashback/app/services) auf `ki-lab.html` umstellen.
2. **Client-Logo-Marquee** auf `index-alt` behalten oder entfernen (steht nicht im Briefing).
3. Produktseiten **shop/cashback/app** noch nicht final gegen ihre Briefing-Docs gegengeprüft (web-to-publish & services sind erledigt). → Gap-Check je Seite empfohlen.
4. Optional: Netlify-Site für v5 (Base-Dir `v5/`) einrichten.

## Letzte Commits (Beispiel-Workflow)
```bash
cd ~/Documents/3DCAY/website-projekt
git add v5
git commit -m "…"
git push origin main
```
Noch nicht committed: `v5/index.html`, `v5/services.html`, `v5/web-to-publish.html` (M) sowie neu `v5/index-alt.html`, `v5/ki-lab.html`.

*Stand: 2026-06-22*
