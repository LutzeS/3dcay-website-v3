#!/usr/bin/env python3
"""
3DCAY Intelligence Agent
========================
Recherchiert aktuelle KI-News via Claude API + WebSearch,
bereitet sie bilingual (DE/EN) auf und aktualisiert ki-news.json.

Verwendung:
  python3 3dcay-intelligence-agent.py --count 4 --output ki-news.json
  python3 3dcay-intelligence-agent.py --topics "EU AI Act, LLM Updates"

Voraussetzungen:
  pip install anthropic
  export ANTHROPIC_API_KEY="sk-ant-..."
"""

import argparse
import json
import os
import sys
from datetime import datetime, date

try:
    import anthropic
except ImportError:
    print("Fehler: 'anthropic' SDK nicht installiert.")
    print("Installiere mit: pip install anthropic")
    sys.exit(1)


# ── Konfiguration ──────────────────────────────────────────────

DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
DEFAULT_COUNT = 4
DEFAULT_MAX_ITEMS = 8
DEFAULT_OUTPUT = "ki-news.json"

RESEARCH_TOPICS = [
    "Enterprise AI und B2B-Commerce Automatisierung",
    "Neue KI-Modelle und Foundation Models",
    "KI-Regulierung Europa (EU AI Act)",
    "Multimodale KI-Pipelines und Content-Generierung",
    "Predictive Analytics im Commerce",
    "Agentic AI und autonome Systeme",
    "KI-Infrastruktur und Cloud-Plattformen",
]

SOURCE_LABELS = [
    "3DCAY Intelligence Research",
    "3DCAY Intelligence Lab",
    "3DCAY Intelligence Regulatory",
    "3DCAY Intelligence Analytics",
    "3DCAY Intelligence Trends",
]

SYSTEM_PROMPT = """Du bist der 3DCAY Intelligence Research Agent. Deine Aufgabe ist es,
aktuelle und relevante KI-Neuigkeiten zu recherchieren und für ein Enterprise-B2B-Publikum
aufzubereiten.

WICHTIG:
- Recherchiere AKTUELLE Nachrichten (letzte 2-4 Wochen)
- Fokus auf Enterprise-relevante KI-Themen
- Jeder Eintrag muss bilingual sein (Deutsch + Englisch)
- Schreibe professionell, kompakt, sachlich
- Keine Marketing-Sprache, sondern fundierte Einordnung
- Jede Summary sollte 1-2 Sätze umfassen

Du MUSST das web_search Tool verwenden, um aktuelle Informationen zu finden.
Suche nach mehreren verschiedenen Themen, um eine breite Abdeckung zu gewährleisten.

Antworte AUSSCHLIESSLICH mit validem JSON im folgenden Format:
[
  {
    "date": "YYYY-MM-DD",
    "category": { "de": "Kategorie DE", "en": "Category EN" },
    "title": { "de": "Titel auf Deutsch", "en": "Title in English" },
    "summary": { "de": "Zusammenfassung auf Deutsch.", "en": "Summary in English." },
    "source": "3DCAY Intelligence ..."
  }
]

Kategorien zur Auswahl:
- Enterprise KI / Enterprise AI
- Infrastruktur / Infrastructure
- Technologie / Technology
- Analyse / Analysis
- Regulierung / Regulation
- Modelle / Models
- Automatisierung / Automation

Source-Labels zur Auswahl:
- 3DCAY Intelligence Research
- 3DCAY Intelligence Lab
- 3DCAY Intelligence Regulatory
- 3DCAY Intelligence Analytics
- 3DCAY Intelligence Trends
"""


def load_existing_news(filepath):
    """Lade bestehende ki-news.json, falls vorhanden."""
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"⚠ Warnung: Konnte {filepath} nicht lesen: {e}")
    return []


def save_news(filepath, news_items):
    """Speichere News als JSON."""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(news_items, f, ensure_ascii=False, indent=2)
    print(f"✓ {len(news_items)} Einträge gespeichert in {filepath}")


def validate_news_item(item):
    """Prüfe ob ein News-Eintrag das richtige Schema hat."""
    required_keys = {"date", "category", "title", "summary", "source"}
    if not required_keys.issubset(item.keys()):
        return False
    for bilingual_key in ("category", "title", "summary"):
        if not isinstance(item[bilingual_key], dict):
            return False
        if "de" not in item[bilingual_key] or "en" not in item[bilingual_key]:
            return False
    # Datum validieren
    try:
        datetime.strptime(item["date"], "%Y-%m-%d")
    except ValueError:
        return False
    return True


def merge_news(existing, new_items, max_items):
    """Merge neue News mit bestehenden, entferne Duplikate und limitiere."""
    # Deduplizierung über Titel (DE)
    existing_titles = {item["title"]["de"] for item in existing}
    unique_new = [n for n in new_items if n["title"]["de"] not in existing_titles]

    # Neue zuerst, dann bestehende
    merged = unique_new + existing

    # Nach Datum sortieren (neueste zuerst)
    merged.sort(key=lambda x: x["date"], reverse=True)

    # Auf max_items begrenzen
    return merged[:max_items]


