# Realty79 Real Estate Navigator — Roadmap-Plan

**Status:** Refined (post `/deep-interview`, ambiguity = 12%)
**Erstellt:** 2026-04-26
**Spec:** [`/opt/realty79-real-estate-naviagator/.omc/specs/deep-interview-realty79-scout-mvp.md`](../specs/deep-interview-realty79-scout-mvp.md)
**Repo:** `/opt/realty79-real-estate-naviagator`
**Stack heute:** Nx 22 Monorepo · Angular 21 (`apps/web`, **wird gestrichen**) · Vue 3 + Vuestic + Pinia (`apps/web-vue`, aktiv) · NestJS 11 (`apps/api`) · Prisma · Postgres 16 · Redis 7 · BullMQ · `libs/shared` (Immocation-Calculator)

---

## 0. Locked Decisions (aus Deep-Interview)

| # | Entscheidung | Konsequenz |
|---|---|---|
| D1 | **Scout-First** | M2 + M3 vor M1; Roadmap-Reihenfolge geflippt |
| D2 | **Single-Tenant heute, prepared für SaaS** | `tenantId`-Felder + Indizes ja, Code-Guards nein |
| D3 | **Autonomie konfigurierbar pro `SavedSearch`** (L1/L2/L3) | M5-Mail nur in L3-Modus aktiv |
| D4 | **Claude One-Stop** (Sonnet 4.6 + Vision) | Single SDK-Layer in `libs/integrations/llm/` |
| D5 | **Per-Run-LLM-Budget** statt Monats-Cap | `PipelineConfig.runBudgetEur` Pflichtfeld |
| D6 | **Immometrica = CSV/PDF-Export-Pfad** (Playwright nur für Trigger) | Kein Live-Scraping, ToS-Risiko sinkt |
| D7 | **Detail-Scraping: Stealth + Proxy-Fallback** | Bright-Data Default, hinter Block-Detector |
| D8 | **Standortdaten: Mix** (Immometrica-Session + Destatis frei + F+B optional) | Mietspiegel-Provider final nach M3-Spike |
| D9 | **Eigenes SMTP/IMAP** | M5.0 Mail-Stack-Setup als Vor-Sprint, 2-4 Wochen Reputation-Warmup |
| D10 | **Excel-Parität: Vollständig 1:1** alle Tabs | M4 wächst auf 3-4 Sprints |
| D11 | **Self-Hosted Hetzner-VM** + Docker Compose + MinIO | Statische IP für SMTP-Reputation |
| D12 | **Solo + OMC AI-Agents** | Sprint = 1 Woche, Σ ~3-4 Monate Kalenderzeit |
| D13 | **Angular-App löschen** *(empfohlen, finalize vor M0)* | Vue ist Single-Source-of-Truth |

---

## 1. Requirements Summary

Zwei Kern-Use-Cases unter einer App:

**A. Bestandsmanagement (Verwaltung)**
- Vollständige Verwaltung des bestehenden Immobilienbestands inkl. KPIs, Vorgängen, Dokumenten, Mieter- und Vertragsmanagement.
- Datenmodell ist bereits in Prisma vorhanden: `Property`, `Unit`, `Lease`, `Renter`, `Payment`, `Document`, `MaintenanceTask`, `MaintenanceTicket`, `Expense`, `Meter`, `MeterReading` (`prisma/schema.prisma`).
- Frontend: das **aktive** Web-Vue (`apps/web-vue`) — Angular-App ist 90% Boilerplate.

**B. Akquise neuer Mietobjekte (Scout)**
- AI-Agent recherchiert lukrative Mietobjekte über **Immometrica** (zentrale Datenquelle, bestehender Account) anhand konfigurierbarer Kriterien (Suchort, Umkreis, Preis, Cashflow, Baujahr, Objektart).
- Agent verfolgt die Inserat-Links auf nachgelagerte Plattformen (ImmoScout24, eBay-Kleinanzeigen etc.) und führt automatische **Detail-Research** inkl. **visueller Bildbewertung** durch.
- Alle Daten fließen in eine **Cashflow-/KPI-Berechnung**, deren Logik dem Excel **`immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx`** entspricht. Kalkulator-Grundlage existiert bereits in `libs/shared/src/immocation-calculator.ts`.
- Optional: **vollautomatischer E-Mail-Kontakt** mit Maklern/Verkäufern, um fehlende Unterlagen anzufordern und die Kalkulation zu finalisieren.
- Ergänzungen: **Mietpreisspiegel-Lookup**, Bevölkerungs-/Standortdaten (Immocation Standorttool), eigenständiges Browser-Surfen.
- DB-Felder existieren bereits: `Property`, `Analysis`, `DeepResearch` (mit `zustandScore`, `lageScore`, `oepnvScore`, `infrastruktur` JSON, `risikoScore`), `PropertyPhoto`, `SavedSearch.immoMetricaId`, `PipelineConfig`, `ScrapeLog`, `AgentConversation`/`AgentMessage`.

