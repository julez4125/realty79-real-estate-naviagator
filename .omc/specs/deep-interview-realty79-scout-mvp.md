# Deep Interview Spec — Realty79 Scout-MVP

## Metadata
- **Interview ID:** realty79-scout-mvp-2026-04-26
- **Rounds:** 13 effektive (mit Re-Asks Block 7 + Block 8)
- **Final Ambiguity:** **12%** (Threshold: 20%)
- **Type:** Brownfield (Nx-Monorepo bestehend)
- **Generated:** 2026-04-26
- **Status:** PASSED
- **Initial Context Summarized:** No (initial brief war prompt-safe)
- **Source Plan:** `.omc/plans/realty79-roadmap.md`

## Clarity Breakdown

| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.85 | 0.35 | 0.298 |
| Constraint Clarity | 0.92 | 0.25 | 0.230 |
| Success Criteria | 0.88 | 0.25 | 0.220 |
| Context Clarity | 0.88 | 0.15 | 0.132 |
| **Total Clarity** | | | **0.880** |
| **Ambiguity** | | | **0.120** |

---

## Goal

Realty79 wird zur **AI-gestützten Scout-Plattform** für lukrative Mietobjekte mit angeschlossenem Bestandsmanagement. **Scout-First**: M2 (Scout-Pipeline) und M3 (AI-Research) gehen vor M1 (Verwaltung). Der MVP liefert binnen 4–8 Wochen einen funktionierenden Scout-Pfad: Immometrica-CSV-Export → Composite-Score-Filter → AI-Detail-Research mit Vision → Cashflow-Cockpit (App-nativ) → optionaler Broker-E-Mail-Outreach (L3, opt-in pro Suche).

---

## Constraints

- **Stack-Lock:** Nx 22 Monorepo, NestJS 11 (`apps/api`), Vue 3 + Vuestic + Pinia (`apps/web-vue`), Prisma + Postgres 16, Redis 7 + BullMQ, `libs/shared` mit `ImmocationCalculator`/`scoring-engine`/`pipeline-filter`.
- **Frontend:** Vue ist Single-Source-of-Truth. **Empfehlung: `apps/web` (Angular) löschen**, sofern keine Mobile-Native-Pläne mit Ionic. Final-Confirm vor M0.
- **Multi-Tenancy:** **Single-Tenant heute, Multi-Tenant-prepared** — neue Models bekommen `tenantId` als optionales Feld + Index, aber kein Code-Pfad-Guard bis SaaS-Pivot.
- **Autonomie:** Konfigurierbar pro `SavedSearch` als `autonomyLevel` Enum:
  - **L1 Recommend-only** (Default): Agent schlägt vor, User klickt jeden Schritt.
  - **L2 Auto-Research**: Detail-Research+Vision+Cashflow vollautomatisch, E-Mail bleibt Draft.
  - **L3 Auto-Outreach**: voll inkl. Broker-Mail-Versand, mit Hard-Caps (max. N Mails/Tag, nur bei Score ≥ X).