def research_news(count, topics=None, model=DEFAULT_MODEL):
    """Recherchiere News via Claude API mit WebSearch."""
    client = anthropic.Anthropic()

    topic_str = ", ".join(topics or RESEARCH_TOPICS[:5])
    today = date.today().isoformat()

    user_prompt = f"""Recherchiere {count} aktuelle KI-Neuigkeiten (Stand: {today}).

Themenfelder: {topic_str}

Nutze web_search um aktuelle Nachrichten zu finden. Suche nach mindestens
{count} verschiedenen Themen. Verwende mehrere Suchanfragen.

Antworte NUR mit dem JSON-Array — kein Markdown, keine Erklärungen."""

    print(f"🔍 Recherchiere {count} News zu: {topic_str}")
    print(f"   Modell: {model}")
    print()

    # API-Call mit WebSearch Tool
    response = client.messages.create(
        model=model,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        tools=[
            {
                "type": "web_search_20250305",
                "name": "web_search",
                "max_uses": count * 3,
            }
        ],
        messages=[{"role": "user", "content": user_prompt}],
    )

    # Extrahiere den Text-Output (nach Tool-Use)
    json_text = None
    for block in response.content:
        if block.type == "text":
            text = block.text.strip()
            # JSON aus eventueller Markdown-Formatierung extrahieren
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1])
            json_text = text
            break

    if not json_text:
        print("✗ Keine Textantwort von Claude erhalten.")
        print(f"  Response: {response.content}")
        return []

    # JSON parsen
    try:
        news_items = json.loads(json_text)
    except json.JSONDecodeError as e:
        print(f"✗ JSON-Parsing fehlgeschlagen: {e}")
        print(f"  Roher Output:\n{json_text[:500]}")
        return []

    if not isinstance(news_items, list):
        print("✗ Erwartetes JSON-Array, erhalten:", type(news_items))
        return []

    # Validieren
    valid = []
    for i, item in enumerate(news_items):
        if validate_news_item(item):
            valid.append(item)
        else:
            print(f"  ⚠ Eintrag {i+1} hat ungültiges Schema, übersprungen")

    print(f"✓ {len(valid)} valide News-Einträge recherchiert")
    return valid


def main():
    parser = argparse.ArgumentParser(
        description="3DCAY Intelligence Agent — KI-News-Recherche",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  %(prog)s                              # 4 News recherchieren, ki-news.json aktualisieren
  %(prog)s --count 6 --max-items 10     # 6 neue News, max 10 behalten
  %(prog)s --topics "EU AI Act"         # Spezifisches Thema recherchieren
  %(prog)s --dry-run                    # Nur recherchieren, nicht speichern
        """,
    )
    parser.add_argument(
        "--count",
        type=int,
        default=DEFAULT_COUNT,
        help=f"Anzahl neuer News (default: {DEFAULT_COUNT})",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        help=f"Pfad zur ki-news.json (default: {DEFAULT_OUTPUT})",
    )
    parser.add_argument(
        "--max-items",
        type=int,
        default=DEFAULT_MAX_ITEMS,
        help=f"Max. Einträge behalten (default: {DEFAULT_MAX_ITEMS})",
    )
    parser.add_argument(
        "--topics",
        type=str,
        default=None,
        help="Komma-getrennte Themen (überschreibt Defaults)",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Claude-Modell (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Nur recherchieren, nicht speichern",
    )

    args = parser.parse_args()

    # API-Key prüfen
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("✗ ANTHROPIC_API_KEY nicht gesetzt.")
        print("  export ANTHROPIC_API_KEY='sk-ant-...'")
        sys.exit(1)

    # Topics parsen
    topics = None
    if args.topics:
        topics = [t.strip() for t in args.topics.split(",")]

    print("═" * 50)
    print("  3DCAY Intelligence Agent")
    print("═" * 50)
    print()

    # Recherchieren
    new_items = research_news(
        count=args.count, topics=topics, model=args.model
    )

    if not new_items:
        print("\n✗ Keine News recherchiert. Abbruch.")
        sys.exit(1)

    # Preview
    print()
    for i, item in enumerate(new_items, 1):
        print(f"  [{i}] {item['date']} | {item['category']['de']}")
        print(f"      {item['title']['de']}")
        print(f"      → {item['source']}")
        print()

    if args.dry_run:
        print("──── DRY RUN — Nichts gespeichert ────")
        print(json.dumps(new_items, ensure_ascii=False, indent=2))
        return

    # Merge & Save
    existing = load_existing_news(args.output)
    merged = merge_news(existing, new_items, args.max_items)
    save_news(args.output, merged)

    print()
    print(f"═ Fertig: {len(new_items)} neue + {len(existing)} bestehende")
    print(f"  → {len(merged)} Einträge in {args.output}")


if __name__ == "__main__":
    main()
