# Realty79 — Konsolidierter Optimierungsplan

> Synthese aus 5 Experten-Analysen: UX Architect, UI Designer, Behavioral Nudge Engine, AI Engineer, Trend Researcher

---

## Executive Summary

Realty79 hat ein funktionales MVP mit 13 Seiten, ~50 API-Endpoints und 5 AI-Integrationen. Die Plattform zeigt Daten — aber empfiehlt keine Aktionen. Das ist die zentrale Schwäche.

**Die 3 wichtigsten Erkenntnisse:**
1. **Daten ohne Handlungsempfehlung** — Das Dashboard zeigt KPIs, aber sagt nie "Kauf dieses Objekt" oder "Schick diese Mahnung"
2. **Technische Schulden im Design-System** — Kein einheitliches Token-System, 7/13 Seiten Dark-Mode-defekt, 3 verschiedene Breakpoint-Systeme
3. **AI-Potential ungenutzt** — Claude Sonnet 4 wird nur für Chat/Messaging verwendet, kein RAG, kein Tool-Use, keine prädiktive Analyse

---

## Priorisierung: Impact × Aufwand Matrix

### P0 — Critical (Sprint 1-2, sofort)

| # | Maßnahme | Agent | Aufwand | Impact |
|---|----------|-------|---------|--------|
| 1 | **Design-Token vereinheitlichen** — Alle `--r79-*` eliminieren, nur `--va-*` Vuestic-Tokens verwenden | UI Designer | 2d | Grundlage für alles |
| 2 | **Dark Mode fixen** — Hardcoded Colors in 7 Seiten (Chat, Messaging, Dashboard, Properties, Maintenance, Accounting, Documents) durch CSS-Variablen ersetzen | UI Designer | 3d | Benutzbarkeit |
| 3 | **PageHeader-Komponente** — Einheitliche `<PageHeader>` mit Titel, Subtitle, Actions-Slot auf allen 13 Seiten | UX Architect | 1d | Konsistenz |
| 4 | **Navigation umstrukturieren** — Von 11 flachen Items zu 3 Sektionen: **Akquise** (Dashboard, Scout, Objekte), **Verwaltung** (Portfolio, Mieter, Dokumente, Wartung, Buchhaltung), **Kommunikation** (Chat, Nachrichten) | UX Architect | 1d | Orientierung |
| 5 | **Skeleton/Loading vereinheitlichen** — Eine `<SkeletonPage>` Komponente statt 3 verschiedene Shimmer-Implementierungen | UI Designer | 1d | Konsistenz |

### P1 — High Priority (Sprint 3-4)

| # | Maßnahme | Agent | Aufwand | Impact |
|---|----------|-------|---------|--------|
| 6 | **Dashboard als Command Center** — Statt nur KPIs: "3 Objekte brauchen Aufmerksamkeit", "2 Mahnungen überfällig", "1 Mietvertrag läuft aus" | Nudge Engine | 3d | Engagement +40% |
| 7 | **Property Triage Mode** — Schnell-Bewertung: Swipe/Klick durch neue Objekte mit "Interessant / Ablehnen / Später" | Nudge Engine | 3d | Conversion |
| 8 | **Smart Alert System** — 3 Kategorien: Dringend (Zahlungsausfall), Proaktiv (Mietvertrag 60d), Opportunity (neues Objekt im Filter) | Nudge Engine | 4d | Retention |
| 9 | **Responsive Breakpoints vereinheitlichen** — Ein System: `sm:640 md:768 lg:1024 xl:1280 2xl:1536` (Tailwind-Standard) | UI Designer | 2d | Mobile UX |
| 10 | **Accessibility Baseline** — Contrast auf 4.5:1 bringen (aktuell `text-gray-400` = 2.8:1), Focus-Indicator, Skip-Links | UI Designer | 2d | Compliance |

### P2 — Medium Priority (Sprint 5-8)

