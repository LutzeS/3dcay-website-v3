# 3DCAY Website V2 — Visual Development Package

## Visual Style Guide

### Projektkontext
Corporate Website für 3DCAY Marketing Solutions — ein Unternehmen das Design, IT und KI verbindet.
Kernbereiche: Web-to-Publish, Marketing-Fulfillment, B2B-Commerce, KI-Entwicklung.
Referenz-Ästhetik: cartage.ai — clean, modern, editorial mit warmer Farbtemperatur.

### Farbpalette
- **Primärfarbe**: Warmes Amber / Golden Hour (#C4944A → #E8B86D)
- **Akzentfarbe**: 3DCAY Red (#E3101A) — sparsam, nur als Detail
- **Schatten**: Tiefes Schwarzbraun (#1A1510)
- **Highlights**: Cremeweiß, nicht kalt-weiß (#FAF5EF)
- **Sekundär**: Stahlblau für Tech-Szenen (#2A3A5A)

### Licht-Charakter
Goldstunden-Licht (Golden Hour / Magic Hour). Warme Farbtemperatur (~3200K-4000K).
Weiches, gerichtetes Licht mit natürlichen Schatten. Kein hartes Blitzlicht.
Tiefenunschärfe (Shallow DOF) als Stilmittel — Schärfeebene auf dem Hauptmotiv.

### Bildsprache
- Authentisch, nicht gestellt — Momente, keine Posen
- Professionell aber menschlich — Menschen bei der Arbeit, nicht beim Lächeln in die Kamera
- Warme Töne dominieren — Film-Look, leichtes Grain akzeptabel
- Negative Space als Gestaltungsmittel — Raum für Text-Overlays
- Kameraeinstellungen variieren: Wide Establishing → Medium → Close-Up

### Referenzfilme / Fotografie
- Roger Deakins Cinematography (Sicario, Blade Runner 2049)
- Apple Product Photography (Clean, Warm, Aspirational)
- cartage.ai Website (Modern Corporate, Warm, Editorial)

### Keywords für JEDEN Prompt
`cinematic lighting, warm color temperature, shallow depth of field, film grain, professional corporate photography, editorial style, 8K, photorealistic`

---

## FOTO #01 — HERO: Warehouse / Fulfillment

**POSITION**: Hero Section (Full-Bleed, 100vh)
**ZWECK**: Erster visueller Eindruck. Muss Größe, Professionalität und Warme vermitteln.
**TOOL**: Midjourney API (beste Ergebnisse für cinematische Szenen)
**ASPECT RATIO**: 16:9

### Prompt — Variante A (Primary)
```
cinematic wide shot of a modern fulfillment warehouse interior, warm amber lighting from overhead industrial fixtures, long rows of clean organized shelving with branded packaging and marketing materials, a single worker in the mid-ground walking between aisles slightly out of focus, concrete floors reflecting warm light, shallow depth of field with foreground shelf edge blurred, golden hour quality light streaming through high windows, professional corporate photography, editorial style, muted warm tones with deep shadows, no logos visible, 8K resolution, photorealistic, Roger Deakins inspired lighting --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante B (Alternative)
```
atmospheric warehouse interior shot from low angle, modern logistics facility with clean white shelving systems, soft warm overhead lighting creating pools of amber light, packages and printed marketing materials neatly organized, one person in dark clothing visible in far background adding human scale, lens flare from industrial light, tilt-shift effect, cinematic color grading warm amber and deep brown shadows, corporate editorial photography, film grain texture, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante C (Dramatic)
```
dramatic establishing shot of premium warehouse facility at golden hour, warm light streaming through large industrial windows creating volumetric light rays and long shadows across polished concrete floor, modern shelving systems with branded boxes and roll-up displays, silhouette of warehouse worker in far aisle, dust particles visible in light beams, wide angle lens, deep rich shadows with warm amber highlights, cinematic corporate photography, Sicario cinematography style, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Negative Prompt
```
cartoon, illustration, 3d render, cluttered, messy, cold blue lighting, flash photography, stock photo smile, text, watermark, logo, neon, oversaturated
```

### Wichtig für Website-Einbindung
- Das Bild wird als Vollbild-Hintergrund verwendet mit dunklem Overlay
- Untere 40% werden durch Gradient abgedunkelt → wichtige Elemente im oberen/mittleren Bereich platzieren
- Weißer Text liegt darüber → mittlere bis dunkle Tonalität bevorzugt

---

## FOTO #02 — WEB-TO-PUBLISH: Tablet / Speisekarte

**POSITION**: Web-to-Publish Section (Full-Bleed, 600px min-height)
**ZWECK**: Web-to-Publish in Aktion zeigen. Gastronomie als erkennbarer Use-Case.
**TOOL**: Midjourney API
**ASPECT RATIO**: 16:9

### Prompt — Variante A (Primary)
```
close-up editorial photograph of hands holding a digital tablet displaying a restaurant menu layout, warm ambient restaurant lighting in background with bokeh, the tablet screen shows a professionally designed food menu with clean typography, dark wood table surface, a printed version of the same menu lying beside the tablet, warm golden lighting from pendant lamps, shallow depth of field focused on the tablet screen, cinematic color grading, professional corporate photography, warm amber tones, film grain, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante B (Environment Focus)
```
medium shot of a professional working on a laptop in an upscale restaurant setting, screen showing a design template editor with a menu layout, warm ambient lighting from hanging pendant lamps creating soft bokeh in background, espresso cup on dark wood table, printed menu proofs spread nearby, late afternoon golden light through window, shallow DOF with sharp focus on screen, editorial corporate photography, warm muted tones, cinematic, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante C (Detail/Hands)
```
overhead close-up shot of two hands arranging a beautifully printed restaurant menu on a dark marble countertop, beside it a tablet showing the same menu in a digital editor interface, warm directional lighting from upper left, coffee cup edge visible, professional print quality visible in the menu details, shallow depth of field, golden warm color temperature, editorial food industry photography, cinematic, no faces visible, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Negative Prompt
```
cartoon, illustration, 3d render, cold lighting, flash, stock photo, generic office, text readable on screen, watermark, logo, cluttered
```

### Wichtig für Website-Einbindung
- Untere Bildhälfte wird stärker abgedunkelt (Gradient von unten)
- Links erscheint Text, rechts ein Phone-Mockup → Bild sollte ausgewogen sein
- Warme Restaurant-Atmosphäre transportiert den Gastronomie-Use-Case

---

## FOTO #03 — FULFILLMENT: Lager / Kommissionierung

**POSITION**: Split-Section links (Aspect Ratio 4:3 Card)
**ZWECK**: Fulfillment-Prozess zeigen — Ordnung, Effizienz, Menschlichkeit
**TOOL**: Midjourney API oder FLUX AI
**ASPECT RATIO**: 4:3

### Prompt — Variante A (Primary)
```
editorial photograph of a person in a modern warehouse picking marketing materials from organized shelving, wearing dark professional clothing, warm overhead lighting, clean organized shelves with branded boxes and printed roll-ups visible, shallow depth of field with person in sharp focus, warm amber color temperature, professional corporate photography, no clutter, premium logistics facility, cinematic lighting similar to Apple product photography, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Prompt — Variante B (Detail Focus)
```
close-up shot of hands carefully placing branded printed materials into a premium shipping box, warehouse shelving blurred in warm bokeh background, directional warm lighting from above, clean organized workspace, professional fulfillment operation, shallow DOF, warm golden tones, editorial corporate photography style, film grain, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Prompt — Variante C (Wide Context)
```
medium wide shot of a premium fulfillment center interior, person pushing a cart between organized shelving rows containing marketing materials and printed goods, warm industrial lighting, polished concrete floor, everything meticulously organized, professional logistics photography, warm amber and brown tones, shallow depth of field, cinematic, no visible logos or brand names, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Negative Prompt
```
cartoon, illustration, messy, cluttered warehouse, cold fluorescent lighting, stock photo, posed smile, blue tint, neon, text, watermark
```

### Wichtig für Website-Einbindung
- Erscheint als 4:3 Card in einer Split-Section (links Bild, rechts Text)
- Hat ein rotes "FOTO #03" Badge oben links → Bild braucht dunklen Bereich oben links
- Neben dem Bild steht Fulfillment-Text → Bild sollte die Geschichte erzählen

---

## FOTO #04 — SHOP & ERP: B2B-Dashboard

**POSITION**: Split-Section links (reversed) (Aspect Ratio 4:3 Card)
**ZWECK**: Technologie und B2B-Commerce vermitteln. Digital, professionell, cool.
**TOOL**: Midjourney API oder FLUX AI
**ASPECT RATIO**: 4:3

### Prompt — Variante A (Primary)
```
editorial photograph of a large monitor displaying a clean B2B e-commerce dashboard with data visualizations and order management interface, modern minimalist office environment, cool blue-black ambient lighting mixed with warm desk lamp, shallow depth of field focused on the screen, keyboard and mouse in foreground slightly blurred, dark sophisticated color palette with blue and slate tones, professional corporate technology photography, cinematic, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Prompt — Variante B (Human Element)
```
over-the-shoulder shot of a professional reviewing a B2B shop dashboard on a widescreen monitor, modern dark office with blue ambient LED lighting, data charts and product catalog visible on screen, person wearing dark business attire only partially visible, warm desk lamp providing accent light, shallow DOF with screen in focus, cool blue and warm amber contrast, corporate technology editorial photography, cinematic, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Prompt — Variante C (Abstract/Detail)
```
close-up detail shot of a high-resolution monitor corner showing a clean data dashboard UI with graphs and metrics, reflection of office interior visible in screen glass, cool blue dominant color palette with subtle warm accent from nearby lamp, extremely shallow depth of field, abstract corporate technology aesthetic, premium, sophisticated, cinematic color grading, 8K photorealistic --ar 4:3 --v 6.1 --style raw
```

### Negative Prompt
```
cartoon, illustration, cluttered desk, bright fluorescent, stock photo, colorful UI, gaming setup, messy cables, text readable, watermark, logo
```

### Wichtig für Website-Einbindung
- Erscheint als 4:3 Card in einer reversed Split-Section
- Farblich bewusst anders als die warmen Bilder → kühle Blau-Schwarz-Töne
- Kontrast zu den warmen Fulfillment-Bildern → Tech-Kompetenz signalisieren
- Badge "FOTO #04" oben links → dunkler Bereich oben links

---

## FOTO #05 — TESTIMONIAL: Smartphone / Portal

**POSITION**: Testimonial Section (Full-Bleed, 500px min-height)
**ZWECK**: Kundenperspektive. Nahbar, cinematic, emotional.
**TOOL**: Midjourney API
**ASPECT RATIO**: 16:9

### Prompt — Variante A (Primary)
```
cinematic close-up of a hand holding a modern smartphone displaying a clean portal interface, shallow depth of field with phone screen sharp and background completely blurred into warm bokeh, warm golden ambient lighting, professional office environment suggested in blurred background, the hand is natural and relaxed, warm skin tones, cinematic color grading with amber highlights and deep shadows, editorial corporate photography, film grain texture, intimate and authentic feeling, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante B (Environment)
```
medium close-up of a professional holding a smartphone while sitting at a conference table, screen showing a dashboard portal with clean UI, shallow depth of field with phone in sharp focus, warm late afternoon light from nearby window, blurred colleagues in background suggesting teamwork, warm amber color temperature, corporate editorial photography style, cinematic, authentic workplace moment, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Prompt — Variante C (Abstract/Artistic)
```
artistic close-up of a smartphone held at slight angle, screen displaying a minimal clean dashboard interface, extreme shallow depth of field creating dreamy bokeh in warm golden tones, reflections of warm light visible on phone glass, no face visible only hand and phone, dark moody background with warm highlights, cinematic color grading, premium corporate photography, intimate perspective, film grain, 8K photorealistic --ar 16:9 --v 6.1 --style raw
```

### Negative Prompt
```
cartoon, illustration, stock photo pose, cold lighting, flash, visible brand logo on phone, text readable on screen, cluttered background, watermark
```

### Wichtig für Website-Einbindung
- Full-Bleed Background mit dunklem Overlay
- Zitat-Text (weiß) liegt links über dem Bild
- Bild sollte insgesamt eher dunkel sein → warme Highlights akzentuieren
- Emotionaler Moment → Authentizität ist wichtiger als technische Perfektion

---

## Zusammenfassung: Tool-Empfehlungen

| Foto | Empfohlenes Tool | Begründung |
|------|-----------------|------------|
| #01 Hero Warehouse | **Midjourney v6.1** | Beste cinematische Qualität für Architektur/Interiors |
| #02 W2P Tablet | **Midjourney v6.1** | Authentische Hands/Device-Darstellung |
| #03 Fulfillment Lager | **Midjourney v6.1** oder **FLUX** | Personen in Umgebung, beide gut |
| #04 B2B Dashboard | **FLUX AI** | Gute Screen/UI-Darstellung, scharfe Details |
| #05 Testimonial Phone | **Midjourney v6.1** | Bestes Bokeh und cinematischer Look |

## Reihenfolge der Generierung

1. **FOTO #01** zuerst — definiert den visuellen Ton für alles andere
2. **FOTO #05** als zweites — ähnlicher cinematic Look, Konsistenz prüfen
3. **FOTO #02** — Gastronomie-Setting, eigene Stimmung
4. **FOTO #03** — muss zu #01 passen (gleicher Warehouse-Charakter)
5. **FOTO #04** — bewusst anders (cool/tech), zum Schluss

## Nachbearbeitung

Alle generierten Bilder sollten folgende Nachbearbeitung durchlaufen:
- **Upscaling** via Midjourney Upscale oder FLUX Upscaler auf min. 3000px Breite
- **Color Grading Konsistenz** — alle Bilder auf gleiche Warm-Palette bringen
- **Zuschnitt** an die jeweilige Aspect Ratio (16:9 oder 4:3)
- **Kompression** für Web: WebP Format, ~200KB für Cards, ~500KB für Full-Bleed