---

## 2. Architecture Overview (Ist + Soll)

### Ist-Zustand (verifiziert via Codebase-Exploration)
- **`apps/api`** (NestJS 11, ~120 Lines Real-Code, Rest Stubs): 23 Module gewired in `apps/api/src/app/app.module.ts:29-66`. **Scout-Module leer:** `analysis`, `pipeline`, `scraper`, `research`, `vision`, `agent`. **Verwaltung-Module leer:** `portfolio`, `unit`, `lease`, `renter`, `payment`, `document`, `accounting`, `messaging`, `notification`, `contract`, `maintenance`, `billing`. JWT-Auth ist gesetzt, Swagger unter `/api/docs`, BullMQ ist wired aber **alle `*.processor.ts` sind 0 Bytes**.
- **`apps/web-vue`**: Aktiv, ~3000 LOC echter Code, Pinia-Stores, modulare API-Clients in `apps/web-vue/src/services/api/*`, Routen für search, properties, portfolio, renters, documents, maintenance, accounting, chat, messaging, settings (`apps/web-vue/src/router/index.ts`). Mock-Daten in `mockProperties.ts`, `mockSearchProperties.ts`.
- **`apps/web` (Angular 21)**: ~991 LOC, reines Scaffolding mit lazy-loaded Routen — kein State-Management, kein API-Client.
- **`libs/shared`**: `ImmocationCalculator`, `scoring-engine`, `pipeline-filter` — Schnittstellen `PropertyInput`, `DarlehenParams`, `FinancingParams`, `AssumptionParams`, `YearProjection`, `KeyMetrics`, `CalculationResult`. **Keine DTOs/Zod-Schemata.**
- **Prisma Schema**: 30+ Models, 548-Line Init-Migration, multi-tenant via `Tenant`-Tabelle bereits vorbereitet.
- **Integrations-Skeleton, aber unimplementiert**: Immometrica (nur `SavedSearch.immoMetricaId`), Playwright (nur dev-dep), Anthropic (nur ENV-Placeholder), E-Mail (kein Nodemailer/IMAP), Telegram/Twilio ENV-Vars vorhanden.

### Soll-Architektur (Zielbild)
```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: apps/web-vue (Vuestic + Pinia)                       │
│  - Verwaltung: Bestand, Mieter, Verträge, Dokumente, Buchhaltung│
│  - Scout: SavedSearches, Pipeline, Detail-View mit AI-Findings  │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS/JWT
┌─────────────────────────────────────────────────────────────────┐
│ apps/api (NestJS) — REST + Swagger                             │
│  - VerwaltungModule (CRUD)        - ScoutModule                │
│  - AuthModule (JWT)               - PipelineModule              │
│  - DocumentModule (S3/local)      - AnalysisModule              │
│  - NotificationModule             - AgentModule (LLM-Orchestrator)│
└─────────────────────────────────────────────────────────────────┘
       │                                              │
       │                                              ▼
       │                            ┌──────────────────────────────┐
       │                            │ BullMQ Workers (Redis)       │
       │                            │  - immometrica-poll          │
       │                            │  - listing-detail-research   │
       │                            │  - photo-vision              │
       │                            │  - cashflow-recompute        │
       │                            │  - broker-outreach (E-Mail)  │
       │                            └──────────────────────────────┘
       ▼                                              │
┌─────────────────────────────────────────────────────────────────┐
│ Prisma → Postgres 16     │ S3-kompatibler Object-Storage        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Externe Dienste (Adapter-Layer in libs/integrations)           │
│  - Immometrica (API/Scraping)                                   │
│  - Playwright Browser-Pool (Stealth, Residential-Proxy?)        │
│  - Anthropic Claude (Vision + Tool-Use für Agent)               │
│  - Mietpreisspiegel-APIs / Immocation Standorttool              │
│  - SMTP/IMAP (Broker-E-Mail), Spam/Reply-Klassifizierung        │
└─────────────────────────────────────────────────────────────────┘
```