- **LLM-Provider:** Claude (Anthropic) als One-Stop. Sonnet 4.6 für Reasoning+Tool-Use, Claude Vision für Bildanalyse. Single SDK-Layer in `libs/integrations/llm/anthropic-client.ts`.
- **LLM-Budget:** **Per-Run-Limit** (€-Cap pro `SavedSearch`-Run als Pflichtfeld in `PipelineConfig`), **kein** Monats-Hard-Cap. Hard-Stop bei Überschreitung. Cost-Tracking in `ScrapeLog.tokenCostEur`.
- **Datenpfad Immometrica:** **CSV/PDF-Export via Playwright Auto-Login + Click-Flow**. Keine Live-DOM-Scraping. Single-Browser-Session liefert auch Standortdaten + KPIs (Multi-Purpose-Driver).
- **Detail-Scraping (linked platforms):** Stealth-Mode-Playwright + Auto-Fallback auf Residential-Proxy-Pool (Bright Data Default). Block-Detection-Heuristik im Scraper.
- **Standortdaten:** Mix-Strategie. Primär aus Immometrica (selbe Session). Sekundär: Destatis/Regiostat (kostenlos, Bevölkerung) + F+B oder ImmoScout24 (paid Mietspiegel, hinter Feature-Flag).
- **E-Mail-Stack:** **Eigenes SMTP/IMAP auf eigener Infra** (Postfix oder Haraka). DKIM/SPF/DMARC + statische IP + Reverse-DNS. **Reputation-Warmup ~2-4 Wochen** parallel zur Implementierung.
- **Excel-Parität:** **Vollständig 1:1** — alle Tabs inkl. Sensitivität, Stresstest, Vergleichsobjekte. Cent-genau über 30 Jahre Projection. App ersetzt Excel komplett.
- **Hosting:** **Self-Hosted Hetzner-VM** (CX/CCX, ~20–60 €/M). Docker Compose. MinIO für Dokumente. Statische IP für SMTP. Backup: pgBackRest täglich + S3-kompatibler Off-Site-Sync, Filesystem-Snapshot wöchentlich.
- **Team:** Solo, OMC AI-Agents als Implementierungs-Team. Sprint = 1 Woche. Reviews/Architektur by user. Σ ~3–4 Monate Kalenderzeit für M0–M6.

---

## Non-Goals (explizit ausgeschlossen für MVP)

- **Native Mobile-App** (auch nicht Ionic) — Vue PWA reicht.
- **Multi-Provider-LLM-Routing** (Tier-Routing OpenAI/Gemini/Claude) — single Provider, Abstraktion erlaubt späteres Splitting ohne Refactor.
- **Self-Hosted-LLM** (Ollama/Llama) — nicht prod-reif für Vision+Tool-Use Requirements.
- **Live-DOM-Scraping von Immometrica** — nur CSV/PDF-Export-Pfad.
- **API-Only-Plattformen** ohne Browser-Coverage — wir akzeptieren Coverage-Verlust nicht.
- **Automatische OCR/Beleg-Klassifikation** im MVP — Phase-2-Item nach M3.
- **Echte SaaS-Funktionalität** (Tenant-Self-Signup, Billing) — Schema-Vorbereitung ja, Code-Pfad nein.
- **Komplexer State-Workflow** für Maintenance (Eskalations-Stufen, Multi-Approver) — einfaches 3-Status-Modell reicht.

---

## Acceptance Criteria

### MVP-Gate (M0 + M2 + M3 minimum)

- [ ] **AC-1 Scout-Pipeline End-to-End:** User erstellt eine `SavedSearch` mit Suchort, Umkreis, Preisrange, Min-Score-Schwelle. Innerhalb 24 h erscheinen Treffer aus Immometrica-Export in Phase-1, automatisch gefiltert auf Composite-Score (4 Faktoren).
- [ ] **AC-2 Composite-Score:** Phase-1-Score basiert auf 4 Faktoren mit konfigurierbaren Gewichten (Default 25/25/25/25):
  1. Bruttomietrendite (Kaltmiete ÷ Kaufpreis)
  2. Cashflow-Indikator (Miete − Tilgung @ 80% LTV / 4% Zins)
  3. Lage-Score (Mietspiegel + Bevölkerungstrend pro PLZ)
  4. Preis-pro-m² vs. lokaler Median
- [ ] **AC-3 Detail-Research auto-trigger:** Properties über Phase-1-Schwelle → automatisch in Phase-2-Queue. Detail-Research zieht Inserat-Volltext + alle Bilder von verlinkter Plattform (ImmoScout24/eBay-K/etc.) via Stealth-Browser, optional Proxy-Fallback.
- [ ] **AC-4 Vision-Analyse:** Pro Property mind. 5 Fotos durch Claude Vision → strukturiertes JSON in `PropertyPhoto.visionAnalysis` mit Zustand, Renovierungsbedarf, Schäden, Lichtverhältnisse, Confidence-Score.
- [ ] **AC-5 Cashflow-Berechnung:** `DeepResearch` füllt automatisch `KeyMetrics` (30-Jahre-Projection) via `ImmocationCalculator`. Werte sichtbar im Vue-Cockpit.
- [ ] **AC-6 Per-Run-Budget:** Jeder `SavedSearch`-Run hat €-Cap. Bei Erreichen → Hard-Stop, Run wird mit Status `budget_exceeded` in `ScrapeLog` markiert.

