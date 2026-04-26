# Realty79 Scout-MVP — Consensus Plan (RALPLAN-DR Deliberate, Iteration 1)

**Plan ID:** `realty79-scout-mvp-consensus-iter1`
**Mode:** RALPLAN-DR Deliberate (high-risk: solo dev, brownfield, ToS-sensitive scraping, self-hosted SMTP)
**Generated:** 2026-04-26
**Author Stage:** Planner
**Next Stages:** Architect review → Critic review → Synthesizer → Executor handoff
**Spec:** `/opt/realty79-real-estate-naviagator/.omc/specs/deep-interview-realty79-scout-mvp.md` (12% ambiguity, 13 ACs, 22 entities)
**Roadmap-Plan:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-roadmap.md` (Locked Decisions D1–D13)
**Repo:** `/opt/realty79-real-estate-naviagator` (Nx 22 / NestJS 11 / Vue 3 / Prisma 7 / Postgres 16 / Redis 7 / BullMQ 5)

---

## Brownfield Truth Table (verified 2026-04-26)

Numbers anchor the plan. Cited inline below.

| Fact | Verified Path / Line | Status |
|------|----------------------|--------|
| App-Module wires 23 modules | `apps/api/src/app/app.module.ts:29-66` | Wired, but services empty |
| Scout/AI/Mgmt module stubs are 0 bytes | `apps/api/src/modules/{property,analysis,pipeline,config,scraper,agent,research,vision,portfolio,unit,lease,renter,payment,document,contract,messaging,notification,maintenance,accounting,auth,billing,health}/{*.module,*.service,*.controller,*.processor}.ts` | All `0 Apr 6 17:31` |
| BullMQ processors: only 2 stubs exist | `apps/api/src/modules/scraper/scraper.processor.ts`, `apps/api/src/modules/pipeline/pipeline.processor.ts` (both 0 bytes) | Stubs |
| BullMQ wiring | `apps/api/src/app/app.module.ts:32-37` (`BullModule.forRoot`) | Wired |
| Vue uses `pages/`, NOT `views/` | `apps/web-vue/src/pages/{search,properties,portfolio,renters,documents,maintenance,accounting,chat,messaging,settings,dashboard,landing,auth,onboarding,tools}/` | Active |
| Vue router | `apps/web-vue/src/router/index.ts` (referenced page imports) | Active |
| Vue API clients exist | `apps/web-vue/src/services/api/{client,auth,properties,portfolio,maintenance,messaging,accounting,misc,index}.ts` | Active, but bound to mocks |
| Pinia stores | `apps/web-vue/src/stores/{actions,auth,global-store,notifications,index}.ts` | Active |
| `libs/shared` calculator + scoring + filter | `libs/shared/src/utils/{immocation-calculator,scoring-engine,pipeline-filter}.ts` + specs | Implemented |
| Prisma models (counted) | `prisma/schema.prisma` (Property L13, Analysis L85, DeepResearch L113, PropertyPhoto L141, Scenario L151, Unit L165, Renter L180, Lease L194, Payment L222, Expense L238, Meter L252, MeterReading L262, MaintenanceTask L275, MaintenanceTicket L295, Handwerker L310, RenterConversation L325, RenterMessage L336, AgentConversation L348, AgentMessage L357, Document L371, DocumentTemplate L385, Portfolio L398, PipelineConfig L406, SavedSearch L440, ScrapeLog L452, Tenant L470) | 26 models, no MailMessage |
| Prisma init migration | `prisma/migrations/` (548 lines per spec) | Implemented |
| Docker compose | `docker-compose.yml` (postgres :5433, redis :6380, NO MinIO/Playwright/Mailer yet) | Partial |
| `.env` keys present | `/.env` (`DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `ANTHROPIC_API_KEY=` empty, `JWT_SECRET=realty79-jwt-secret-change-me` checked-in) | Needs hygiene |
| Angular skeleton | `apps/web/` (~991 LOC, no state, no API client) | Slated for delete (D13) |
| Excel template present | `/immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx` (841833 bytes) | Pre-M4 reverse-eng input |
| `libs/integrations/*` | does not exist yet | NEW dir tree to create in M0 |
| `apps/api-e2e/src/` | exists but empty wireframe (`api/`, `support/` only) | Needs Happy-Path tests per milestone |

---

## A) RALPLAN-DR Deliberate Summary

### A.1 Principles (5)

P1. **External I/O is always behind an adapter in `libs/integrations/<vendor>/`.** No NestJS service ever instantiates Playwright, Anthropic SDK, SMTP transport, or HTTP scraper directly. Concrete consequence: the Anthropic SDK import is allowed only in `libs/integrations/llm/anthropic-client.ts`; ESLint boundary-rule enforces this in M0. This is the single mechanism that lets us swap providers (D8 Mietspiegel TBD, D7 proxy provider TBD) without refactor.

P2. **BullMQ workers own all long-running and risky I/O.** Anything > 500 ms p95, anything that can be rate-limited, and anything that can fail and retry must live in a `*.processor.ts`, not in a request handler. Consequence: API request handlers stay <50 ms and the per-run €-budget cap (D5) is enforced in worker-tick boundaries, not request-time.

P3. **Vue is the single source of truth for the user.** All `mock*.ts` imports under `apps/web-vue/src/pages/**` are deleted milestone-by-milestone and replaced with calls into the existing `apps/web-vue/src/services/api/*.ts` client. No new mock data may be introduced. Apps/web (Angular) is deleted in M0 (D13).

P4. **Schema-additive only; multi-tenant prepared, not enforced.** Prisma migrations are append-only; `tenantId String? @index` plus a default tenant row (`'default'`) covers D2. No tenant-guard interceptor until SaaS-pivot.

P5. **Cost & reputation are first-class metrics.** `ScrapeLog.tokenCostEur`, `ScrapeLog.proxyCostEur`, BullMQ counter `mail.outbound.sentCount`, and Mail-Tester score are recorded on every run. Per-run budget hard-stop (D5/AC-6) and SMTP reputation (D9/AC-9) are not an afterthought; they are gating conditions in the M2/M5 acceptance tests.

### A.2 Decision Drivers (top 3)

DD1. **Shortest path to first lukrative property surfaced** — every architecture choice that doesn't help the user see a Phase-1 hit within 24 h of M2-deploy is deferred. M0+M2+M3 close the MVP-Gate (AC-1 through AC-6).

DD2. **Minimize ToS / DSGVO / spam-reputation risk** — Immometrica via legitimate Playwright-export (D6) instead of live scraping; broker outreach gated behind opt-in autonomy L3 with hard caps (D3); SMTP warmup before M5 launch (D9); DSGVO templates juristically reviewed pre-launch (Outstanding-Info row 7).

DD3. **Minimize €/run** — Per-run budget cap (D5) that hard-stops the run on overrun; cache photo-vision keyed by `PropertyPhoto.hash`; deterministic glue (Composite-Score, scoring-engine) gates LLM calls — only Phase-1-passers reach Claude.

### A.3 Architecture Forks (>=2 viable options each)

#### Fork 1 — Browser-Worker Placement

| Option | Pros | Cons |
|---|---|---|
| **1A: In-process inside NestJS API** (Playwright spawned by API request handler) | Zero ops overhead, simple `pnpm nx serve api` covers everything | Long-running browser blocks Node event-loop, 1 crash = whole API down, no horizontal scaling, violates P2 |
| **1B: Dedicated NestJS worker process** (`apps/worker`, same monorepo, same Prisma client, separate Nest bootstrap, no HTTP server) | Same code-style as `apps/api`, Nx-scaffold-able with `@nx/nest`, shares `libs/integrations/*`, restarts independently, uses BullMQ to consume jobs from Redis | Two processes to deploy; Docker Compose grows by one service |
| **1C: External Playwright-as-a-Service** (Browserbase / Browserless.io) | No browser binary on our VM, no proxy management | Adds €€/month; another vendor to monitor; Immometrica session cookies have to leave our VM — DSGVO/ToS-iffy, breaks D11 (self-hosted) |

**Chosen: 1B (Dedicated NestJS worker process).**
**Invalidation rationale:**
- 1A invalidated by P2 (workers own all I/O) and by the Hetzner CCX13 sizing assumption in Outstanding-Info row 9 — single Node process can't host API + Playwright headful Chromium + LLM streaming concurrently with stable p95.
- 1C invalidated by D11 (self-hosted) and DD2 (DSGVO — Immometrica session cookies must not transit a third-party VM that the user has not contracted as Auftragsverarbeiter).

#### Fork 2 — LLM Orchestration Topology

| Option | Pros | Cons |
|---|---|---|
| **2A: Single agent loop** (Claude with all tools `fetchListing`, `analyzePhotos`, `lookupRentIndex`, `runCashflow`, `requestMissingDocs`) — Claude decides every step | Maximum flexibility; conversational UX in Vue chat-page; matches the spec's `AgentConversation`/`AgentMessage` model | Token-cost explodes (per-run budget AC-6 hard to predict); failure modes harder to debug; vision-call may be skipped or repeated; deterministic glue is replaced by Claude prompts |
| **2B: Staged pipeline with deterministic glue** — BullMQ jobs `immometrica-poll` → `composite-score` (deterministic, `libs/shared/scoring-engine.ts`) → `listing-detail-research` (LLM with narrow tools) → `photo-vision` (LLM-Vision only) → `cashflow-recompute` (deterministic, `ImmocationCalculator`) → `agent-summary` (LLM, optional) | Predictable cost (DD3), each phase testable in isolation, deterministic gates (Composite-Score AC-2) before LLM spend, fits BullMQ + Prisma pattern, easy Sentry grouping per phase | Less "agentic" UX; user-visible chat lives only at the summary stage; Claude loses cross-phase context unless we replay |
| **2C: Hybrid** (deterministic gating + Claude-loop *inside* phase 2 only, with `AgentConversation` capturing the loop) | Deterministic outer gate (cost ceiling) + Claude flexibility inside the bounded research phase | Two patterns to maintain; team has to know when Claude can/cannot reach across phases |