**Wichtige Architekturentscheidungen, die jetzt festgezurrt werden müssen** (→ Deep-Interview-Material):
1. Frontend-Konsolidierung: Angular-App entfernen oder weiterführen?
2. Browser-Automation: Playwright direkt im API-Prozess oder als separater Worker-Service mit eigenem Container?
3. LLM-Tier-Strategie: Nur Claude (Anthropic) oder Multi-Provider (OpenAI Vision, Gemini)? Welches Modell für Vision? Welches für Tool-Use?
4. Email-Outbound-Strategie: Eigener SMTP, transactional Provider (Postmark/Resend/Mailgun), oder OAuth-Connect mit User-Mailbox (Gmail/Outlook)?
5. Multi-Tenancy aktiv nutzen oder Single-Tenant für jetzt?
6. Hosting-Ziel: Self-Hosted (Docker auf eigener Infra) oder Managed (Fly/Render/Vercel)?

---

## 3. Milestone Plan

### M0 — Foundation (1 Sprint, Voraussetzung für alles weitere)
**Ziel:** Saubere Basis, Frontend-Strategie geklärt, Auth-Flow E2E grün.

- [ ] **Frontend-Konsolidierung entscheiden** (Angular löschen oder für Mobile/Ionic behalten). Default-Empfehlung: Angular-App (`apps/web`) **löschen**, Vue-App ist Single Source of Truth.
- [ ] CORS-Liste in `apps/api/src/main.ts` an die finale Frontend-Origin anpassen.
- [ ] `.env`-Hygiene: `JWT_SECRET` aus Repo entfernen, `.env.example` einchecken, Secrets über Doppler/Infisical/SOPS managen.
- [ ] Gemeinsame DTO/Zod-Schemata in `libs/shared` etablieren — single source of truth zwischen API und Web-Vue.
- [ ] Auth-Flow E2E: Registration → Login → JWT-Refresh → Logout, getestet in `apps/api-e2e`.
- [ ] CI: `pnpm nx affected -t lint test build` auf jedem PR.

**Acceptance:** Ein User kann sich via Web-Vue registrieren, einloggen, eine geschützte Route aufrufen. `pnpm nx affected -t test` ist grün.

---

### M1 — Verwaltung (Bestandsmanagement) ⌚ ~3 Sprints
**Ziel:** End-to-End-CRUD für den Immobilienbestand inkl. Mieter, Verträge, Dokumente, Buchhaltung.

#### M1.1 Property + Unit
- [ ] `PropertyController/Service` (apps/api/src/property/) mit Endpunkten `GET /properties`, `GET /properties/:id`, `POST`, `PATCH`, `DELETE` — Tenant-Scoping über JWT-Claim.
- [ ] `UnitController/Service` als Sub-Resource.
- [ ] Web-Vue: Properties-Liste + Detail-Page binden an echte API (Mocks in `mockProperties.ts` ersetzen).
- [ ] KPI-Kacheln auf Detail-View: Bruttomietrendite, Netto-Cashflow nach Steuern, Belegungsquote, NOI — Berechnung via `libs/shared/ImmocationCalculator`.

#### M1.2 Lease + Renter + Payment
- [ ] CRUD für Mieter, Mietverträge, Zahlungen.
- [ ] Mahnstufen-Logik (BullMQ-Job `payment-overdue-check` täglich).
- [ ] Mieterkommunikation-Tab pro Wohneinheit (nutzt `RenterConversation`/`RenterMessage`).

#### M1.3 Document + Maintenance + Accounting
- [ ] Dokumenten-Upload (Vertrag, Grundbuchauszug, Fotos) → S3-kompatibler Storage (z. B. MinIO lokal, R2 prod).
- [ ] OCR/Klassifizierung für Belege (Phase 2, hinter Feature-Flag).
- [ ] Maintenance-Tickets mit Status-Workflow (Offen → In Arbeit → Abgeschlossen).
- [ ] Buchhaltungs-Export (CSV/DATEV) für Steuerberater.