### Excel-Parität (M4)

- [ ] **AC-7 Cent-Genauigkeit:** Parity-Test-Suite mit ≥5 Excel-Fixtures. App-Berechnung weicht <0.01 € pro KPI über 30-Jahre-Projection ab.
- [ ] **AC-8 Volle Tab-Reproduktion:** Sensitivitäts-Tabellen, Stresstest, Vergleichsobjekte sind in Vue-UI navigierbar; Werte stimmen mit Excel-Vorlage überein.

### Broker-Outreach (M5)

- [ ] **AC-9 SMTP-Reputation:** Test-Domain liefert SPF/DKIM/DMARC alle "PASS"; Mail-Tester-Score ≥9/10 nach Warmup.
- [ ] **AC-10 Auto-Outreach:** Im L3-Modus versendet Agent automatisch Anfragen-Templates an Makler-E-Mail; Anhänge eingehender Replies werden auto-zugeordnet zur Property; Reply-Klassifikation ≥90% korrekt auf 50 Test-Mails.

### Quality Gates

- [ ] **AC-11 CI grün:** `pnpm nx affected -t lint test build typecheck` auf jedem PR.
- [ ] **AC-12 E2E-Smoketest:** `apps/api-e2e` enthält mind. einen Happy-Path-Test pro Milestone.
- [ ] **AC-13 Multi-Tenant-Ready:** Alle neuen Tabellen haben `tenantId`-Spalte + Index, auch wenn nicht enforced.

---

## Assumptions Exposed & Resolved

| Assumption | Wie hinterfragt | Resolution |
|------------|-----------------|-----------|
| "Beide Use-Cases parallel zu starten ist sinnvoll" | Welcher Pain ist heute akut? | **Scout-First**, Verwaltung minimiert |
| "Multi-Tenancy entscheiden wir später" | `Tenant`-Tabelle existiert, wird sie genutzt? | **Schema-prepared, code-deferred** |
| "Vollautomatischer Agent ist der Default" | Contrarian: was wenn nichts auto-läuft? | **Konfigurierbar pro Suche, Default L1** |
| "Wir brauchen Live-Scraping für Immometrica" | Welcher Daten-Pfad existiert wirklich? | **CSV/PDF-Export-Pfad, Browser nur für Trigger** |
| "Multi-LLM-Provider von Tag 1" | Brauchen wir das für MVP? | **Claude One-Stop**, Abstraktions-Layer für späteren Split |
| "Monats-Budget-Cap als LLM-Hardlimit" | Granularität egal? | **Per-Run-Cap** (sauberere Pipeline-Constraint) |
| "Detail-Scraping ist universell ToS-konform" | Simplifier: kann es einfacher sein? | **Stealth + optionaler Proxy-Fallback**; Hybrid-Pfad |
| "Mietspiegel via teurem API-Provider" | Können öffentliche Quellen reichen? | **Mix**: Immometrica selbst + Destatis (frei) + F+B optional |
| "Eigenes SMTP ist Overkill, Postmark reicht" | DSGVO-Implikationen + Reputation-Aufwand? | **Eigenes SMTP** wegen voller Kontrolle bei Outreach |
| "App ersetzt Excel komplett" | Welche Tabs wirklich relevant? | **Vollständig 1:1** inkl. Sensitivität (User-Choice in Re-Ask) |
| "Managed Hosting (Fly/Render)" | Kompatibel mit eigenem SMTP? | **Self-Hosted Hetzner** wegen statischer IP für SMTP |
| "Team von 2-3 Devs" | Realistisch für Solo-Side-Project? | **Solo + OMC AI-Team-Modi** als Force-Multiplier |