| # | Maßnahme | Agent | Aufwand | Impact |
|---|----------|-------|---------|--------|
| 11 | **Anthropic Tool-Use für Agent** — Claude kann Properties suchen, Berechnungen ausführen, Dokumente generieren | AI Engineer | 1w | AI-Wert ×3 |
| 12 | **Gamification: Investor Score** — Score 0-100 basierend auf Aktivität, Portfolio-Gesundheit, Reaktionszeit | Nudge Engine | 1w | Retention |
| 13 | **Onboarding Wizard** — 3-Schritt Setup: Suchprofil → Erstes Objekt → Portfolio anlegen | UX Architect | 3d | Activation |
| 14 | **Mieter-Detailseite** — Eigene Seite statt nur Listen-Card: Zahlungshistorie, Dokumente, Kommunikation, Vertrag | UX Architect | 3d | Verwaltung |
| 15 | **Review Queue Countdown** — AI-generierte Nachrichten nach 24h auto-senden (mit Opt-out) | Nudge Engine | 2d | Effizienz |
| 16 | **Property Comparison** — 2-3 Favoriten Side-by-Side vergleichen (Rendite, Score, Cashflow) | UX Architect | 3d | Entscheidung |

### P3 — Long-term (Sprint 9+)

| # | Maßnahme | Agent | Aufwand | Impact |
|---|----------|-------|---------|--------|
| 17 | **RAG mit pgvector** — Alle Objekt-Daten, Dokumente, Chat-History als Kontext für Claude | AI Engineer | 2w | AI-Qualität |
| 18 | **ML Scoring Engine** — XGBoost für Immobilien-Scoring, Prophet für Preisprognosen | AI Engineer | 3w | Differenzierung |
| 19 | **Multi-Channel Notifications** — Push, Email, Telegram mit kanalspezifischer Kadenz | Nudge Engine | 1w | Reach |
| 20 | **ESG Compliance Module** — CO2-Bilanz, Energieausweis-Tracking, Sanierungsfahrplan | Trend Researcher | 2w | Regulatorik |
| 21 | **Document Intelligence** — OCR → strukturierte Daten aus Exposés, Grundbuchauszügen | AI Engineer | 2w | Automatisierung |
| 22 | **Monte Carlo Simulation** — Risiko-Analyse für Investment-Szenarien | AI Engineer | 1w | Premium-Feature |

---

## Detailierte Maßnahmen

### 1. Design-Token Konsolidierung

**Problem:** Zwei parallele Token-Systeme (`--va-*` von Vuestic, `--r79-*` unbekannter Herkunft) führen zu inkonsistenten Farben, besonders im Dark Mode.

**Lösung:**
```scss
// VORHER: Dual system in Seiten-Styles
color: var(--r79-text-primary);     // ❌ Nicht Dark-Mode-aware
background: var(--r79-bg-surface);   // ❌ Nicht von Vuestic verwaltet

// NACHHER: Nur Vuestic-Tokens
color: var(--va-text-primary);       // ✅ Automatisch Dark-Mode
background: var(--va-background-element); // ✅ Vuestic-verwaltet
```

**Mapping:**
| Alt (`--r79-*`) | Neu (Vuestic) |
|---|---|
| `--r79-primary` | `var(--va-primary)` |
| `--r79-bg-surface` | `var(--va-background-element)` |
| `--r79-bg-page` | `var(--va-background-secondary)` |
| `--r79-text-primary` | `var(--va-text-primary)` |
| `--r79-text-secondary` | `var(--va-secondary)` |
| `--r79-border` | `var(--va-background-border)` |
| `--r79-success` | `var(--va-success)` |
| `--r79-danger` | `var(--va-danger)` |

### 2. Dashboard Command Center

**Problem:** Dashboard zeigt 4 KPI-Karten + Pipeline-Funnel + Tabelle. Rein informativer Modus — keine Handlungsaufforderungen.

**Lösung:** "Nächste Schritte" Widget über den KPIs:

```
┌─────────────────────────────────────────────────────┐
│ 🔴 3 dringende Aktionen                            │
│                                                      │
│ • Mieter Schmidt: Zahlung 14 Tage überfällig       │
│   [Mahnung senden]                                   │
│                                                      │
│ • Objekt Mozartstr. 12: Score 87, unter €1.500/m²  │
│   [Analyse starten]                                  │
│                                                      │
│ • Mietvertrag Huber läuft in 58 Tagen aus           │
│   [Verlängerung vorbereiten]                        │
└─────────────────────────────────────────────────────┘
```