**Acceptance:**
- Alle Web-Vue-Routen aus `apps/web-vue/src/router/index.ts` (properties, portfolio, renters, documents, maintenance, accounting) sprechen ausschließlich mit der echten API; **keine** `mock*.ts`-Imports mehr.
- E2E-Test: Property anlegen → Unit hinzufügen → Mieter + Lease anlegen → Zahlung erfassen → Maintenance-Ticket öffnen → Dokument hochladen, alles über UI, in <5 Min.
- KPI-Werte aus `ImmocationCalculator` decken sich mit der Excel-Berechnung auf Cent-Genauigkeit (bei identischen Inputs).

---

### M2 — Scout-Pipeline (Foundation für AI-Agent) ⌚ ~2 Sprints
**Ziel:** Pipeline-Konfiguration, SavedSearches, manuelle Property-Recherche-Detailseite — **noch ohne AI**.

- [ ] `SavedSearchController/Service`: User legt Suchprofile an (Suchort, Umkreis, Preisrange, Baujahr, Objektart, Min-Cashflow).
- [ ] `PipelineConfigController/Service`: Phase-1/-2/-3 Schwellen-Config (existiert in `libs/shared/pipeline-filter.ts`).
- [ ] **Immometrica-Adapter** in `libs/integrations/immometrica/`:
  - Variante A: Immometrica REST/GraphQL-API (falls vorhanden — **klären im Deep-Interview**).
  - Variante B: Authenticated Playwright-Scraper mit Cookie-/Session-Reuse, falls keine API existiert.
- [ ] BullMQ-Worker `immometrica-poll`: läuft per Schedule (z. B. stündlich pro `SavedSearch`), legt neue Treffer als `Property` (Phase 1) an, schreibt in `ScrapeLog`.
- [ ] Frontend: `apps/web-vue/src/views/Search.vue` zeigt Pipeline-Stages (Phase 1 / 2 / 3) als Kanban.

**Acceptance:**
- Eine SavedSearch über das UI angelegt → innerhalb von <1 h erscheinen die ersten Property-Karten in der Pipeline-Phase 1.
- `Property`-Datensatz enthält alle Stammdaten + Inserat-Link (`Property.sourceUrl`) + Roh-Snapshot-JSON.

---

### M3 — AI-Research-Engine (Detail-Recherche + Vision) ⌚ ~2-3 Sprints
**Ziel:** Pro Property ein vollwertiges `DeepResearch`-Objekt mit Vision-Findings, Score-Werten und Quellenliste.

- [ ] `ResearchModule` (`apps/api/src/research/`): orchestriert pro Property eine Recherche-Kette (BullMQ-Job `listing-detail-research`).
- [ ] **Plattform-Adapter**: ImmoScout24, eBay-Kleinanzeigen, weitere — Inserat-Links aus Immometrica-Treffer extrahieren, Volltextbeschreibung + Bilder + Eckdaten holen.
- [ ] **VisionModule**: Bilder durch Claude Vision (oder GPT-4o-Vision) — Output als strukturiertes JSON: Zustand, Renovierungsbedarf, sichtbare Schäden, geschätztes Baujahr, Lichtverhältnisse, geschätzte Wohnfläche-Plausibilität.
- [ ] **Standort-Research**: Mietpreisspiegel-API (z. B. von ImmoScout24/Wüstenrot/öffentlich), Bevölkerungsdaten (BBSR/Destatis), Immocation-Standorttool. Adapter pro Quelle.
- [ ] Befüllung von `DeepResearch.zustandScore`, `lageScore`, `oepnvScore`, `infrastruktur` (JSON), `erkannteProbleme`, `risikoScore`, `risikoDetails`.
- [ ] **Agent-Orchestrator**: Claude mit Tool-Use — Tools: `fetchListing`, `analyzePhotos`, `lookupRentIndex`, `lookupLocation`, `runCashflow`, `requestMissingDocs`. Persistenz in `AgentConversation`/`AgentMessage`.