---

## Technical Context (Brownfield-Findings)

- **`apps/api`** (NestJS 11): 23 Module gewired in `apps/api/src/app/app.module.ts:29-66`. Scout/AI/Research/Vision/Agent + alle BullMQ-Processoren = **0-Byte-Stubs**. JWT-Auth gesetzt, Swagger unter `/api/docs`.
- **`apps/web-vue`**: Aktive Frontend (~3000 LOC). Pinia-Stores, modulare API-Clients in `apps/web-vue/src/services/api/*`. Routen: search, properties, portfolio, renters, documents, maintenance, accounting, chat, messaging, settings.
- **`apps/web` (Angular 21)**: 90% Boilerplate, ~991 LOC, kein State-Mgmt, kein API-Client. **→ Streichen empfohlen.**
- **`libs/shared`**: `ImmocationCalculator`, `scoring-engine`, `pipeline-filter` bereits vorhanden — Kern für M4 + Composite-Score.
- **Prisma Schema**: 30+ Models, 548-Line Init-Migration. Felder bereits da: `Property`, `SavedSearch.immoMetricaId`, `PipelineConfig`, `Analysis`, `DeepResearch.zustandScore/lageScore/oepnvScore/risikoScore`, `PropertyPhoto`, `AgentConversation`/`AgentMessage`, `Tenant` (für SaaS-Vorbereitung).
- **BullMQ**: Wired aber 0 Processors implementiert.
- **Externe Integrationen**: ANTHROPIC_API_KEY in `.env` als Placeholder (unused). Telegram/Twilio ENVs vorhanden. **Kein** Playwright-Wiring, **kein** SMTP/IMAP, **kein** Immometrica-Adapter.
- **Sprint-Marker im Code**: `app.module.ts` Lines 49-63 labelt Sprint 5 (Verwaltung), 6 (AI Assist), 8 (Advanced Verwaltung), 9 (SaaS).

---

## Ontology (Key Entities, final)

| Entity | Type | Key Fields | Relationships |
|--------|------|-----------|---------------|
| `Property` | core | sourceUrl, kaufpreis, miete, baujahr, m², plz, status (Phase 1/2/3) | hasMany: PropertyPhoto, Analysis, DeepResearch, AgentConversation; belongsTo: SavedSearch, Tenant |
| `SavedSearch` | core | suchort, umkreis, preisRange, minScore, autonomyLevel (L1/L2/L3), runBudgetEur, scoringWeights | hasMany: Property, ScrapeLog, AgentConversation |
| `PipelineConfig` | core | phase1Threshold, phase2Threshold, scoringRules JSON | belongsTo: SavedSearch |
| `Analysis` | core | rendite, cashflow1y, lageScore, pricePerSqmRatio, compositeScore, phase | belongsTo: Property |
| `DeepResearch` | core | zustandScore, lageScore, oepnvScore, risikoScore, infrastruktur JSON, erkannteProbleme JSON, sourcesList JSON | belongsTo: Property |
| `PropertyPhoto` | core | url, hash, visionAnalysis JSON, confidence | belongsTo: Property |
| `Scenario` | core | financingParams, assumptions, kostenConfig, keyMetrics JSON, yearProjection JSON | belongsTo: Property, Property hasMany |
| `Unit` | management | wohnflaeche, zimmer, status (vermietet/leer) | belongsTo: Property; hasMany: Lease, Meter |
| `Lease` | management | start, ende, kaltmiete, nebenkosten, kaution | belongsTo: Unit, Renter |
| `Renter` | management | name, kontakt | hasMany: Lease, RenterMessage |
| `Payment` | management | amount, date, status (paid/overdue) | belongsTo: Lease |
| `Document` | management | type, s3Key, ocrJSON | belongsTo: Property/Unit/Lease |
| `MaintenanceTask`/`Ticket` | management | status, prio, beschreibung | belongsTo: Property |
| `Tenant` | infra | name, planTier (für späteres SaaS) | hasMany: alle scoped Models |
| `AgentConversation` | ai | savedSearchId, propertyId, status | hasMany: AgentMessage |
| `AgentMessage` | ai | role (user/agent/tool), content, toolName, toolArgs JSON, toolResult JSON | belongsTo: AgentConversation |
| `RenterConversation`/`Message` | ai | mode (manual/auto), kanal (mail/sms) | belongsTo: Renter |
| `MailMessage` | infra | direction (in/out), smtpHeaders, classification (docs/info/off-topic/negative) | links zu Property + AgentConversation |
| `ImmometricaSession` | integration | sessionCookies, lastLoginAt, exportLastFetchedAt | runtime-only oder cached |
| `ScrapeLog` | observability | savedSearchId, durationMs, hitCount, tokenCostEur, status | belongsTo: SavedSearch |
| `AnthropicClient` | integration | model, toolSchemas | code-only |
| `ScoringRule` | config | factor, weight, threshold | belongsTo: PipelineConfig |