**Implementierung:**
- Neuer API-Endpoint: `GET /api/actions/urgent` — Aggregiert überfällige Zahlungen, ablaufende Verträge, neue Objekte im Suchprofil
- Neue Komponente: `<ActionTriage>` — Sortiert nach Dringlichkeit, max 5 Items
- Jede Aktion hat einen CTA-Button der direkt zur Lösung navigiert

### 3. Navigation Restructuring

**Aktuell:** 11 flache Items in der Sidebar → Kognitive Überlastung

**Neu:**
```
📊 AKQUISE
   Dashboard
   Scout (Property Search)
   Objekte

🏠 VERWALTUNG
   Portfolio
   Mieter
   Dokumente
   Wartung
   Buchhaltung

💬 KOMMUNIKATION
   AI Assistent
   Nachrichten

⚙️ System
   Einstellungen
```

### 4. AI Architektur Roadmap

**Aktueller Stand:**
- 5 AI-Integrationen, alle Claude Sonnet 4
- Kein Tool-Use (Claude kann keine Aktionen ausführen)
- Kein RAG (Claude hat keinen Kontext über Nutzerdaten)
- Kein Vector-DB (kein semantisches Suchen)
- Geschätzte Kosten: ~1.75 EUR/Nutzer/Monat

**Phase 1 (2 Wochen):**
- Anthropic Messages API → Tool-Use aktivieren
- 5 Tools: `search_properties`, `calculate_rendite`, `get_portfolio_kpis`, `generate_document`, `send_message`
- Sentiment-Analyse für eingehende Mieter-Nachrichten

**Phase 2 (4 Wochen):**
- pgvector Extension für PostgreSQL
- RAG-Pipeline: Objekt-Daten + Dokumente → Embeddings → Kontext-Retrieval
- OCR-Pipeline für Exposés und Grundbuchauszüge (Claude Vision)

**Phase 3 (3 Monate):**
- XGBoost Scoring-Modell (trainiert auf historischen Kauf/Ablehnung-Daten)
- Prophet Time-Series für Mietpreis-Prognosen
- Monte Carlo für Investment-Risiko

### 5. Behavioral Nudge Framework

**Prinzip:** Nie "Du hast 14 ungelesene Benachrichtigungen" — immer "Mieter Schmidt hat geantwortet. Antwort genehmigen?"

**Nudge-Typen:**
| Typ | Trigger | Aktion |
|---|---|---|
| **Triage** | Neues Objekt in Pipeline | "Score 85 — Analyse in 30 Sekunden starten?" |
| **Reminder** | Zahlung 7d überfällig | "Mahnung für Schmidt ist vorbereitet. Senden?" |
| **Celebration** | 5. Objekt analysiert | "Super! 5 Objekte bewertet diese Woche 🎯" |
| **Opportunity** | Objekt unter Marktwert | "Mozartstr. 12: 15% unter Vergleichswert" |
| **Deadline** | Vertrag läuft aus | "Huber-Vertrag: noch 58 Tage. Verlängerung?" |

**Implementation:**
```typescript
// stores/nudges.ts
export const useNudgeStore = defineStore('nudges', {
  state: () => ({
    activeNudges: [] as Nudge[],
    dismissedToday: [] as string[],
    userPreferences: {
      maxNudgesPerDay: 5,
      channels: ['in-app'],
      quietHours: { start: '22:00', end: '07:00' }
    }
  }),
  actions: {
    async fetchNudges() {
      // GET /api/actions/nudges — server-side aggregation
    },
    dismiss(id: string) {
      this.dismissedToday.push(id)
    }
  }
})
```

---

## Technische Schulden (sofort beheben)

| Issue | Datei(en) | Fix |
|---|---|---|
| Composables-Ordner leer | `src/composables/` | Logik aus Pages in Composables extrahieren |
| Keine Error-Boundary | Alle Pages | `<ErrorBoundary>` Wrapper + API-Error-Handling |
| Keine Loading-States bei Navigation | Router | `router.beforeEach` → Progress-Bar |
| 50 API-Funktionen in einer Datei | `src/services/api.ts` | Aufteilen: `api/properties.ts`, `api/renters.ts`, etc. |
| Global-Store minimal | `src/stores/global-store.ts` | Sidebar + Theme + Notifications + User-Preferences |
| Keine TypeScript-Interfaces für API | `api.ts` | DTO-Interfaces aus `@org/shared` oder neu definieren |