**Acceptance:**
- Pro Property in Phase 2 wird automatisch ein `DeepResearch`-Datensatz gefüllt; alle Score-Felder !=null.
- UI zeigt im Property-Detail eine Research-Timeline mit Quellen-Links.
- Halluzinations-Test: 10 manuell verifizierte Properties → ≥80% korrekte Lokalisierungen, ≥70% korrekte Zustandseinschätzungen.

---

### M4 — Cashflow-Cockpit (Excel-Parität) ⌚ ~1-2 Sprints
**Ziel:** App-interne Kalkulation deckt sich vollständig mit dem `immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx`.

- [ ] **Excel-Reverse-Engineering**: Tabs auflisten, Formeln extrahieren, in `libs/shared/immocation-calculator.ts` integrieren oder validieren.
- [ ] Szenario-Editor im UI: Zinsbindung, Tilgung, Mietwachstum, Inflations-Annahmen, Steuerklasse — pro Szenario eigene `Scenario`-Row in der DB.
- [ ] **Parity-Test-Suite**: 5-10 referenz-befüllte Excel-Sheets als Fixtures → Calculator muss auf Cent-Genauigkeit liefern.
- [ ] Export-Funktion: Calculation als PDF / xlsx pro Property.

**Acceptance:**
- Parity-Test für 5 referenz-Inputs ist grün (`<0.01€` Abweichung pro KPI über 30 Jahre Projection).
- Eigene KPIs (`KeyMetrics`) sind im Property-Detail-Cockpit sichtbar und mit Tooltip-Erklärung versehen.

---

### M5 — Broker-Outreach-Agent (E-Mail-Automation) ⌚ ~2 Sprints
**Ziel:** Agent kontaktiert Makler/Verkäufer eigenständig per E-Mail, fragt fehlende Unterlagen ab, klassifiziert Antworten.

- [ ] **Mailer-Layer** (`libs/integrations/mailer/`): Outbound via Postmark/Resend/Mailgun **oder** OAuth-Mailbox-Integration (User-eigenes Gmail/Outlook). Inbound via IMAP-Polling oder Webhook.
- [ ] Template-Engine für Anfragen (Energieausweis, Teilungserklärung, Protokolle Eigentümerversammlung, Hausgeld, Mieterliste).
- [ ] **Reply-Klassifikation**: LLM klassifiziert Eingangs-Mail als `documents-attached`, `more-info-requested`, `off-topic`, `negative-reply`.
- [ ] Eingehende Anhänge → automatischer Upload in `Document` mit Verknüpfung zur `Property`.
- [ ] **Human-in-the-Loop-Toggle**: Pro SavedSearch konfigurierbar "Auto-Send" vs. "Draft-Only" (User muss bestätigen).
- [ ] DSGVO/Compliance: Opt-Out-Footer, Impressum, Empfangsbestätigung-Tracking.

**Acceptance:**
- Test-Mailbox empfängt automatisch generierte Anfragen; Antworten werden korrekt klassifiziert (≥90% auf 50 Test-Replies).
- Anhänge landen automatisch unter der zugehörigen Property im UI sichtbar.
- "Draft-Only"-Modus zeigt Drafts im Posteingang-Tab vor dem Versand.

---

### M6 — Hardening & Production-Readiness ⌚ ~1 Sprint
- [ ] Observability: Pino-Logger mit korrelations-IDs, Sentry/OpenTelemetry, BullMQ-Dashboard.
- [ ] Rate-Limits + Circuit-Breaker um alle externen Calls (`immometrica`, LLM, Mailer).
- [ ] Backup-Strategie für Postgres + S3.
- [ ] Datenschutz-Audit: PII-Scan, Aufbewahrungsfristen, Löschkonzept für Mieterdaten.
- [ ] Deployment-Pipeline (Docker Compose → Production-Target).

---

## 4. Acceptance Criteria (Top-Level, testbar)