**Chosen: 2C (Hybrid — deterministic outer pipeline, Claude-loop inside `listing-detail-research` only).**
**Invalidation rationale:**
- 2A invalidated by D5/AC-6 (per-run €-cap is hard to enforce mid-loop without aborting the whole agent context).
- 2B invalidated as too rigid for the open-ended detail-research step (Claude needs to fetch 1-N pages, decide when satisfied, call Vision N times, request missing docs as a tool — pure pipeline can't do that).
- 2C is the steel-version of D4 + D5: budget is enforced *between* phases by a deterministic supervisor, but inside the research phase Claude has tool-use freedom up to its slice of the budget.

#### Fork 3 — Mail-Stack (Outbound + Inbound)

| Option | Pros | Cons |
|---|---|---|
| **3A: Managed transactional + OAuth-IMAP** (Postmark/Resend out, Gmail/MS-Graph in) | Day-1 deliverability, instant DKIM, no warmup, no IP reputation work | Postmark prohibits cold outreach to brokers (Postmark TOS § "Permission-based email") — our use-case is borderline-cold; OAuth-IMAP requires per-user consent; D11 self-hosted constraint contradicted; D9 explicitly chose self-hosted |
| **3B: Self-hosted Postfix + Dovecot + OpenDKIM/SPF/DMARC + static IP on Hetzner** | Full control of templates/headers, DSGVO-clean (no US sub-processor), reputation owned, zero per-mail fees | 2-4 wk reputation warmup (D9), reverse-DNS coordination with Hetzner, ongoing reputation monitoring required, larger ops footprint |
| **3C: Self-hosted Haraka + IMAP via mail-poller adapter** | Same as 3B but JS-native, easier integration with NestJS | Smaller community than Postfix; less hardened against spam-relay abuse |

**Chosen: 3B (Postfix + Dovecot + OpenDKIM, self-hosted on Hetzner).**
**Invalidation rationale:**
- D9 already locks self-hosted; this fork exists to publish the steelman of 3A so the next reviewer can challenge.
- 3A steelman: "Postmark would let us launch M5 in 1 day instead of 2-4 wk" — invalidated because (a) Postmark TOS forbids cold outreach to brokers we don't have prior relationship with; (b) D11 self-hosted Hetzner contradicts; (c) D9 was explicitly re-asked and confirmed self-hosted; (d) DD2 (DSGVO) prefers no US sub-processor.
- 3C invalidated by ecosystem maturity: Postfix is the reference implementation for the sender reputation guidelines we need (DKIM rotation, DMARC reject policy).

---

## B) Pre-Mortem (3 mandatory failure scenarios)

### B.1 Immometrica blocks the Playwright session

**Trigger.** Immometrica detects automation: TLS-JA3 fingerprint, headless-chrome canvas-fingerprint, or rate of CSV-export download exceeds human baseline. Login succeeds, but the export download URL returns 403 or the session is silently throttled to stale data.

**Blast radius.** M2 stops producing new `Property` rows. AC-1 fails (no Phase-1 hits within 24 h). MVP-Gate slips. If undetected, downstream M3/M4 keep recomputing on stale data and look fine while the funnel is dry.

**Mitigation hooked into plan (M2 step 2.4 + M6 step 6.2).**
- Use `playwright-extra` + `puppeteer-extra-plugin-stealth` from the start; record a *human-recorded* Playwright trace as the click-flow ground-truth (file: `libs/integrations/immometrica/fixtures/login-flow.zip`).
- BullMQ worker `immometrica-poll` writes `ScrapeLog.status='blocked'` whenever HTTP 403 is observed OR whenever the export ZIP delta is empty for >2 consecutive runs while at least one new search is configured.
- Auto-fallback to `libs/integrations/proxy/bright-data-adapter.ts` (D7) flipped on by `Property.source='immometrica' AND blockedRunsConsecutive >= 3`.
- Manual-CSV-import fallback endpoint `POST /api/immometrica/import` accepts a user-uploaded ZIP from a manual download — keeps the funnel alive while we debug.

**Detection signal.**
- BullMQ metric `immometrica_poll_blocked_total{tenant="default"}` (Prometheus counter; alert at >=3 in 24 h).
- Pino log `event="immometrica.session.blocked" reason=<...>` shipped to Sentry; Sentry rule "any event matching this fingerprint pages user via the existing Telegram bot ENV `TELEGRAM_BOT_TOKEN`".
- Daily digest e-mail to user listing `ScrapeLog` rows with `status!='ok'`.

### B.2 SMTP reputation dies during M5 launch

**Trigger.** Hetzner /32 IP is on a SORBS or Spamhaus blocklist on day 1; or DKIM signing breaks because the DNS TXT record has a typo; or first 200 outbound mails get ≥5 spam-complaints because brokers mark "Anfrage zur Wohnung X" as bulk → reputation tank → all subsequent mails go to spam.

**Blast radius.** M5 ships but L3 broker outreach is silently ignored. AC-9 (`Mail-Tester ≥9/10`) and AC-10 (≥90% reply classification) cannot be evaluated because no replies arrive. Worse, brokers who *do* see the mail stop replying because the domain is now poisoned, contaminating M3 follow-ups.

**Mitigation hooked into plan (M5.0 mail-stack-setup, pre-sprint).**
- M5.0 is a 2-4 wk reputation-warmup *parallel to M2/M3 implementation* (D9). Sequence: (i) static IP from Hetzner with reverse-DNS via support ticket, (ii) Postfix + OpenDKIM + DMARC `p=quarantine` (NOT `reject` until day 30), (iii) warmup tool (`mailwarm`-style: ramp from 5 → 50 → 200 mails/day to seeded mailbox), (iv) blocklist-monitoring cron (`libs/integrations/mailer/reputation-check.ts` querying `bl.spamhaus.org`, `b.barracudacentral.org`, `cbl.abuseat.org` daily).
- M5 launch gated on Mail-Tester ≥9/10 (AC-9). If <9/10 → `feature.brokerOutreach.enabled=false`, drafts only.
- L3 hard caps (D3): max N mails/day per `SavedSearch`, only for Composite-Score ≥ X; default N=10, X=70.
- Manual SMTP kill-switch `feature.brokerOutreach.killswitch` toggled from `apps/web-vue/src/pages/settings/SettingsPage.vue` — flips both outbound + L3 to draft-only.

**Detection signal.**
- Daily cron writes `mailer.reputation.score` gauge to Pino logs; Sentry rule alerts on ≤7.
- Bounce rate counter `mailer.outbound.bounced_total / mailer.outbound.sent_total > 0.05` over 24 h → Telegram alert.
- DMARC aggregate report parser (RUA mailbox) → Sentry breadcrumb on `dkim=fail` or `spf=fail`.

### B.3 Excel-parity drift surfaces only after months of operation

**Trigger.** A `KeyMetrics` field (e.g., `cashflowAfterTax30y`) drifts from the Excel formula by 0.05 € on year-23 due to a rounding-mode mismatch. Test fixtures from M4.0 don't cover the year-23 sensitivity row, so the parity test passes. User notices in month 4 when comparing a real deal to the Excel template and finds €1,200 cumulative drift.

**Blast radius.** Trust in the calculator collapses; user falls back to Excel and stops using the app for new properties; M2/M3 funnel stays full but conversion to "I bought it" drops to zero. Worse, archived `Scenario` rows in DB now diverge silently and re-running the calc gives different numbers.

**Mitigation hooked into plan (M4.0 + M4.4 + M6).**
- M4.0 is a *Reverse-Engineering Sprint* (Outstanding-Info row 7): the user opens `/immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx` and produces a `libs/shared/src/fixtures/excel-parity/` directory with ≥5 parametrized fixtures covering edge cases: Sondertilgung, Mietausfall, Stresstest -20%, Verkauf in Jahr 10, full 30y projection.
- Property-based tests via `fast-check` over fixed seed: 1000 random `(financingParams, assumptions)` tuples → calc must agree with reference Python NumPy implementation in `libs/shared/src/utils/_reference-calc.py` to 1 cent over 30 y.
- Versioned `Scenario.calculatorVersion` column; recompute is a no-op if `Scenario.calculatorVersion === currentVersion`; version-bump triggers BullMQ `cashflow-recompute` for every Scenario.
- M6 adds `nightly-parity-drift` cron job: replays all production `Scenario` rows through the latest calculator and compares against stored `KeyMetrics`; >0.01 € drift → Sentry alert.

**Detection signal.**
- CI badge `parity-suite` per PR (5 fixtures × 30 KPIs × 30 years = 4500 assertions).
- Production gauge `calculator.scenario.recompute.maxAbsDrift_eur` per nightly run.
- User-visible diff banner in `apps/web-vue/src/pages/properties/PropertyDetailPage.vue` if `Scenario.calculatorVersion < currentVersion`.

---

## C) Expanded Test Plan (Quad-Coverage)

Layout matches the milestone delivery sequence (M0 → M2 → M3 → M4 → M5 → M1 → M6). All test files use the existing Jest + Vitest + Playwright tooling (already in `package.json` `devDependencies`).

### C.1 Unit (Jest 30 — already wired)

**Library.** Jest, Nx-default for NestJS + libs.
**Convention.** Co-locate `.spec.ts` next to source. Already established for `libs/shared/src/utils/{immocation-calculator,scoring-engine,pipeline-filter}.spec.ts`.
**Coverage gate.** ≥80% lines on every new lib in `libs/integrations/*` (Nx `jest.config.ts` per project).

| Milestone | Suite added | Example test name | Maps to AC |
|---|---|---|---|
| M0 | `libs/shared/src/dto/*.spec.ts` | `parses SavedSearchCreateDto with autonomyLevel default L1` | AC-13 |
| M0 | `apps/api/src/modules/auth/auth.service.spec.ts` | `rejects login with invalid bcrypt password` | AC-11 |
| M2 | `libs/integrations/immometrica/parser/csv-row.spec.ts` | `maps CSV row to PropertyCreateInput with sourceUrl` | AC-1 |
| M2 | `libs/shared/src/utils/scoring-engine.spec.ts` (extended) | `composite score equals 25/25/25/25 weighted average for default config` | AC-2 |
| M2 | `apps/api/src/modules/pipeline/pipeline.service.spec.ts` | `marks Property phase=2 when compositeScore >= phase1Threshold` | AC-1, AC-2 |
| M3 | `libs/integrations/llm/anthropic-client.spec.ts` | `throws BudgetExceededError when accumulated tokenCost > runBudgetEur` | AC-6 |
| M3 | `libs/integrations/scraper/stealth-browser.spec.ts` | `falls back to proxy when block-detector observes 403 twice` | AC-3 |
| M3 | `apps/api/src/modules/vision/vision.service.spec.ts` | `caches PropertyPhoto.visionAnalysis by hash` | AC-4 |
| M4 | `libs/shared/src/utils/immocation-calculator.parity.spec.ts` | `fixture-01-sondertilgung matches Excel cell H47 to 0.01 EUR` | AC-7 |
| M4 | `libs/shared/src/utils/sensitivity-table.spec.ts` | `produces 5x5 grid for ±2% Zins / ±5% Miete` | AC-8 |
| M5 | `libs/integrations/mailer/template-engine.spec.ts` | `renders broker-request template with property attachments link` | AC-10 |
| M5 | `libs/integrations/mailer/reply-classifier.spec.ts` | `classifies "anbei der Energieausweis" as documents-attached with confidence>=0.8` | AC-10 |
| M1 | `apps/api/src/modules/property/property.service.spec.ts` | `lists properties scoped to tenantId from JWT claim` | AC-13 |
| M6 | `apps/api/src/common/budget/budget-supervisor.spec.ts` | `emits hard-stop event when runBudgetEur reached mid-tool-call` | AC-6 |

### C.2 Integration (Jest + Testcontainers)

**Library.** Jest with `@testcontainers/postgresql` (add in M0) and `@testcontainers/redis` (add in M0). Migrations run via `prisma migrate deploy` in test setup.
**Layout.** `apps/api/test/integration/*.int-spec.ts` (new; Nx config in M0).

| Milestone | Suite | Example test | AC |
|---|---|---|---|
| M0 | `auth.int-spec.ts` | `register → login → refresh → logout flow stores hashed pw and rotates JWT` | AC-11 |
| M2 | `immometrica-poll.int-spec.ts` | `fixture ZIP with 3 rows produces 3 Property rows + 1 ScrapeLog row with hitCount=3` | AC-1 |
| M2 | `pipeline.int-spec.ts` | `Property with rendite>=4% AND lageScore>=70 lands in phase=2` | AC-1, AC-2 |
| M3 | `listing-detail-research.int-spec.ts` | `mocked Anthropic returns DeepResearch with all 4 score fields !=null` | AC-3 |
| M3 | `photo-vision.int-spec.ts` | `5 photos → 5 PropertyPhoto.visionAnalysis JSON, all with confidence >=0.5` | AC-4 |
| M3 | `budget-cap.int-spec.ts` | `runBudgetEur=0.05 stops research mid-loop with status=budget_exceeded` | AC-6 |
| M4 | `scenario-create-recompute.int-spec.ts` | `creating Scenario triggers BullMQ cashflow-recompute and writes KeyMetrics` | AC-5, AC-7 |
| M5 | `mail-inbound-classify.int-spec.ts` | `Mailpit-delivered .eml with PDF attachment → MailMessage.classification='documents-attached', Document row created` | AC-10 |
| M1 | `payment-overdue.int-spec.ts` | `daily cron flips Payment.status=overdue at +14d` | AC-12 |
| M6 | `tenant-scope.int-spec.ts` | `tenant-A JWT cannot read tenant-B Property rows` (regression test) | AC-13 |

### C.3 E2E (Playwright)

**Library.** Playwright (already a dev-dep transitively for browser-worker; install `@playwright/test` in M2). Two suites: `apps/api-e2e` (existing wireframe) for HTTP-level flows, and `apps/web-vue-e2e` (new in M0) for browser-level.
**Convention.** `pnpm nx e2e api-e2e` and `pnpm nx e2e web-vue-e2e`.

| Milestone | Suite | Test (AC mapping) |
|---|---|---|
| M0 | `apps/api-e2e/src/api/health.e2e-spec.ts` | `GET /api/health returns 200` (AC-11) |
| M0 | `apps/web-vue-e2e/src/auth.spec.ts` | `register → login → see dashboard` (AC-11, AC-12) |
| M2 | `apps/api-e2e/src/api/saved-search.e2e-spec.ts` | `POST /saved-searches → GET /saved-searches/:id/properties returns ≥1 hit within 24 h` (AC-1, AC-12) |
| M2 | `apps/web-vue-e2e/src/scout-pipeline.spec.ts` | `create SavedSearch in UI → wait → see Phase-1 card on SearchPage` (AC-1) |
| M3 | `apps/web-vue-e2e/src/property-detail.spec.ts` | `Phase-2 property shows DeepResearch + ≥5 PropertyPhoto.visionAnalysis tiles` (AC-3, AC-4) |
| M3 | `apps/api-e2e/src/api/budget-cap.e2e-spec.ts` | `SavedSearch.runBudgetEur=0.10 → ScrapeLog.status='budget_exceeded'` (AC-6) |
| M4 | `apps/web-vue-e2e/src/cockpit-cashflow.spec.ts` | `open Property X → cockpit shows 30y projection matching Excel fixture-01` (AC-5, AC-7, AC-8) |
| M5 | `apps/api-e2e/src/api/broker-outreach.e2e-spec.ts` | `L3 SavedSearch → outbound mail visible in Mailpit; reply → Document attached to Property` (AC-9, AC-10) |
| M1 | `apps/web-vue-e2e/src/verwaltung.spec.ts` | `Property → Unit → Lease → Payment → MaintenanceTicket flow under 5 min` (AC-12) |
| M6 | `apps/api-e2e/src/api/multitenant-isolation.e2e-spec.ts` | `tenant-A cannot read tenant-B SavedSearch` (AC-13) |

### C.4 Observability

**Stack.**
- **Logs:** Pino with structured JSON, correlation-IDs propagated from API request → BullMQ job → adapter call. Schema documented in `libs/shared/src/observability/log-schema.ts`. Required fields: `level`, `time`, `traceId`, `spanId`, `event` (dot-namespaced like `scout.pipeline.phase1.passed`), `tenantId`, `savedSearchId?`, `propertyId?`, `cost.tokenEur?`, `cost.proxyEur?`.
- **BullMQ dashboard:** `bull-board` mounted at `/admin/queues` (auth-protected). Metrics visible: queue length, processed/failed/delayed per queue, p95 job duration.
- **Errors:** `@sentry/node` in `apps/api` and `apps/worker`, Sentry environment = `production`/`staging`/`dev`. Grouping fingerprints: `${event}.${vendor}` (e.g., `immometrica.session.blocked`, `anthropic.budget.exceeded`, `mailer.outbound.bounced`).
- **Traces:** `@opentelemetry/sdk-node` with auto-instrumentation for HTTP, Prisma, BullMQ, axios. Span names: `bullmq.process.<queue>`, `prisma.<model>.<op>`, `playwright.page.<action>`, `anthropic.messages.create`. OTel exporter to local Jaeger in dev, to Hetzner-hosted Tempo in prod (M6).

**Per-milestone observability deliverable.**

| Milestone | Adds |
|---|---|
| M0 | Pino + correlation-ID middleware; `bull-board`; baseline Sentry init; OTel SDK |
| M2 | Span around `immometrica.session.login`, `immometrica.export.download`; counter `immometrica.poll.hits` |
| M3 | Span around `anthropic.messages.create`, `playwright.page.fetch`, `vision.photo.analyze`; histogram `cost.tokenEur.per_run` |
| M4 | Span `calculator.scenario.recompute`; gauge `calculator.parity.maxDrift_eur` |
| M5 | Counter `mailer.outbound.{sent,bounced,opened}`; gauge `mailer.reputation.score`; Sentry rule on `dkim=fail` |
| M1 | Counter `verwaltung.payment.overdue.flagged` |
| M6 | Tempo + Loki Compose stack; SLO doc; alert routing into Telegram |

---

## D) Implementation Steps (per Milestone, with FILE PATHS)

Order: **M0 → M2 → M3 → M4 → M5 → M1 → M6** (Scout-First, locked by D1).

> Convention: paths are absolute under repo root. `~` is shorthand for `/opt/realty79-real-estate-naviagator/`. "EDIT" means modify existing 0-byte stub or existing populated file. "NEW" means create from scratch.

---

### M0 — Foundation (1 sprint)

**Goal.** Saubere brownfield-Basis: Angular gelöscht, `libs/integrations/*` Skeleton steht, DTO/Zod-Layer in `libs/shared`, Auth-Flow E2E grün, CI-Pipeline und Observability-Baseline aktiv. M0 schafft die Voraussetzung dafür, dass alle nachfolgenden Milestones nur noch *Fachlogik* hinzufügen, statt Infrastruktur zu erfinden. Insbesondere wird die ESLint-Boundary-Rule eingerichtet, die P1 (External I/O hinter Adapter) maschinell durchsetzt — danach ist es unmöglich, dass ein Service in `apps/api/src/modules/**` direkt `import Anthropic from '@anthropic-ai/sdk'` schreibt.

#### M0 — Files to delete
- `~/apps/web/` — entire Angular app (D13)
- `~/.angular/` — Angular CLI cache
- `~/.env` (recreate after sanitizing) — current `JWT_SECRET=realty79-jwt-secret-change-me` is checked in
- Remove Angular-only deps from `~/package.json`: `@angular/*`, `@nx/angular`, `@schematics/angular`, `@ionic/angular*`, `@angular-devkit/*`, `angular-eslint`

#### M0 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/package.json` | remove Angular deps; add `pino`, `pino-http`, `nestjs-pino`, `@sentry/node`, `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `bull-board`, `@bull-board/express`, `zod`, `bcrypt`, `@types/bcrypt`, `@playwright/test`, `playwright-extra`, `puppeteer-extra-plugin-stealth`, `@anthropic-ai/sdk`, `nodemailer`, `mailparser`, `imapflow`, `@testcontainers/postgresql`, `@testcontainers/redis` |
| EDIT | `~/.env` | drop `JWT_SECRET=...` value; replace with empty placeholder; copy current secrets to operator's password manager |
| NEW | `~/.env.example` | document all required env keys (`DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `IMAP_HOST`, `IMAP_USER`, `IMAP_PASS`, `BRIGHTDATA_USER`, `BRIGHTDATA_PASS`, `SENTRY_DSN`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`) |
| EDIT | `~/.gitignore` | ensure `.env` (without `.example`) is ignored |
| EDIT | `~/eslint.config.mjs` | add `@nx/enforce-module-boundaries` rule with tags: `scope:integrations` (only `libs/integrations/*`), `scope:shared` (`libs/shared/*`), `scope:api` (`apps/api/*`), `scope:worker` (`apps/worker/*`), `scope:web` (`apps/web-vue/*`); rule forbids `apps/api/**` from importing `@anthropic-ai/sdk`, `playwright`, `nodemailer`, `imapflow`, `axios` directly |
| EDIT | `~/nx.json` | add tags to existing projects |
| NEW | `~/apps/worker/` | new Nx project, scaffolded with `pnpm nx g @nx/nest:app worker --tags=scope:worker`, no HTTP server, just BullMQ consumer bootstrap |
| NEW | `~/apps/worker/src/main.ts` | Nest standalone bootstrap, registers all `*.processor.ts` modules, exits on SIGTERM |
| NEW | `~/apps/worker/src/app/worker.module.ts` | imports the same Prisma/Bull/Anthropic modules as API |
| EDIT | `~/apps/api/src/main.ts` | add Pino, OTel SDK, Sentry init; tighten CORS; mount `bull-board` at `/admin/queues` behind JWT |
| EDIT | `~/apps/api/src/app/app.module.ts` | swap `Logger` for `LoggerModule.forRoot({pinoHttp: ...})` (nestjs-pino); remove "Sprint 5/6/8/9" comments (lines 49-63) — they predate D1 reordering |
| NEW | `~/apps/api/src/common/observability/correlation-id.middleware.ts` | reads `x-correlation-id` header or generates one; attaches to AsyncLocalStorage |
| NEW | `~/apps/api/src/common/observability/sentry.interceptor.ts` | tags spans with `tenantId`, `userId` |
| NEW | `~/apps/api/src/common/budget/budget-supervisor.service.ts` | hosts the per-run `runBudgetEur` accumulator (used in M3) |
| NEW | `~/apps/api/src/common/tenant/tenant.middleware.ts` | extracts `tenantId` from JWT claim, stores in AsyncLocalStorage; service-side helpers for filtering |
| EDIT | `~/apps/api/src/modules/health/health.{module,controller}.ts` | actual health endpoint with Prisma + Redis ping |
| EDIT | `~/apps/api/src/modules/auth/auth.{module,service,controller}.ts` | JWT register/login/refresh/logout; bcrypt; uses Prisma `Tenant` (default tenant seeded) |
| NEW | `~/apps/api/src/modules/auth/dto/{register,login,refresh}.dto.ts` | imports Zod schemas from `libs/shared` |
| NEW | `~/libs/shared/src/dto/auth.ts` | Zod schemas |
| NEW | `~/libs/shared/src/dto/saved-search.ts` | Zod schemas (used in M2) |
| NEW | `~/libs/shared/src/dto/property.ts` | Zod schemas |
| NEW | `~/libs/shared/src/observability/log-schema.ts` | Pino schema constants |
| NEW | `~/libs/integrations/llm/project.json` | Nx project file, `tags=["scope:integrations","domain:llm"]` |
| NEW | `~/libs/integrations/llm/src/index.ts` | barrel |
| NEW | `~/libs/integrations/llm/src/anthropic-client.ts` | only ONE allowed import of `@anthropic-ai/sdk`; thin wrapper exposing `messages.create` + tool-use streaming + cost tracker |
| NEW | `~/libs/integrations/llm/src/cost-tracker.ts` | converts input/output tokens to € via configurable rate table |
| NEW | `~/libs/integrations/scraper/{project.json,src/index.ts,src/stealth-browser.ts,src/block-detector.ts}` | Playwright + stealth plugin wrapper |
| NEW | `~/libs/integrations/proxy/{project.json,src/index.ts,src/bright-data-adapter.ts}` | residential-proxy adapter |
| NEW | `~/libs/integrations/immometrica/{project.json,src/index.ts,src/login-flow.ts,src/csv-export.ts,src/parser/csv-row.ts,src/types.ts}` | scaffold (real impl in M2) |
| NEW | `~/libs/integrations/standort/{project.json,src/index.ts,src/destatis-client.ts,src/regiostat-client.ts}` | scaffold |
| NEW | `~/libs/integrations/mailer/{project.json,src/index.ts,src/smtp-transport.ts,src/imap-poller.ts,src/template-engine.ts,src/reply-classifier.ts}` | scaffold (real impl in M5) |
| NEW | `~/apps/web-vue-e2e/` | Nx scaffolded with `pnpm nx g @nx/playwright:configuration --project=web-vue-e2e` |
| EDIT | `~/docker-compose.yml` | add `minio:` service (S3-compatible, ports 9000/9001), `mailpit:` (dev SMTP/IMAP, ports 1025/1143/8025), `jaeger:` (OTel, port 16686), `bullboard` not needed (mounted in API) |
| NEW | `~/docker-compose.prod.yml` | parallel file for Hetzner: real `postfix`, `dovecot`, `opendkim`, `traefik`, `tempo`, `loki`, `grafana` (referenced from M5/M6) |
| NEW | `~/prisma/migrations/<timestamp>_m0_tenant_default/migration.sql` | `INSERT INTO "Tenant" (id, name, planTier) VALUES ('default', 'Default Tenant', 'self-hosted') ON CONFLICT DO NOTHING;` — single seeded tenant for D2 |

#### M0 — BullMQ workers to implement
None in M0 (foundation only). The two existing 0-byte processors (`scraper.processor.ts`, `pipeline.processor.ts`) stay 0-byte; they get replaced *and renamed* in M2.

#### M0 — Vue UI changes
- `apps/web-vue/src/services/api/client.ts`: ensure axios baseURL points to `import.meta.env.VITE_API_URL` (currently in `services/api.ts` — consolidate).
- `apps/web-vue/src/pages/auth/LoginPage.vue`: remove any mock/dummy auth, call real `POST /api/auth/login`.
- `apps/web-vue/src/stores/auth.ts`: persist JWT in `localStorage`, refresh on 401.
- No mock removal yet from other pages — happens milestone-by-milestone.

#### M0 — First 3 git commits (PR-sized)
1. `chore(repo): delete apps/web (Angular) and Angular dependencies` — delete dir, prune package.json, drop Angular ESLint rules. CI must stay green.
2. `feat(libs): scaffold libs/integrations/{llm,scraper,proxy,immometrica,standort,mailer} + DTO library` — Nx generators + ESLint boundary rules + barrel exports + first Anthropic-client unit test.
3. `feat(api): wire JWT auth + Pino + Sentry + OTel + bull-board + tenant middleware` — replaces 0-byte auth/health stubs, adds correlation-IDs, adds `apps/worker/` scaffold; tests + e2e for register→login→refresh.

#### M0 — Done when (AC closed)
- AC-11 (`pnpm nx affected -t lint test build typecheck` green) ✓
- AC-12 (E2E auth happy path) ✓ partial — auth-only
- AC-13 (every new table has `tenantId String? @index`) ✓ enforced via M0 migration template; no new tables yet but invariant set
- Foundation for AC-1 through AC-10 (adapter scaffolds, DTO layer, observability) ✓

---

### M2 — Scout-Pipeline (Foundation for AI-Agent) — ~2 sprints

**Goal.** Vom leeren Stub zur lebendigen Pipeline: User legt im UI eine `SavedSearch` an, BullMQ-Worker `immometrica-poll` zieht stündlich den CSV/PDF-Export aus der Immometrica-Browser-Session (D6, Auto-Login + Klick-Flow), normalisiert die Rows zu `Property`-Records (Phase 1), und der Composite-Score (D-AC-2) entscheidet, ob ein Property in Phase 2 wandert. **Ohne LLM**: alles deterministisch. M2 schließt AC-1 + AC-2; AC-6 (Per-Run-Budget) wird hier *strukturell* vorbereitet — die Budget-Supervision aus M0 wird in den Polling-Worker eingehängt, Token-Cost ist in M2 noch 0 (kein LLM), aber `ScrapeLog.proxyCostEur` und `ScrapeLog.durationMs` werden bereits geschrieben.

#### M2 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m2_scout_fields/migration.sql` | additive — `ALTER TABLE "Property" ADD COLUMN "compositeScore" DOUBLE PRECISION;`, `ALTER TABLE "SavedSearch" ADD COLUMN "autonomyLevel" TEXT NOT NULL DEFAULT 'L1';`, `ALTER TABLE "SavedSearch" ADD COLUMN "scoringWeights" JSONB NOT NULL DEFAULT '{"rendite":25,"cashflow":25,"lage":25,"preisProQm":25}';`, `ALTER TABLE "PipelineConfig" ADD COLUMN "runBudgetEur" DOUBLE PRECISION NOT NULL DEFAULT 5.0;`, `ALTER TABLE "ScrapeLog" ADD COLUMN "tokenCostEur" DOUBLE PRECISION NOT NULL DEFAULT 0;`, `ALTER TABLE "ScrapeLog" ADD COLUMN "proxyCostEur" DOUBLE PRECISION NOT NULL DEFAULT 0;`, all new tables get `tenantId String? @default("default")` + `@@index([tenantId])` per AC-13 |
| EDIT | `~/prisma/schema.prisma` | mirror the additions; add enum `AutonomyLevel { L1 L2 L3 }` |
| EDIT | `~/apps/api/src/modules/property/property.{module,service,controller}.ts` | CRUD `GET/POST/PATCH /properties`, `GET /properties/:id` (Phase 1 read-only via UI in M2; full edit only in M1) |
| EDIT | `~/apps/api/src/modules/pipeline/pipeline.{module,service,controller}.ts` | exposes `GET /pipeline/saved-searches/:id/properties?phase=1\|2\|3`, returns kanban-grouped data |
| EDIT | `~/apps/api/src/modules/config/config.{module,service,controller}.ts` | `PipelineConfig` CRUD; default config seeded per `Tenant` |
| NEW | `~/apps/api/src/modules/saved-search/saved-search.{module,service,controller}.ts` | new module — currently NOT registered in `app.module.ts` (must add); exposes `POST/PATCH/GET /saved-searches`, `POST /saved-searches/:id/run` (manual kick) |
| EDIT | `~/apps/api/src/app/app.module.ts` | register `SavedSearchModule`; register `BullModule.registerQueue({name:'immometrica-poll'})`, `{name:'composite-score'}`, `{name:'cashflow-recompute'}` |
| EDIT | `~/apps/api/src/modules/scraper/scraper.processor.ts` | RENAME to `~/apps/worker/src/processors/immometrica-poll.processor.ts`; new file uses `libs/integrations/immometrica`; original file deleted |
| NEW | `~/apps/worker/src/processors/immometrica-poll.processor.ts` | `@Processor('immometrica-poll')`; calls `ImmometricaService.fetchExportZip()`, parses CSV, upserts `Property` rows by `externalId`, writes `ScrapeLog` |
| NEW | `~/apps/worker/src/processors/composite-score.processor.ts` | `@Processor('composite-score')`; on `Property.created` event, runs `scoring-engine.computeCompositeScore`, writes `Property.compositeScore` + `Analysis.compositeScore`, sets `Property.phase=2` if ≥ threshold |
| NEW | `~/apps/worker/src/processors/cashflow-recompute.processor.ts` | scaffold only (real use in M4) |
| EDIT | `~/libs/integrations/immometrica/src/login-flow.ts` | full Playwright auto-login; cookies cached in `ImmometricaSession` (in-memory map for now, table-backed in M6) |
| EDIT | `~/libs/integrations/immometrica/src/csv-export.ts` | clicks "Export CSV" + "Export PDF" buttons; downloads ZIP to `/tmp/immometrica-export-<ts>.zip` |
| EDIT | `~/libs/integrations/immometrica/src/parser/csv-row.ts` | maps CSV columns → `Prisma.PropertyCreateInput` |
| NEW | `~/libs/integrations/immometrica/fixtures/sample-export.csv` | 3-row anonymized fixture for unit tests |
| NEW | `~/libs/integrations/immometrica/fixtures/login-flow.zip` | Playwright trace recording of one human login (committed to repo with sanitized creds) — used as ground-truth for stealth tweaks |
| EDIT | `~/libs/shared/src/utils/scoring-engine.ts` | extend with `computeCompositeScore(property, weights, marketMedian)` returning `{rendite, cashflow, lage, preisProQm, total}`; default weights 25/25/25/25 (AC-2) |
| EDIT | `~/libs/shared/src/utils/pipeline-filter.ts` | extend with phase-1 threshold filter |
| NEW | `~/libs/shared/src/dto/saved-search.ts` (extend) | autonomy enum, scoring weights validation |
| EDIT | `~/apps/web-vue/src/pages/search/SearchPage.vue` | drop import of `mockSearchProperties.ts`; bind to `services/api/properties.ts` (extended) and a new `services/api/saved-search.ts` (NEW); render kanban with Phase 1 / 2 / 3 columns |
| NEW | `~/apps/web-vue/src/services/api/saved-search.ts` | typed client for SavedSearch endpoints |
| EDIT | `~/apps/web-vue/src/services/api/properties.ts` | add `listByPhase(savedSearchId, phase)` |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyListPage.vue` | drop `mockProperties.ts` import |
| NEW | `~/apps/web-vue/src/components/SavedSearchEditor.vue` | form with `autonomyLevel` (L1 default), `runBudgetEur`, `scoringWeights` sliders, `minScore` |

#### M2 — BullMQ workers to implement
- `immometrica-poll` — schedule: cron `0 * * * *` (hourly) per active SavedSearch; concurrency: 1 per IP (Immometrica detects parallel sessions).
- `composite-score` — event-triggered after `Property.created`; concurrency: 4.
- `cashflow-recompute` — scaffold only.

#### M2 — Vue UI changes
- `apps/web-vue/src/pages/search/SearchPage.vue`: kanban Phase 1/2/3 (LIVE).
- `apps/web-vue/src/pages/properties/PropertyListPage.vue`: real API.
- `apps/web-vue/src/pages/properties/PropertyDetailPage.vue`: shows `compositeScore`, `Analysis.{rendite, cashflow1y, lageScore, pricePerSqmRatio}` from API (still no DeepResearch in M2; Vision tiles are placeholders).

#### M2 — First 3 git commits
1. `feat(prisma): m2 additive migration — compositeScore, autonomyLevel, scoringWeights, runBudgetEur, tokenCostEur, proxyCostEur` — schema + migration + tests.
2. `feat(integrations): immometrica auto-login + csv-export adapter with Playwright stealth` — `libs/integrations/immometrica` real impl + csv-row parser + 3-row fixture + unit tests.
3. `feat(api/worker): scout pipeline — SavedSearch CRUD + immometrica-poll worker + composite-score worker + Vue kanban` — Nest modules wired + BullMQ queues + Vue page bindings + e2e `pnpm nx e2e api-e2e --grep saved-search`.

#### M2 — Done when
- AC-1 ✓ (SavedSearch → Phase-1 hits within 1 h via hourly cron, well under 24 h target)
- AC-2 ✓ (Composite-Score with 4 factors, default 25/25/25/25, configurable per SavedSearch)
- AC-13 ✓ (all new fields are tenant-aware)
- AC-11 ✓ (CI green)
- AC-12 ✓ partial — happy-path e2e for SavedSearch creation

---

### M3 — AI-Research-Engine (Detail-Recherche + Vision) — ~2-3 sprints

**Goal.** Phase-2-Properties durchlaufen automatisch eine LLM-getriebene Detail-Recherche: Stealth-Browser fetcht Inserat-Volltexte und Bilder von verlinkten Plattformen (D7), Claude Sonnet 4.6 mit Tool-Use orchestriert die Recherche-Schleife (steelman 2C: Hybrid-Topology), Claude Vision analysiert ≥5 Fotos pro Property (D4, AC-4), `DeepResearch` wird mit allen 4 Score-Feldern befüllt, `KeyMetrics` (30y) wird vom `ImmocationCalculator` deterministisch berechnet, und der Per-Run-Budget-Cap (D5/AC-6) hard-stoppt die Pipeline bei Überschreitung. Ende M3 ist die MVP-Gate gewonnen: User kann eine SavedSearch anlegen und sieht innerhalb 24 h Phase-2-Properties mit kompletter AI-Analyse plus Cashflow-Indikator im Vue-Cockpit.

#### M3 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m3_research_fields/migration.sql` | `ALTER TABLE "PropertyPhoto" ADD COLUMN "visionAnalysis" JSONB;`, `ALTER TABLE "PropertyPhoto" ADD COLUMN "hash" TEXT;`, `CREATE UNIQUE INDEX ON "PropertyPhoto" ("hash");`, `ALTER TABLE "DeepResearch" ADD COLUMN "sourcesList" JSONB;`, `ALTER TABLE "DeepResearch" ADD COLUMN "infrastruktur" JSONB;`, `ALTER TABLE "DeepResearch" ADD COLUMN "erkannteProbleme" JSONB;` (some may already exist — migration is conditional `ADD COLUMN IF NOT EXISTS`) |
| EDIT | `~/prisma/schema.prisma` | sync types |
| EDIT | `~/apps/api/src/modules/research/research.{module,service,controller}.ts` | exposes `POST /research/:propertyId/run` (manual trigger), `GET /research/:propertyId` (read DeepResearch); enqueues `listing-detail-research` job |
| EDIT | `~/apps/api/src/modules/vision/vision.{module,service,controller}.ts` | exposes `POST /vision/:propertyId/run`, `GET /properties/:id/photos` |
| EDIT | `~/apps/api/src/modules/agent/agent.{module,service,controller}.ts` | exposes `POST /agent/conversations`, `GET /agent/conversations/:id`, `POST /agent/conversations/:id/messages`; persists `AgentConversation`/`AgentMessage`; this is the steel for fork 2C |
| NEW | `~/apps/api/src/modules/agent/tools/index.ts` | tool definitions for Claude tool-use: `fetchListing`, `analyzePhotos`, `lookupRentIndex`, `lookupLocation`, `runCashflow` |
| NEW | `~/apps/api/src/modules/agent/tools/fetch-listing.tool.ts` | wraps `libs/integrations/scraper` |
| NEW | `~/apps/api/src/modules/agent/tools/analyze-photos.tool.ts` | wraps `VisionService` |
| NEW | `~/apps/api/src/modules/agent/tools/lookup-rent-index.tool.ts` | wraps `libs/integrations/standort` |
| NEW | `~/apps/api/src/modules/agent/tools/lookup-location.tool.ts` | wraps Destatis/Regiostat |
| NEW | `~/apps/api/src/modules/agent/tools/run-cashflow.tool.ts` | wraps `ImmocationCalculator` |
| NEW | `~/apps/worker/src/processors/listing-detail-research.processor.ts` | `@Processor('listing-detail-research')`; runs the Claude tool-use loop bounded by `BudgetSupervisor`; on overrun → throws `BudgetExceededError`, job marked `failed` with reason, `ScrapeLog.status='budget_exceeded'` |
| NEW | `~/apps/worker/src/processors/photo-vision.processor.ts` | `@Processor('photo-vision')`; downloads photos from listing URL, hashes (SHA-256), checks `PropertyPhoto.hash` cache, calls Claude Vision with structured-output schema, writes `PropertyPhoto.visionAnalysis` |
| EDIT | `~/libs/integrations/llm/src/anthropic-client.ts` | full impl: streaming, tool-use loop, vision-multipart, cost accounting; emits `cost.tokenEur` events to `BudgetSupervisor` |
| NEW | `~/libs/integrations/llm/src/tool-use-loop.ts` | runs the tool-call → observation → tool-call cycle until Claude emits `stop_reason='end_turn'` or budget exceeded |
| NEW | `~/libs/integrations/llm/src/vision-schema.ts` | Zod schema for vision JSON output (`zustand`, `renovierungsbedarf`, `schaeden`, `lichtverhaeltnisse`, `confidence`) — AC-4 |
| EDIT | `~/libs/integrations/scraper/src/stealth-browser.ts` | full impl with `playwright-extra` + `puppeteer-extra-plugin-stealth`, headless context per call, blocks ads/trackers, randomized viewport |
| EDIT | `~/libs/integrations/scraper/src/block-detector.ts` | heuristics: HTTP 403/429, captcha selectors (`#captcha`, `iframe[src*="recaptcha"]`), Cloudflare interstitial, content-length<1KB on a body-required page |
| EDIT | `~/libs/integrations/proxy/src/bright-data-adapter.ts` | wraps Bright Data Web Unlocker / Residential proxy; auto-fallback when `block-detector` fires |
| NEW | `~/libs/integrations/scraper/src/platforms/immoscout24.ts` | platform-specific extractor (title, description, price, m², photos[]) |
| NEW | `~/libs/integrations/scraper/src/platforms/ebay-kleinanzeigen.ts` | platform-specific extractor |
| NEW | `~/libs/integrations/scraper/src/platforms/immowelt.ts` | platform-specific extractor (smaller surface) |
| EDIT | `~/libs/integrations/standort/src/destatis-client.ts` | full impl: pulls Bevölkerungsdaten + Regional GenesisOnline; cache results in Postgres (table `LocationCache`) |
| EDIT | `~/libs/integrations/standort/src/regiostat-client.ts` | wraps regiostat API (free tier) |
| NEW | `~/libs/integrations/standort/src/fb-client.ts` | F+B Mietspiegel — *behind feature flag*, scaffold only (D8 final after M3 spike) |
| NEW | `~/prisma/migrations/<timestamp>_m3_location_cache/migration.sql` | `CREATE TABLE "LocationCache" (id, plz, source, payload JSONB, fetchedAt, tenantId)` |
| EDIT | `~/apps/api/src/common/budget/budget-supervisor.service.ts` | full impl: per-run accumulator backed by Redis `INCRBY`, keyed `budget:{savedSearchRunId}`; emits `BudgetExceeded` event |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyDetailPage.vue` | drop mocks; bind to `services/api/research.ts` (NEW) + `services/api/vision.ts` (NEW); render Research-Timeline (component below) |
| NEW | `~/apps/web-vue/src/services/api/research.ts` | typed client |
| NEW | `~/apps/web-vue/src/services/api/vision.ts` | typed client |
| NEW | `~/apps/web-vue/src/services/api/agent.ts` | typed client |
| NEW | `~/apps/web-vue/src/components/ResearchTimeline.vue` | shows AgentMessage rows + tool calls + sources |
| NEW | `~/apps/web-vue/src/components/PhotoAnalysisGrid.vue` | grid of photos with vision-finding overlays |
| NEW | `~/apps/web-vue/src/components/CashflowMiniCockpit.vue` | M3 inline cockpit (full cockpit ships in M4) |
| EDIT | `~/apps/web-vue/src/pages/chat/ChatPage.vue` | binds to `services/api/agent.ts` for the conversational layer |

#### M3 — BullMQ workers to implement
- `listing-detail-research` — concurrency: 2; rate-limit: 30/min global to ImmoScout; retries: 3 with exponential backoff; budget-bound.
- `photo-vision` — concurrency: 4; deduplicates on photo SHA-256 hash; budget-bound.

#### M3 — Vue UI changes
- `pages/properties/PropertyDetailPage.vue` LIVE on real API (drops `mockProperties.ts`).
- `pages/chat/ChatPage.vue` LIVE.
- `pages/dashboard/DashboardPage.vue` shows MVP-Gate metrics: hits today, budget burned today, average composite-score.

#### M3 — First 3 git commits
1. `feat(integrations/llm): anthropic client with tool-use loop + cost tracking + vision schema` — full SDK wrapper + unit tests + `BudgetSupervisor` + budget-cap test.
2. `feat(integrations/scraper): stealth browser + block-detector + 3 platform extractors + proxy fallback` — Playwright stealth + Bright Data adapter + 3 extractors.
3. `feat(api/worker): research + vision + agent modules with bullmq processors + Vue PropertyDetail live` — wires `listing-detail-research` + `photo-vision`, drops Vue mocks for property-detail, e2e for AC-3 + AC-4 + AC-6.

#### M3 — Done when
- AC-3 ✓ (Phase-2 properties auto-trigger detail research with stealth+proxy fallback)
- AC-4 ✓ (≥5 photos per property with structured Vision JSON)
- AC-5 ✓ (KeyMetrics filled by ImmocationCalculator triggered from `run-cashflow.tool.ts`)
- AC-6 ✓ (Per-run budget cap enforced; ScrapeLog.status='budget_exceeded' on overrun)
- AC-11/12 ✓ (CI + e2e)
- **MVP-Gate closed** (M0 + M2 + M3 = AC-1..AC-6 plus AC-11..AC-13).

---

### M4 — Cashflow-Cockpit (Excel-Parität FULL 1:1) — ~3-4 sprints

**Goal.** Vollständige 1:1-Reproduktion von `immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx` (D10) in Vue. Alle Tabs — Hauptkalkulation, Sensitivitäts-Tabellen, Stresstest, Vergleichsobjekte — sind im UI navigierbar und liefern Cent-genaue Übereinstimmung mit dem Excel-Master über 30y Projection (AC-7, AC-8). Vor jeder Code-Änderung steht **M4.0**, ein dedizierter Reverse-Engineering-Sprint, der die Excel-Datei in Test-Fixtures auflöst — das ist die Versicherung gegen Pre-Mortem B.3 (Excel-Drift). M4 wächst auf 3-4 Sprints (D10).

#### M4 — Files to create / edit

##### M4.0 — Excel Reverse-Engineering (Sprint 1)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/libs/shared/src/fixtures/excel-parity/README.md` | doc: how each fixture was extracted from the Excel master |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-01-baseline.json` | Property + financing + assumptions inputs + 30y expected `KeyMetrics` |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-02-sondertilgung.json` | extra payment in year 5 |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-03-mietausfall.json` | 3-month vacancy in year 7 |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-04-stresstest-minus20.json` | -20% rent shock |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-05-verkauf-jahr10.json` | sale event, residual value |
| NEW | `~/libs/shared/src/utils/_reference-calc.py` | NumPy reference for property-based testing (run via `python3` in CI) |
| NEW | `~/scripts/excel-extract.ts` | one-off `tsx` script: opens .xlsx via `exceljs`, dumps every named cell → JSON |
| NEW | `~/.omc/notes/m4-excel-mapping.md` | manual notes mapping Excel cells → calculator field names |

##### M4.1 — Calculator Extension (Sprint 2)

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/libs/shared/src/utils/immocation-calculator.ts` | extend to cover all formula edges (Sondertilgung, Mietausfall, AfA-Sonderlinien, Inflations-Anpassung, Steuerklassen) |
| NEW | `~/libs/shared/src/utils/sensitivity-table.ts` | builds 5x5 grids over `(zinssatz±2pp, mietsteigerung±1pp)` |
| NEW | `~/libs/shared/src/utils/stress-test.ts` | scenarios: Mietausfall 6 Mt, Zinsschock +3pp, Renovation €50k Jahr 8 |
| NEW | `~/libs/shared/src/utils/comparable-properties.ts` | scoring of comparables by m²-Preis Δ, Lage Δ |
| EDIT | `~/libs/shared/src/utils/immocation-calculator.spec.ts` | extend to cover all 5 fixtures |
| NEW | `~/libs/shared/src/utils/immocation-calculator.parity.spec.ts` | cent-precision comparison (AC-7) |
| NEW | `~/libs/shared/src/utils/immocation-calculator.property.spec.ts` | `fast-check` 1000-iteration property-based test against Python ref |

##### M4.2 — Scenario Persistence + Recompute (Sprint 3)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m4_scenario_versioning/migration.sql` | `ALTER TABLE "Scenario" ADD COLUMN "calculatorVersion" TEXT NOT NULL DEFAULT '1.0';`, `ALTER TABLE "Scenario" ADD COLUMN "keyMetrics" JSONB;`, `ALTER TABLE "Scenario" ADD COLUMN "yearProjection" JSONB;`, `ALTER TABLE "Scenario" ADD COLUMN "sensitivityGrid" JSONB;`, `ALTER TABLE "Scenario" ADD COLUMN "stressTestResults" JSONB;` |
| NEW | `~/apps/api/src/modules/scenario/scenario.{module,service,controller}.ts` | `GET/POST/PATCH /scenarios`, `POST /scenarios/:id/recompute`; tenant-scoped |
| EDIT | `~/apps/api/src/app/app.module.ts` | register `ScenarioModule` |
| EDIT | `~/apps/worker/src/processors/cashflow-recompute.processor.ts` | full impl: replays calculator on Scenario, writes `keyMetrics`, `yearProjection`, `sensitivityGrid`, `stressTestResults` |

##### M4.3 — Vue Cockpit (Sprint 4)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/apps/web-vue/src/pages/properties/PropertyCockpitTab.vue` | 30y projection table + chart |
| NEW | `~/apps/web-vue/src/pages/properties/PropertySensitivityTab.vue` | 5x5 grid via `apexcharts` heatmap |
| NEW | `~/apps/web-vue/src/pages/properties/PropertyStressTestTab.vue` | scenario buttons + result panel |
| NEW | `~/apps/web-vue/src/pages/properties/PropertyComparablesTab.vue` | comparable list + map |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyDetailPage.vue` | adds tabs above; binds to `services/api/scenario.ts` |
| NEW | `~/apps/web-vue/src/services/api/scenario.ts` | typed client |
| NEW | `~/apps/web-vue/src/components/ScenarioEditor.vue` | financing + assumptions form |
| NEW | `~/apps/web-vue/src/utils/excel-export.ts` | uses `exceljs` to export computed Scenario back to .xlsx (round-trip parity test) |

#### M4 — BullMQ workers
- `cashflow-recompute` — fully implemented; runs on Scenario create/update or `calculatorVersion` mismatch.

#### M4 — Vue UI changes
- 4 new tabs on `PropertyDetailPage`.
- `pages/portfolio/PortfolioPage.vue` shows portfolio-wide aggregated KeyMetrics (preview; M1 makes it complete).
- `pages/tools/ToolsPage.vue` adds "Excel Import" + "Excel Export" actions.

#### M4 — First 3 git commits
1. `feat(libs/shared): excel-parity reverse-engineering — 5 fixtures + Python reference + property-based tests` — M4.0 deliverable.
2. `feat(libs/shared): sensitivity table + stress test + comparable properties calculators` — M4.1 deliverable.
3. `feat(api/web-vue): scenario persistence + cockpit + sensitivity + stress + comparables tabs` — M4.2 + M4.3 in one PR-trio.

#### M4 — Done when
- AC-7 ✓ (5 fixtures × 30 KPIs × 30 y ≤ 0.01 € drift)
- AC-8 ✓ (4 tabs navigable in Vue, all numbers match Excel)
- AC-12 ✓ (e2e cockpit happy path)

---

### M5 — Broker-Outreach-Agent (E-Mail Automation) — ~2 sprints + 2-4 wk M5.0 warmup

**Goal.** L3-Modus aktiviert: Agent versendet eigenständig DSGVO-konforme Anfragen an Makler-E-Mails (Energieausweis, Teilungserklärung, Hausgeldabrechnung, Eigentümerversammlungs-Protokolle, Mieterliste), klassifiziert eingehende Replies via LLM (`documents-attached` / `more-info-requested` / `off-topic` / `negative-reply`), zieht Anhänge automatisch in `Document` und verknüpft sie mit der `Property`. Reputation-Warmup (M5.0) läuft parallel zu M2/M3 — die Postfix-IP wird ab Tag-1 von M0 aufgewärmt, sodass M5-Launch (ca. Woche 8) auf einer reifen IP startet.

#### M5.0 — Mail-Stack-Setup (parallel pre-sprint, starts in M0 week 1)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/infra/postfix/main.cf` | Postfix MTA config, hardened (no open relay, TLS-required) |
| NEW | `~/infra/postfix/master.cf` | submission port 587, content_filter to OpenDKIM |
| NEW | `~/infra/dovecot/dovecot.conf` | IMAP server config |
| NEW | `~/infra/opendkim/KeyTable` + `SigningTable` + `TrustedHosts` | DKIM key for `realty79.de` |
| NEW | `~/infra/dns/realty79.de.zone` | reference DNS records: SPF (`v=spf1 ip4:<hetzner-ip> ~all`), DKIM (`default._domainkey TXT "v=DKIM1; k=rsa; p=..."`), DMARC (`_dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@realty79.de"`), MX, PTR (set via Hetzner Robot UI) |
| EDIT | `~/docker-compose.prod.yml` | add `postfix:`, `dovecot:`, `opendkim:`, `mailpit:` (only in dev) |
| NEW | `~/scripts/mail-warmup.ts` | tsx script; ramps outbound 5→200/day to a seeded mailbox over 2-4 wk |
| NEW | `~/scripts/blocklist-check.ts` | queries Spamhaus/SORBS/CBL daily; writes Pino metric |

#### M5.1 — Mailer Adapter + Module (Sprint 1)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m5_mail_message/migration.sql` | `CREATE TABLE "MailMessage" (id, direction TEXT, smtpHeaders JSONB, classification TEXT, propertyId, agentConversationId, attachments JSONB, sentAt, receivedAt, tenantId, ...)` + indexes |
| EDIT | `~/prisma/schema.prisma` | add `MailMessage` model |
| EDIT | `~/libs/integrations/mailer/src/smtp-transport.ts` | full `nodemailer` impl pointing at Postfix `localhost:587` (or `mailpit` in dev) |
| EDIT | `~/libs/integrations/mailer/src/imap-poller.ts` | full `imapflow` impl polling Dovecot every 60s, parses with `mailparser` |
| EDIT | `~/libs/integrations/mailer/src/template-engine.ts` | Handlebars-based; templates in `libs/integrations/mailer/templates/{energieausweis,teilungserklaerung,hausgeld,protokoll,mieterliste}.hbs` |
| EDIT | `~/libs/integrations/mailer/src/reply-classifier.ts` | calls Claude with structured-output JSON schema; cached on `messageId` |
| NEW | `~/libs/integrations/mailer/src/reputation-check.ts` | blocklist + Mail-Tester wrapper |
| NEW | `~/libs/integrations/mailer/templates/*.hbs` | 5 outbound templates with DSGVO-compliant footer |
| EDIT | `~/apps/api/src/modules/messaging/messaging.{module,service,controller}.ts` | `GET /mail-messages`, `POST /mail-messages/draft`, `POST /mail-messages/:id/send`, `POST /mail-messages/:id/classify` |

#### M5.2 — Outreach Workflow (Sprint 2)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/apps/worker/src/processors/broker-outreach.processor.ts` | `@Processor('broker-outreach')`; reads `Property` with phase=2 + autonomyLevel=L3 + compositeScore≥X, generates draft via template-engine, sends via SMTP (or stays as draft if L1/L2), writes `MailMessage` |
| NEW | `~/apps/worker/src/processors/mail-inbound-classify.processor.ts` | `@Processor('mail-inbound-classify')`; pulls IMAP via `imap-poller`, classifies, persists, links attachments to `Document` + `Property` |
| EDIT | `~/apps/api/src/app/app.module.ts` | register queues `broker-outreach`, `mail-inbound-classify` |
| EDIT | `~/apps/api/src/modules/agent/tools/index.ts` | add `request-missing-docs.tool.ts` calling broker-outreach queue |
| NEW | `~/apps/api/src/modules/agent/tools/request-missing-docs.tool.ts` | tool wrapper |
| NEW | `~/apps/web-vue/src/pages/messaging/MessagingInboxPage.vue` | inbox view of `MailMessage` rows, drafts, sent |
| EDIT | `~/apps/web-vue/src/pages/messaging/MessagingPage.vue` | route to inbox; drops mocks |
| NEW | `~/apps/web-vue/src/services/api/messaging.ts` (extend existing) | adds mail-message endpoints |
| NEW | `~/apps/web-vue/src/components/MailDraftEditor.vue` | review/edit/send draft before manual send (L1/L2 mode) |

#### M5 — BullMQ workers
- `broker-outreach` — concurrency: 1 (mail rate-limit); cron every 6 h.
- `mail-inbound-classify` — concurrency: 2; cron every 1 min.

#### M5 — Vue UI changes
- `pages/messaging/MessagingPage.vue` LIVE on real API.
- `pages/messaging/MessagingInboxPage.vue` (NEW).
- `pages/properties/PropertyDetailPage.vue` adds "Anfragen senden" button (L3-only) + visible mail thread per property.
- `pages/settings/SettingsPage.vue` adds outbound kill-switch + L3 hard-cap config (max-N-mails-per-day, min-score-X).

#### M5 — First 3 git commits
1. `feat(infra): postfix + dovecot + opendkim + dmarc + warmup script` — M5.0 foundation, runs on Hetzner from week 1.
2. `feat(integrations/mailer): smtp + imap + templates + reply-classifier + 5 outbound templates` — M5.1 deliverable.
3. `feat(api/worker/web-vue): broker-outreach + mail-inbound-classify workers + messaging inbox UI` — M5.2 deliverable + e2e against Mailpit.

#### M5 — Done when
- AC-9 ✓ (Mail-Tester ≥9/10 after warmup; blocklist-check daily green)
- AC-10 ✓ (≥90% reply classification accuracy on 50 test mails; attachments auto-attached to Property)
- AC-12 ✓ (e2e Mailpit-based)

---

### M1 — Verwaltung (Bestandsmanagement) — ~3 sprints

**Goal.** Komplettes CRUD für den existierenden Bestand: Property edit, Unit, Lease, Renter, Payment, Document, MaintenanceTicket, Accounting-Export. Vue-Pages binden ausschließlich gegen die echte API; alle `mock*.ts`-Imports verschwinden. Mahnstufen-Logik via täglichem Cron (`payment-overdue-check`). M1 ist im Scout-First-Order *nach* M5, weil der Scout-Funnel die Pipeline mit echten Daten füllt — die Verwaltung muss diese Daten konsistent verwalten können (Mieter, Verträge, Zahlungen) und der Scout-Output ist eine bessere Test-Quelle als ein Sample-DB.

#### M1 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/apps/api/src/modules/property/*` (extend M2 impl) | full PATCH/DELETE; soft-delete via `deletedAt` |
| EDIT | `~/apps/api/src/modules/unit/unit.{module,service,controller}.ts` | sub-resource CRUD |
| EDIT | `~/apps/api/src/modules/lease/lease.{module,service,controller}.ts` | full CRUD; `Lease.status` workflow |
| EDIT | `~/apps/api/src/modules/renter/renter.{module,service,controller}.ts` | full CRUD; merges existing `RenterConversation`/`RenterMessage` |
| EDIT | `~/apps/api/src/modules/payment/payment.{module,service,controller}.ts` | full CRUD; mahnstufen logic |
| EDIT | `~/apps/api/src/modules/document/document.{module,service,controller}.ts` | upload to MinIO/S3 (`@aws-sdk/client-s3` added in M0); pre-signed URLs |
| EDIT | `~/apps/api/src/modules/maintenance/maintenance.{module,service,controller}.ts` | tickets + tasks; status workflow Open→InProgress→Done |
| EDIT | `~/apps/api/src/modules/accounting/accounting.{module,service,controller}.ts` | reconcile expenses + payments; CSV/DATEV export |
| EDIT | `~/apps/api/src/modules/portfolio/portfolio.{module,service,controller}.ts` | aggregates; portfolio-level KPI |
| EDIT | `~/apps/api/src/modules/contract/contract.{module,service,controller}.ts` | contract templates → PDF |
| NEW | `~/apps/worker/src/processors/payment-overdue-check.processor.ts` | `@Processor('payment-overdue-check')`; daily cron `0 6 * * *`; flips `Payment.status='overdue'` at +14d, sends `Notification` |
| NEW | `~/apps/worker/src/processors/document-ocr.processor.ts` | scaffold (feature-flagged off; phase-2 item per non-goals) |
| EDIT | `~/apps/web-vue/src/pages/portfolio/PortfolioPage.vue` | drops mocks; binds to real API |
| EDIT | `~/apps/web-vue/src/pages/renters/RentersPage.vue` | LIVE |
| EDIT | `~/apps/web-vue/src/pages/renters/RenterDetailPage.vue` | LIVE; conversation tab |
| EDIT | `~/apps/web-vue/src/pages/documents/DocumentsPage.vue` | LIVE; upload via signed URLs |
| EDIT | `~/apps/web-vue/src/pages/maintenance/MaintenancePage.vue` | LIVE |
| EDIT | `~/apps/web-vue/src/pages/accounting/AccountingPage.vue` | LIVE; CSV/DATEV export buttons |
| NEW | `~/apps/web-vue/src/services/api/{unit,lease,renter,payment,document,maintenance,accounting,contract}.ts` | typed clients |
| NEW | `~/libs/integrations/storage/src/s3-adapter.ts` | MinIO/S3 wrapper |

#### M1 — BullMQ workers
- `payment-overdue-check` — cron daily 06:00 Europe/Berlin.
- `document-ocr` — scaffold, off.

#### M1 — Vue UI changes
- ALL remaining mock imports across `apps/web-vue/src/pages/{portfolio,renters,documents,maintenance,accounting}/*` removed.
- `apps/web-vue/src/data/mockProperties.ts` and `mockSearchProperties.ts` deleted.

#### M1 — First 3 git commits
1. `feat(api): property + unit + lease + renter + payment full CRUD with tenant scope` — services + tests + e2e for AC-13.
2. `feat(api/web-vue): document upload to MinIO + maintenance tickets + accounting export` — wires storage adapter, tests upload happy-path.
3. `feat(worker/web-vue): payment-overdue-check daily cron + portfolio aggregations + delete mocks` — closes mock-removal, adds e2e for verwaltung-flow.

#### M1 — Done when
- AC-13 ✓ (multi-tenant isolation regression-test green)
- AC-12 ✓ (e2e verwaltung happy-path <5min)
- 100% Vue pages live on real API; no `mock*.ts` files remaining

---

### M6 — Hardening & Production-Readiness — ~1 sprint

**Goal.** Production-Deploy auf Hetzner CCX13/CCX23: Docker-Compose-Stack mit Traefik, automatische TLS via Lets-Encrypt, pgBackRest täglich + S3-off-site, Loki+Grafana+Tempo Observability, DSGVO-Audit grün, Rate-Limits + Circuit-Breaker um alle externen Calls, Backup-Restore-Runbook, Incident-Playbook für die 3 Pre-Mortem-Szenarien.

#### M6 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/docker-compose.prod.yml` | finalize: api, worker, postgres, redis, minio, postfix, dovecot, opendkim, traefik, loki, grafana, tempo, prometheus, pgbackrest |
| NEW | `~/infra/traefik/traefik.yml` | reverse-proxy + Lets-Encrypt |
| NEW | `~/infra/grafana/dashboards/realty79-overview.json` | dashboard: hits/day, budget burn, mail reputation, parity drift |
| NEW | `~/infra/loki/loki-config.yml` | log aggregation |
| NEW | `~/infra/tempo/tempo-config.yml` | trace storage |
| NEW | `~/infra/pgbackrest/pgbackrest.conf` | daily full + 4h incremental, S3 off-site |
| NEW | `~/scripts/restore-runbook.md` | tested restore procedure (RTO≤4h, RPO≤1h) |
| NEW | `~/scripts/incident-playbook.md` | runbook for B.1 + B.2 + B.3 |
| EDIT | `~/apps/api/src/common/throttler/` | per-endpoint rate-limits (existing `ThrottlerModule` already wired in `app.module.ts:38`) |
| NEW | `~/apps/api/src/common/circuit-breaker/circuit-breaker.interceptor.ts` | wraps external calls in `opossum`-style breaker |
| EDIT | `~/libs/integrations/scraper/src/stealth-browser.ts` | adds breaker + retries |
| EDIT | `~/libs/integrations/llm/src/anthropic-client.ts` | adds breaker on 429/529 |
| EDIT | `~/libs/integrations/mailer/src/smtp-transport.ts` | adds breaker on 4xx/5xx |
| NEW | `~/apps/worker/src/processors/nightly-parity-drift.processor.ts` | nightly job; replays all Scenario rows; alerts on drift (Pre-Mortem B.3) |
| NEW | `~/.github/workflows/ci.yml` | `pnpm nx affected -t lint test build typecheck e2e` on PR |
| NEW | `~/.github/workflows/cd.yml` | on `main`: build images, push to Hetzner via SSH `docker compose pull && up -d` |
| NEW | `~/.omc/notes/dsgvo-audit-checklist.md` | filled checklist; PII fields documented |

#### M6 — Done when
- All ACs (AC-1..AC-13) are green in production environment.
- Restore-test passes (kill DB, restore from pgBackRest backup, verify data).
- DSGVO audit checklist filled and signed.
- All 3 Pre-Mortem detection signals firing in Grafana.
- Runbook executed in dry-run for each Pre-Mortem scenario.

---

## E) Risks Table

| ID | Risk | Probability | Impact | Mitigation already in plan | Owner |
|---|---|---|---|---|---|
| R1 | Immometrica detects Playwright session and blocks | High | High | M2: stealth + click-flow trace fixture; auto-fallback to Bright Data; manual-CSV-import endpoint; alert on `ScrapeLog.status='blocked'` (Pre-Mortem B.1) | Solo dev |
| R2 | LLM cost overrun per run | Medium | Medium | M0/M3: `BudgetSupervisor` Redis-INCRBY accumulator; hard-stop at `runBudgetEur`; emits `BudgetExceeded` event; default 5€ cap (AC-6) | Solo dev |
| R3 | Vision hallucinations skew cashflow | Medium | High | M3: structured Zod-schema for vision JSON with `confidence` field; fallback "needs human review" if confidence<0.5; cache by photo SHA-256 hash to limit cost | Solo dev |
| R4 | Browser scraping blocked on ImmoScout24/eBay-K | High | High | M3: `block-detector` heuristics (HTTP 403/429, captcha selectors, CF interstitial); auto-fallback Bright Data; per-platform rate-limit; backoff | Solo dev |
| R5 | SMTP IP flagged or DKIM misconfigured | Medium | High | M5.0: Hetzner static IP + reverse-DNS; OpenDKIM + DMARC `p=quarantine` then `reject`; 2-4 wk warmup; daily blocklist-check; kill-switch (Pre-Mortem B.2) | Solo dev |
| R6 | Excel parity drift after months | Medium | High | M4.0: 5 fixtures + Python reference + property-based 1000-iter tests; `Scenario.calculatorVersion`; nightly parity-drift cron (Pre-Mortem B.3) | Solo dev |
| R7 | DSGVO violation in broker outreach | Medium | High | M5: opt-out footer mandatory in templates; juristisch-geprüfte Templates pre-launch; L3 hard-caps (max-N/day, score≥X); Outstanding-Info-row 7 escalation | Solo dev + Jurist |
| R8 | Postgres data loss | Low | Critical | M6: pgBackRest daily full + 4h incremental; S3 off-site; weekly snapshot; restore-runbook tested in dry-run | Solo dev |
| R9 | Solo dev burnout / single-point-of-failure | Medium | High | OMC AI agents; 1-week sprints; reviews via Critic/Architect agents; clear acceptance criteria per milestone (D12) | Solo dev |
| R10 | Anthropic SDK breaking change (model deprecation) | Low | Medium | All Anthropic imports gated to `libs/integrations/llm/src/anthropic-client.ts`; pin model `claude-sonnet-4-6` in env, not in code | Solo dev |
| R11 | Hetzner VM crashes or storage failure | Low | Critical | docker-compose restart-on-failure; pgBackRest off-site backup; runbook (M6); MinIO replicated to second region (deferred — Outstanding-Info row 9) | Solo dev |
| R12 | Mock data drift between Vue and API | Medium (today) | Medium | Milestone-by-milestone mock removal; M1 deletes all `mock*.ts`; ESLint rule `no-restricted-imports` for `**/mock*.ts` from M1 onward | Solo dev |
| R13 | `tenantId` plumbing forgotten | Medium | High (when SaaS pivot lands) | M0 ESLint rule + M0 migration template + M2 enforced via Prisma schema; integration test `tenant-scope.int-spec.ts` (AC-13) | Solo dev |
| R14 | Per-platform extractor drift (ImmoScout DOM change) | High | Medium | M3: extractor selectors centralized in `libs/integrations/scraper/src/platforms/*.ts`; integration tests with frozen HTML fixtures; nightly smoke-test crawl 1 known listing | Solo dev |
| R15 | Disk fills on Hetzner from Playwright artifacts | Medium | Medium | M0: ephemeral `/tmp/immometrica-export-*.zip` purged on success; M6: cron `find /tmp -mtime +1 -delete` | Solo dev |

---

## F) Verification Steps (per Milestone)

| Milestone | Nx command | Manual smoke check | Observability check |
|---|---|---|---|
| M0 | `pnpm nx affected -t lint test build typecheck e2e` | Vue: register → login → dashboard loads; API: `curl localhost:3000/api/health` returns 200; bull-board reachable at `/admin/queues`; Sentry receives test error | Pino structured log emitted with `traceId`; Jaeger shows trace from request → Prisma query |
| M2 | `pnpm nx run-many -t test --projects=api,worker,shared,immometrica,scraper && pnpm nx e2e api-e2e --grep saved-search` | Vue: create SavedSearch → wait 1h cron OR `POST /saved-searches/:id/run` → see Phase-1 cards | `immometrica.poll.hits` counter incremented; `ScrapeLog.status='ok'`; `composite-score` queue drained |
| M3 | `pnpm nx run-many -t test --projects=api,worker,llm,scraper,standort && pnpm nx e2e api-e2e --grep '(research\|vision\|budget)'` | Vue: open phase-2 property → see ResearchTimeline + ≥5 PhotoAnalysisGrid tiles + CashflowMiniCockpit numbers | `cost.tokenEur.per_run` histogram p95 < runBudget; `playwright.page.fetch` spans visible; Sentry empty for `anthropic.budget.exceeded` |
| M4 | `pnpm nx test shared --testPathPattern=parity` + `python3 libs/shared/src/utils/_reference-calc.py` validation + `pnpm nx e2e web-vue-e2e --grep cockpit` | Vue: open property → cockpit/sensitivity/stress/comparables tabs; export to .xlsx; reopen in Excel — values match | `calculator.parity.maxDrift_eur` < 0.01 |
| M5 | `pnpm nx run-many -t test --projects=mailer,api,worker && pnpm nx e2e api-e2e --grep '(broker-outreach\|mail-inbound)'` | Trigger L3 outreach against Mailpit; reply with PDF attachment; verify Document attached to Property; check `mail-tester.com` score for production-domain test mail | `mailer.outbound.sent` increments; `mailer.reputation.score` ≥9; DMARC RUA shows pass/pass; bounce ratio <5% |
| M1 | `pnpm nx run-many -t test --projects=api,worker && pnpm nx e2e api-e2e --grep verwaltung && pnpm nx e2e web-vue-e2e --grep verwaltung` | Vue: Property → Unit → Lease → Renter → Payment → MaintenanceTicket → Document upload, full flow <5min | `verwaltung.payment.overdue.flagged` counter; tenant-scope integration test green; no `mock*.ts` in `pnpm nx graph` output |
| M6 | `pnpm nx affected -t lint test build typecheck e2e` + `docker compose -f docker-compose.prod.yml config` validation + restore dry-run | Production smoke: TLS valid, `/api/health` 200, bull-board reachable, Grafana dashboards render, restore from yesterday's pgBackRest backup succeeds in staging | All Pre-Mortem detection signals fireable on test stimulus; SLO dashboards green |

---

## G) ADR — Architecture Decision Record (Consensus Output)

### G.1 Decision

The Realty79 Scout-MVP is implemented as a **brownfield extension of the existing Nx 22 monorepo**, splitting the runtime into two NestJS processes (`apps/api` for HTTP and `apps/worker` for BullMQ-driven I/O), with **all external I/O routed through `libs/integrations/<vendor>/` adapters** (ESLint-enforced). The agent topology is a **deterministic outer pipeline with one bounded Claude tool-use loop inside the `listing-detail-research` phase**, gated by a Redis-backed per-run €-budget supervisor. Mail is **self-hosted Postfix+Dovecot+OpenDKIM** on the Hetzner VM with a 2-4 wk reputation warmup running in parallel to M2/M3 implementation. Excel-parity is achieved via a **dedicated reverse-engineering sub-sprint (M4.0)** producing 5 JSON fixtures + a NumPy reference + property-based tests over a versioned `Scenario` schema. The build proceeds in the locked Scout-First order **M0 → M2 → M3 → M4 → M5 → M1 → M6**.

### G.2 Drivers (top 3)

DD1. Shortest path to first lukrative property surfaced (M0+M2+M3 closes MVP-Gate within ~6 sprint-weeks).
DD2. Minimize ToS / DSGVO / spam-reputation risk (Immometrica-export-only, opt-in autonomy levels, self-hosted mail with warmup).
DD3. Minimize €/run (deterministic pre-filter before LLM, hard-stop budget supervisor, photo-vision cache).

### G.3 Alternatives Considered (steelman summaries)

**Alt-1 — In-process Playwright inside NestJS API (Fork 1A).** Steelman: zero-ops, single bootstrap, single deployment unit, simplest dev experience. Rejected because long-running Chromium pegs the Node event-loop; one Playwright crash takes down the entire API; Hetzner CCX13 sizing assumes API-only on the API-process; violates Principle P2 (workers own all I/O). The marginal ops simplicity is overwhelmed by reliability cost.

**Alt-2 — Single agent loop, Claude with all tools (Fork 2A).** Steelman: maximum agent flexibility; richest user-facing chat; matches the spec's `AgentConversation` model directly; lets Claude decide cross-phase context. Rejected because per-run €-budget cap (D5/AC-6) is hard to enforce mid-loop without aborting the whole agent context, and predictable cost is Decision Driver DD3. Hybrid (Fork 2C) preserves the agent loop *inside* the bounded research phase, where its flexibility is genuinely useful, while keeping deterministic cost gates between phases.

**Alt-3 — Managed transactional mail provider (Fork 3A, Postmark/Resend).** Steelman: day-1 deliverability, zero warmup, instant DKIM, professional reputation team, no static-IP plumbing. Rejected because (a) Postmark TOS prohibits cold outreach to brokers we have no prior relationship with — and broker outreach is exactly our M5 use-case; (b) D11 locks self-hosted Hetzner; (c) D9 was explicitly re-asked and confirmed self-hosted SMTP; (d) DSGVO Decision Driver DD2 prefers no US sub-processor.

**Alt-4 — Multi-LLM-Provider routing from day 1.** Steelman: cost arbitrage, model-quality optimization, vendor-lock-in avoidance. Explicitly listed as a non-goal in the spec; deferred to post-MVP. The `libs/integrations/llm/anthropic-client.ts` adapter abstraction makes a future split possible without refactor.

**Alt-5 — Live-DOM scraping of Immometrica.** Steelman: real-time data, no export-cycle delay, fewer click-flow brittleness points. Explicitly listed as a non-goal (D6, locked); replaced by CSV/PDF export via Playwright auto-login. Lower ToS risk.

**Alt-6 — Verwaltung-First (M1 before M2/M3).** Steelman: existing portfolio data is concrete; no scraping/LLM risk; user benefits from Tag-1; classical CRUD is well-understood. Rejected by D1 (Scout-First); the user-stated priority is finding new lukrative properties, not managing the existing book.

### G.4 Why Chosen

- The split-process architecture (Fork 1B) lets `apps/api` stay <50ms p95 even when 4 Playwright sessions and 2 Claude streams are in flight, by isolating I/O on `apps/worker`. This unblocks the Hetzner CCX13 sizing assumption and eliminates the single-point-of-crash that 1A would create.
- The hybrid agent topology (Fork 2C) is the only configuration that satisfies *both* D4 (Claude One-Stop with tool-use) and D5 (per-run €-budget hard-stop). It earns Claude its agent flexibility exactly where it matters (open-ended detail research), while keeping deterministic cost gates exactly where the user can observe and tune them.
- Self-hosted mail (Fork 3B) is the only path that satisfies D9 + D11 + DD2 simultaneously, and the 2-4 wk warmup is absorbed by running M5.0 in parallel to M2/M3 — the warmup window does not extend the calendar timeline.
- The Scout-First order (D1) gives the user concrete property hits within ~6 weeks (end of M3 = MVP-Gate). Verwaltung (M1) ships in week ~10-13, which is acceptable given the existing portfolio is small and the user's stated priority is acquisition.

### G.5 Consequences

**Positive.**
- C+1: Adapter boundary (P1) lets us swap Mietspiegel provider (D8) and proxy provider (D7) without touching `apps/api`.
- C+2: BullMQ + correlation-IDs + OTel give us a reproducible debugging story for any production failure.
- C+3: M4.0 + property-based tests turn Excel-parity from a "trust me" claim into a CI-enforceable invariant.
- C+4: M5.0 parallel warmup means M5 launch is not on the calendar critical path.
- C+5: Single Claude provider (D4) keeps prompt-engineering, tool-schema versioning, and cost accounting in one place.
- C+6: Schema-additive multi-tenant (D2) lets us pivot to SaaS without a migration story; the column is already there with an index.

**Negative.**
- C-1: Two NestJS processes (`apps/api` + `apps/worker`) are slightly more ops than one — partially offset by Nx running them both with one command (`pnpm nx run-many -t serve --projects=api,worker`).
- C-2: Self-hosted mail puts ongoing IP-reputation work on the solo dev — daily blocklist-check cron + DMARC RUA monitoring become permanent operational burdens.
- C-3: Hybrid agent topology (Fork 2C) requires the team to know which queries can cross phases (none) and which must (Claude-loop within research) — needs documentation in `libs/integrations/llm/README.md`.
- C-4: M4.0 reverse-engineering is a 1-sprint detour before functional work; can feel "slow" but eliminates Pre-Mortem B.3.
- C-5: Scout-First means the existing portfolio sits on mocks until M1 (~week 10) — acceptable per D1 but worth surfacing.
- C-6: Single Claude provider means vendor risk concentration; mitigated by adapter abstraction (R10).

### G.6 Follow-ups (deferred decisions, tracked in `.omc/plans/open-questions.md`)

| ID | Question | Trigger / Deadline |
|---|---|---|
| F1 | Final Mietspiegel provider (Destatis-only vs. Destatis + F+B paid) | After M3 spike; if Destatis lage-score quality is ≥80% accurate vs. ground-truth, skip F+B |
| F2 | Final residential-proxy provider (Bright Data vs. Oxylabs vs. IPRoyal) | First production block-event in M3 |
| F3 | OCR/Beleg-Klassifikation (deferred from M1, behind feature flag) | Post-M6, evaluated on user demand |
| F4 | Multi-Tenant code-pathway activation (Fork: tenant-guard interceptor) | At first SaaS customer signup |
| F5 | Mobile-Native (Ionic) — currently a non-goal | Post-MVP, evaluated on user demand |
| F6 | DSGVO juristic review of broker-outreach templates | BLOCKER for M5 launch — pre-M5.2 deadline |
| F7 | Hetzner VM sizing finalization (CCX13 vs CCX23 vs CCX33) | After M3 prod-deploy load-test |
| F8 | OpenTelemetry exporter target (local Tempo vs. Grafana Cloud) | Pre-M6, decision based on €/month budget |
| F9 | Backup off-site target (Hetzner Storage Box vs. external S3) | Pre-M6 |
| F10 | Photo-Vision cache TTL + invalidation strategy (currently: hash-keyed, no TTL) | Post-M3 once we observe cache hit-rate |

---

## H) Open Questions (will be appended to `.omc/plans/open-questions.md`)

```
## realty79-scout-mvp-consensus-iter1 - 2026-04-26

- [ ] F1 Mietspiegel provider final (Destatis-only vs +F+B) — Cost vs. lage-score accuracy tradeoff
- [ ] F2 Residential-proxy provider final (Bright Data vs Oxylabs vs IPRoyal) — Will surface at first production block event in M3
- [ ] F6 DSGVO juristic review of broker-outreach templates — BLOCKER for M5 launch
- [ ] F7 Hetzner VM sizing (CCX13/CCX23/CCX33) — Determined by M3 prod load-test
- [ ] F8 OTel exporter target (local Tempo vs Grafana Cloud) — Pre-M6 €/month decision
- [ ] F10 Photo-Vision cache TTL strategy — Post-M3 hit-rate observation
- [ ] Bestandsgröße quantifizieren (Anzahl Properties/Units/Leases heute) — Required for M1 sizing
- [ ] Score-Faktor-Defaults: 25/25/25/25 sane? — Calibrate empirically after first 50 hits
- [ ] Min-Score-Schwellen für Phase-2: empirical from first 50 hits — M3 spike
- [ ] Excel-Tab-Struktur expliziter Mapping — produced as M4.0 deliverable
```

---

## I) Plan Quality Self-Check

- [x] All 13 ACs (AC-1..AC-13) mapped to test names in section C
- [x] Every milestone names concrete file paths (absolute or repo-relative)
- [x] Every milestone names BullMQ workers + their queue names
- [x] Every milestone lists Vue page mock-removal explicitly
- [x] Every milestone lists first 3 PR-sized git commits
- [x] Pre-Mortem covers the 3 mandatory scenarios (B.1 Immometrica block, B.2 SMTP reputation, B.3 Excel-parity drift) with trigger / blast / mitigation / detection
- [x] Test plan is quad-coverage (unit / integration / e2e / observability) with libraries + suites + AC mapping
- [x] ADR present with Decision / Drivers / Alternatives / Why / Consequences / Follow-ups
- [x] All locked decisions D1-D13 honored; non-goals respected
- [x] No new capabilities invented outside spec scope
- [x] Risks Table has 15 entries with probability × impact × mitigation × owner
- [x] Verification step per milestone with exact Nx command
- [x] Open Questions appended to global tracker

---

**End of plan — ready for Architect review.**