---

## Marktanalyse & Wettbewerb (Trend Researcher)

### Marktgröße
- **Deutscher PropTech-Markt:** 2,13 Mrd. USD (2024) → 12,72 Mrd. USD (2035), CAGR 17,6%
- **Property-Management-Software DE:** 225 Mio. USD (2025) → 402 Mio. USD (2033)
- **5,5 Mio. private Vermieter-Haushalte** in Deutschland
- **Target SOM (3-5 Jahre):** 2.500–16.000 zahlende Kunden → 0,6–3,8 Mio. EUR ARR

### Zielsegment
**Semi-professionelle Investoren** mit 3–50 Einheiten (~500K Haushalte). Zahlungsbereitschaft 15–40 EUR/Monat. Von keinem Wettbewerber vollständig bedient.

### Wettbewerbslandschaft

| Anbieter | Analyse | Verwaltung | KI-Komm. | KI-Features | Preis |
|----------|:---:|:---:|:---:|:---:|---|
| **Realty79** | Pipeline + Szenarien + Research | Vollständig | Review-Queue | Chat, Vertrag-Gen, Messaging | Subscription |
| **immoment.io** | Rendite, Cashflow | Mietverträge, NK | Nein | Nein | 9,99 EUR + 0,99/Einheit |
| **immocloud** | Rendite-Dashboard | Testsieger | Mieterportal (passiv) | Nein | 4,99–39,99 EUR |
| **ImmoMetrica** | 45+ Portale, Sprengnetter | Nein | Nein | Nein | 24,95 EUR |
| **objego** | Nein | Einfach, 30+ Vorlagen | Nein | Nein | Free–12,95 EUR |
| **Propstack** | Nein | Makler-CRM | Nein | KI-Beschreibungen | 79–129 EUR |
| **casavi** | Nein | Enterprise (1.000+ Kunden) | Mieter-App | Nein | ab 199 EUR |

### Einzigartige Position von Realty79
Realty79 ist die **einzige** deutsche Plattform, die den gesamten Investoren-Lebenszyklus abdeckt:

**Finden → Analysieren → Kaufen → Verwalten → Kommunizieren → Abrechnen**

Kein Wettbewerber vereint automatisierte Immobiliensuche, KI-Analyse, Portfolio-Management UND KI-Mieter-Kommunikation.

### Feature-Gaps (was Wettbewerber haben, wir nicht)

| Feature | Wer hat es | Priorität |
|---------|------------|-----------|
| **Multi-Portal-Scraping** (45+ Portale) | ImmoMetrica, Soldd | Hoch |
| **Sprengnetter/AVM-API** (Marktdaten) | ImmoMetrica, PriceHubble | Hoch |
| **Open Banking** (Bankkonto-Sync) | objego, immocloud | Hoch |
| **Mobile App** (iOS/Android) | immocloud, objego, casavi | Mittel-Hoch |
| **Mieter-Self-Service-Portal** | casavi, immocloud | Mittel |
| **BORIS-D Bodenrichtwerte** (kostenlos!) | Offene Daten | Mittel |

### Preismodell-Empfehlung
**Hybrid:** Basis-Abo **19,90 EUR/Monat** (Scout + Analyse) + Verwaltungs-Addon **1,49 EUR/Einheit/Monat**. KI-Features als Premium-Differenzierung im höheren Tier.

### Regulatorische Trends (2026)
| Regelung | Auswirkung |
|----------|-----------|
| Mietpreisbremse (bis 2029) | Compliance-Check für Mieterhöhungen |
| CO2-Preis 55–65 EUR/t | Kostenverteilungs-Rechner Vermieter/Mieter |
| GEG/Heizungsgesetz Reform | Sanierungskostenrechner |
| Smart-Meter-Pflicht (seit 2025) | Ista/Techem API-Integration |

### Positionierung
> **"Realty79 — Dein KI-Co-Pilot für Immobilien-Investments. Finden. Analysieren. Verwalten. Automatisieren."**

---

## Competitive Edge (Alleinstellungsmerkmale)