| # | Kriterium | Test |
|---|-----------|------|
| AC-1 | User kann via Web-Vue eine Property anlegen und sie erscheint sofort in der Property-Liste | E2E-Test in `apps/api-e2e` |
| AC-2 | KPIs aus `ImmocationCalculator` matchen Excel-Cockpit auf <0.01€ Abweichung über 30 Jahre | Jest-Parity-Suite mit 5+ Fixtures |
| AC-3 | SavedSearch erzeugt automatisch neue `Property`-Treffer aus Immometrica innerhalb 1 h | Integration-Test mit Immometrica-Stub-Server |
| AC-4 | `DeepResearch`-Auto-Run liefert pro Property mind. `zustandScore`, `lageScore`, `risikoScore` != null + ≥3 Quellen-Links | Integration-Test mit gemockten Plattform-Antworten |
| AC-5 | Vision-Engine liefert auf 10 Referenz-Property-Bilder ≥70% korrekte Zustandseinschätzungen | Manueller Eval-Lauf, dokumentiert |
| AC-6 | Broker-E-Mail im Auto-Modus versendet, Reply wird in <5 Min korrekt klassifiziert + Anhänge gespeichert | E2E-Test mit Mailpit/Mailhog |
| AC-7 | Multi-Tenant-Isolation: User A sieht keine Daten von Tenant B | Security-Regressions-Test pro Endpoint |
| AC-8 | `pnpm nx affected -t lint test build typecheck` ist grün auf jedem PR | CI-Pipeline-Status |

---

## 5. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|---|---|---|---|
| Immometrica hat keine offene API → Scraping nötig | Hoch | Hoch (Wartungslast, ToS-Risiko) | Adapter-Layer abstrahieren; ToS prüfen; Account-spezifische Cookies, niedrige Frequenz |
| LLM-Kosten skalieren unkontrolliert | Mittel | Mittel | Tier-Routing (Vision vs. Text), Caching von Research-Outputs, monatliches Budget-Limit als Hard-Stop |
| Vision-Halluzinationen verfälschen Cashflow-Annahmen | Mittel | Hoch | Strukturiertes JSON-Schema mit Confidence-Werten, Schwellen-basiertes Fallback auf "needs human review" |
| Browser-Automation wird auf großen Plattformen geblockt | Mittel | Hoch | Stealth-Mode, Residential-Proxy-Pool als Option, Rate-Limits, Backoff |
| E-Mail-Ausgang als Spam markiert | Mittel | Mittel | Authentifizierte SMTP (SPF/DKIM/DMARC), Provider mit Reputation (Postmark), Templates ohne Spam-Trigger |
| Excel-Parität schwer zu erreichen, Calculator weicht ab | Mittel | Hoch | Parity-Test-Suite zuerst schreiben; iterativ matchen bevor neue Features dazukommen |
| DSGVO-Risiko bei Mieterdaten und automatisierter Broker-Kontaktaufnahme | Mittel | Hoch | Opt-Out-Tracking, Datenschutz-Audit vor M5-Launch, juristische Prüfung der Outreach-Templates |
| Doppel-Frontend (Angular + Vue) führt zu Wartungs-Drift | Hoch (heute) | Mittel | M0-Entscheidung: Angular streichen, Vue-First |

---

## 6. Verification Steps (pro Milestone)

- **Code:** `pnpm nx affected -t lint test build typecheck` grün
- **API-Contracts:** Swagger unter `http://localhost:3000/api/docs` deckt alle neuen Endpoints
- **DB:** Prisma-Migrationen idempotent, `prisma migrate deploy` läuft auf leerer DB durch
- **E2E:** Mind. ein Happy-Path-Szenario pro Milestone in `apps/api-e2e`
- **Manuell:** Smoke-Test im Web-Vue-UI gegen frische DB

---

## 7. Open Questions (Material für `/deep-interview`)

> Diese Punkte sollten **vor** Implementierungsstart geklärt sein. Sie sind die Agenda für den anschließenden `/deep-interview`.

### A. Strategie & Scope
1. **Frontend-Single-Source-of-Truth?** Empfehlung: Angular-App löschen, nur Vue weiter. Bestätigt?
2. **Multi-Tenancy** ist im Schema vorhanden (`Tenant`-Tabelle). Heute Single-Tenant (nur eigener Bestand) oder direkt SaaS-fähig?
3. **Reihenfolge**: Verwaltung-First oder Scout-First? Empfehlung: M0 → M1 → M2 → M3 → M4 → M5 → M6.
4. **Umfang Bestand heute**: Wie viele Properties / Units / Mieter / Mietverträge im Bestand? Migrations-Daten vorhanden?