**Total: 22 Entitäten** (rund 30 wenn man alle aus Prisma-Schema mitzählt). **Stabilität konvergiert seit Runde 7.** Domain-Modell stabil.

### Ontology Convergence

| Round | Entity Count | New | Stable | Stability |
|-------|--------------|-----|--------|-----------|
| 1 | 8 | 8 | – | N/A |
| 2 | 9 | 1 | 8 | 89% |
| 3 | 9 | 0 | 9 | 100% |
| 4 | 10 | 1 (AutonomyLevel) | 9 | 90% |
| 5 | 11 | 1 (CSVImportJob, später integriert in ImmometricaSession) | 10 | 91% |
| 6 | 12 | 1 (ImmometricaSession) | 11 | 92% |
| 7 | 13 | 1 (AnthropicClient) | 12 | 92% |
| 8 | 14 | 1 (BudgetCap als Feld in PipelineConfig) | 13 | 93% |
| 9 | 14 | 0 (4 Score-Faktoren als Felder in ScoringRule) | 14 | 100% |
| 10 | 15 | 1 (ProxyAdapter integriert in Scraper) | 14 | 93% |
| 11 | 15 | 0 | 15 | 100% |
| 12 | 16 | 1 (MailMessage) | 15 | 94% |
| 13 (final) | 22 | – | – | converged |

---

## Outstanding Information (nicht-blockierend, in Implementation klärbar)

- [ ] Bestandsgröße quantifizieren (Anzahl Properties/Units/Leases heute) — Info für M1-Sizing.
- [ ] Angular-App final löschen — Empfehlung steht, User-Confirm vor M0.
- [ ] Score-Faktor-Gewichte: Default 25/25/25/25 kann pro `SavedSearch` getuned werden, MVP-Defaults klären sich aus den ersten Runs.
- [ ] Score-Faktor-Schwellen: Lukrativ-Mindest-Score wird empirisch aus den ersten 50 Treffern kalibriert.
- [ ] Mietspiegel-Provider final (Destatis-only oder + F+B): Decision nach M3-Spike, sobald klar ob Destatis allein reicht.
- [ ] Proxy-Provider final (Bright Data vs. Oxylabs vs. IPRoyal): Decision wenn erste Block-Erkennung im M3-PoC stattfindet.
- [ ] Excel-Datei `immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx` Tab-Struktur explizit dokumentieren — als M4.0 Reverse-Engineering-Task.
- [ ] DSGVO-Templates für Broker-Outreach juristisch prüfen — vor M5 Auto-Send-Aktivierung.
- [ ] Hetzner VM-Sizing: Start mit CCX13/CCX23 (3-4 vCPU, 8-16 GB RAM) für API+Worker+Postgres+Redis-Co-Location, Skalierung später.

---

## Interview Transcript

<details>
<summary>13 Runden + 2 Re-Asks (Block 7 Excel-Parität, Block 8 Hosting)</summary>

### Runde 1 — MVP-Fokus
**Q:** Verwaltung-First, Scout-First, beides parallel, oder erst Foundation?
**A:** **Scout-First.**
**Ambiguität:** 64%