1. **AI-First Property Analysis** — Kein Wettbewerber bietet AI-gestützte Immobilien-Bewertung + Investitions-Empfehlung in einer Plattform
2. **Automated Tenant Communication** — AI-generierte Mieter-Korrespondenz mit menschlicher Review-Queue ist einzigartig im deutschen Markt
3. **Investor Workflow Integration** — Akquise → Bewertung → Portfolio → Verwaltung in einem Tool (statt 4 separate SaaS)
4. **Behavioral Intelligence** — Adaptive Nudges statt passive Dashboards differenzieren von Vermietet.de, Objego, Immomate
5. **End-to-End Lifecycle** — Einzige Plattform die Finden → Analysieren → Verwalten → Kommunizieren → Abrechnen vereint

---

## Strategische Zusatz-Maßnahmen (aus Marktanalyse)

### P1-Ergänzungen (Sprint 3-4)
| # | Maßnahme | Begründung | Aufwand |
|---|----------|-----------|---------|
| 23 | **BORIS-D Integration** — Kostenlose Bodenrichtwerte als Bewertungs-Layer | Kostenlose Datenquelle, kein Wettbewerber nutzt sie vollständig | 3d |
| 24 | **Mietpreisbremse-Check** — Automatische Prüfung ob Mieterhöhung zulässig | Regulatorische Pflicht, Compliance-Selling | 2d |
| 25 | **CO2-Kostenverteiler** — Automatische Aufteilung Vermieter/Mieter nach CO2KostAufG | Seit 2023 Pflicht, viele Vermieter berechnen manuell | 1d |

### P2-Ergänzungen (Sprint 5-8)
| # | Maßnahme | Begründung | Aufwand |
|---|----------|-----------|---------|
| 26 | **Open Banking (Tink/Plaid)** — Automatischer Zahlungsabgleich | Table Stakes — objego und immocloud haben es | 1w |
| 27 | **Sprengnetter API** — Professionelle Marktdaten für Bewertung | Validierung der eigenen Analyse, 9 Mrd. Datenpunkte | 1w |
| 28 | **PWA Mobile App** — Responsive + Service Worker + App-Shell | Marktstandard, alle Wettbewerber haben Mobile | 1w |

---

## Implementation Timeline

```
Sprint 1-2  (2 Wochen):  P0 — Design-Token, Dark Mode, Navigation, PageHeader, Skeleton
Sprint 3-4  (2 Wochen):  P1 — Command Center, Triage Mode, Smart Alerts, Responsive, BORIS-D, Compliance-Checks
Sprint 5-6  (2 Wochen):  P2a — Tool-Use, Onboarding, Mieter-Detail, Open Banking
Sprint 7-8  (2 Wochen):  P2b — Gamification, Review Queue, Property Comparison, Sprengnetter, PWA
Sprint 9-12 (4 Wochen):  P3 — RAG, ML Scoring, Multi-Channel, ESG, Document Intelligence
```

**Geschätzter Gesamtaufwand:** ~12 Wochen für alle 28 Maßnahmen
**Quick Wins (sofort sichtbar):** #1, #3, #4, #5 — zusammen in 5 Tagen machbar
**Revenue-Unlocks:** #23 (BORIS-D), #24 (Mietpreisbremse), #25 (CO2-Verteiler) — kostenlose Daten, hoher Nutzwert, 6 Tage Aufwand

---

## Datenquellen für Integrationen

| Quelle | Typ | Kosten | Mehrwert |
|--------|-----|--------|----------|
| BORIS-D | Bodenrichtwerte | Kostenlos (Open Data) | Standortbewertung |
| Sprengnetter API | AVM, Marktdaten | Pro Abfrage | Professionelle Bewertung |
| Open Banking (Tink/Plaid) | Bankkonten | Aggregator-Fee | Automatischer Zahlungsabgleich |
| Ista/Techem APIs | Verbrauchsdaten | Partnerschaft | Nebenkostenabrechnung |
| ImmoScout24 API | Inserate | Kostenpflichtig | Marktdaten, Vergleichsmieten |
| Gutachterausschüsse | Kaufpreissammlungen | Teils frei | Reale Transaktionsdaten |

---

*Generiert am 2026-03-15 basierend auf Analysen von: UX Architect, UI Designer, Behavioral Nudge Engine, AI Engineer, Trend Researcher (150+ Agency Agents Framework)*