### B. Immometrica
5. Existiert eine **offizielle API**, oder muss gescrapt werden? (Bestimmt M2-Aufwand massiv.)
6. Welche Felder kommen pro Treffer mit (Roh-JSON-Beispiel)?
7. Wie viele aktive SavedSearches sind realistisch? (Wirkt auf Polling-Frequenz und Kostenmodell.)

### C. AI-Stack
8. **Welcher LLM-Provider** für Reasoning/Tool-Use? (Claude Sonnet 4.6 / Opus / GPT-4o / Gemini)
9. **Welcher LLM-Provider** für Vision (Bildanalyse)? (Claude Vision vs. GPT-4o vs. Gemini)
10. **Monatliches LLM-Budget** als Hard-Cap?
11. Self-Hosting / Privacy-Anforderungen (auf-Premise-LLM nötig?) — eher nicht, aber explizit klären.

### D. Browser-Automation & Scraping
12. **Playwright im API-Prozess** oder **separater Worker-Container** (bessere Isolation, eigene Crashes)?
13. **Proxy-Strategie**: Eigene Residential-Proxies / Rotating IPs notwendig oder reicht Direct-Connection?
14. **ToS-Compliance** für Plattform-Scraping geprüft (ImmoScout24, eBay-K)?

### E. Standort-/Mietspiegel-Daten
15. Welche **konkreten Quellen** für Mietpreisspiegel? (ImmoScout24-API, F+B, IDN, öffentlicher Mietspiegel-PDF-Pool, Immocation Standorttool selbst?)
16. Lizenzkosten für Mietspiegel-APIs in Budget einplanen?

### F. E-Mail-Outreach
17. **Outbound-Provider**: Eigener SMTP, Postmark, Resend, Mailgun, oder OAuth-Connect User-Mailbox (Gmail API / MS Graph)?
18. **Inbound**: IMAP-Poll oder Webhook (von Postmark/SendGrid)?
19. **Human-in-the-Loop**: Default-Mode Auto-Send oder Draft-Approval?
20. **DSGVO/Wettbewerbsrecht** bei automatisierten Geschäfts-E-Mails — juristische Prüfung nötig?

### G. Excel-Parität
21. Sind alle **Tabs** des Excel-Cockpits zu reproduzieren oder nur der Hauptberechnungstab?
22. Sollen User **eigene Formel-Anpassungen** vornehmen können (Custom-Szenarien)?
23. Excel-Import als Anhalt: User lädt eigene Excel hoch → wird in `Scenario`-Datensatz übernommen?

### H. Hosting & Ops
24. **Production-Hosting**: Self-Hosted (eigene VM/Hetzner/Bare-Metal) oder Managed (Fly.io, Render, AWS)?
25. **Backup-RTO/RPO**: Akzeptabler Datenverlust im Worst-Case?
26. **Storage-Backend**: MinIO self-hosted, S3, Cloudflare R2, Backblaze B2?

### I. Team & Ressourcen
27. Wer entwickelt (Solo, kleines Team)? Sprint-Länge?
28. Verfügbare Wochenstunden / realistische Lieferzeit für M0-M6?
29. Existieren UI-Mockups oder ist das Vue-UI bereits final?

---

## 8. Empfohlene nächste Schritte (nach `/deep-interview`)

1. Open Questions im Deep-Interview beantworten → Plan auf "Approved" setzen.
2. M0-Sprint starten (Frontend-Konsolidierung, Auth E2E, CI-Härtung).
3. Parallel: Excel-Reverse-Engineering vorziehen, damit Calculator-Parity-Suite vor M4 steht.
4. Adapter-PoCs für Immometrica + 1 Plattform (ImmoScout24) — frühzeitig validieren, ob API-Path möglich ist.

---

## 9. Plan Quality Self-Check

- [x] Plan basiert auf verifizierten Codebase-Fakten (Pfade + Module-Namen genannt)
- [x] Acceptance Criteria sind testbar (AC-1 bis AC-8)
- [x] Alle Risiken haben Mitigations
- [x] Open Questions sind explizit als Deep-Interview-Material markiert
- [x] Plan ist im Repo unter `.omc/plans/realty79-roadmap.md` gespeichert
- [ ] Open Questions aus Sektion 7 noch offen → Deep-Interview als nächster Schritt