### Runde 2 — Lukrativ-Filter
**Q:** Welche Schwelle macht ein Objekt "lukrativ genug" für die Detail-Pipeline?
**A:** **Mehrere Faktoren gewichtet (Composite-Score).**
**Ambiguität:** 54%

### Runde 3 — Multi-Tenancy
**Q:** Wie viele Mandanten teilen die App jetzt und in 12 Monaten?
**A:** **Single-Tenant heute, Multi-Tenant-ready vorbereiten.**
**Ambiguität:** 50%

### Runde 4 — Autonomie *(Contrarian-Mode)*
**Q:** Wie autonom soll der Scout-Agent in Runde 1 agieren?
**A:** **Konfigurierbar pro SavedSearch.**
**Ambiguität:** 42%

### Runde 5 — Immometrica-Datenpfad
**Q:** Welchen Datenzugang habt ihr realistisch?
**A:** **Web-UI + CSV/PDF-Export.**
**Ambiguität:** 38%

### Runde 6 — Export-Trigger *(Simplifier-Mode)*
**Q:** Wie kommt der Export an euch?
**A:** **Login + Klick "Download".** Playwright nötig.
**Ambiguität:** 32%

### Runde 7 — LLM-Brain
**Q:** Welcher LLM-Provider als Reasoning-Brain?
**A:** **Claude (Anthropic) als One-Stop.**
**Ambiguität:** 27%

### Runde 8 — LLM-Budget
**Q:** Monatliches Hard-Cap?
**A:** **Kein Monats-Cap, per-Run-Limits.**
**Ambiguität:** 23%

### Runde 9 — Score-Faktoren
**Q:** Welche Faktoren in den Phase-1-Composite-Score?
**A:** **Alle 4: Bruttomietrendite + Cashflow-Indikator + Lage-Score + Preis-pro-m².**
**Ambiguität:** 17% — Threshold erreicht.

### Runde 10 — Detail-Scraping
**Q:** Wie aggressiv beim Scraping verlinkter Plattformen?
**A:** **Stealth + Residential-Proxies (auto-fallback).**
**Ambiguität:** 16%

### Runde 11 — Standortdaten
**Q:** Welche Quelle für Lage-Score und Mietpreis-Vergleich?
**A:** **Mix öffentlich + Mietspiegel-API**, plus zusätzliche Pulls aus der Immometrica-Browser-Session.
**Ambiguität:** 15%

### Runde 12 — E-Mail-Provider
**Q:** Wie laufen Outbound + Inbound zum Makler?
**A:** **Eigenes SMTP/IMAP auf eigener Infra.**
**Ambiguität:** 14%

### Runde 13 — Excel-Parität *(re-asked)*
**Q:** Wie weit muss App das Excel-Cockpit reproduzieren?
**A1 (zurückgezogen):** Hauptberechnung + UI-Cockpit
**A2 (final):** **Vollständig 1:1 alle Tabs inkl. Sensitivität/Stresstest/Vergleichsobjekte.**
**Ambiguität:** 13%

### Runde 14 — Hosting *(re-asked)*
**Q:** Wo läuft das System in Production?
**A1 (zurückgezogen):** Self-Hosted Hetzner-VM
**A2 (final, identisch):** **Self-Hosted Hetzner-VM.**
**Ambiguität:** 12%

### Runde 15 — Team
**Q:** Wer entwickelt mit wie viel Zeit?
**A:** **Solo + OMC AI-Agents als Team.**
**Ambiguität:** 12% — final.

</details>

---

## Spec Quality Self-Check

- [x] All 4 dimensions ≥ 0.85
- [x] 22 Entitäten, Ontology stabil
- [x] 13 testbare Acceptance Criteria
- [x] Alle 12 entscheidenden Assumptions exposed + resolved
- [x] Technical Context cited mit File-Paths/Module-Namen
- [x] Non-Goals explizit
- [x] Outstanding Information markiert als nicht-blockierend
- [x] Plan-File-Crossreference: `.omc/plans/realty79-roadmap.md`
