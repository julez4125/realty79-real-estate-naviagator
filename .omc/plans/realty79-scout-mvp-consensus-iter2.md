# Realty79 Scout-MVP — Consensus Plan (RALPLAN-DR Deliberate, Iteration 2)

**Plan ID:** `realty79-scout-mvp-consensus-iter2`
**Mode:** RALPLAN-DR Deliberate (high-risk: solo dev, brownfield, ToS-sensitive scraping, self-hosted SMTP)
**Generated:** 2026-04-26
**Author Stage:** Planner (iter 2 — consumes Architect + Critic reviews of iter 1)
**Inputs consumed:**
- Iter 1 plan: `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1.md`
- Architect review: `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-architect-review.md` (verdict: APPROVED-WITH-IMPROVEMENTS, 7 numbered + 3 soft items)
- Critic review: `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-critic-review.md` (verdict: ITERATE, 7 surgical edits)
**Spec:** `/opt/realty79-real-estate-naviagator/.omc/specs/deep-interview-realty79-scout-mvp.md` (12% ambiguity, 13 ACs, 22 entities)
**Roadmap-Plan:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-roadmap.md` (Locked Decisions D1–D13)
**Repo:** `/opt/realty79-real-estate-naviagator` (Nx 22 / NestJS 11 / Vue 3 / Prisma 7 / Postgres 16 / Redis 7 / BullMQ 5)

---

## § Iter-2 Changelog (mapping reviewer findings → plan sections)

### Critic surgical edits (§9 of critic review, items 1–7)

| # | Critic edit | Landed in |
|---|---|---|
| 1 | Tool-Use Loop Abort Semantics (cancel-policy, partial-write rules, Anthropic streaming token-billing reconciliation, deterministic test fixture `budget-cap.abort-semantics.int-spec.ts`) | **§D.M3 — new sub-section D.M3.5 "Tool-Use Loop Abort Semantics"**; AC matrix row AC-6; risks R2 |
| 2 | Relocate agent-tool files from `apps/api/src/modules/agent/tools/` to `libs/agent-tools/` AND specify `POST /agent/conversations/:id/messages` as `202 {jobId, pollUrl}` | **§D.M0** (lib scaffold added), **§D.M3** (file paths corrected, agent.controller.ts contract specified), **§D.M3.6 "Async Agent-Conversation Contract"** |
| 3 | Lift AC-3 manual-eval thresholds (≥80% Lokalisierungen, ≥70% Zustandseinschätzungen on 10 reference properties) into Done-when for M3 + versioned eval artifact `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md` | **§D.M3 Done-when**; **§C.1/C.4 manual-eval row**; AC matrix AC-3 |
| 4 | Split AC-5 into AC-5a (M3, KeyMetrics non-null) and AC-5b (M4, full Vue cockpit visibility) | **AC matrix § matrix**; **§D.M3 Done-when** (AC-5a only); **§D.M4 Done-when** (AC-5b) |
| 5 | Add `tenantId` FK constraint in M2/M3/M5 migrations: `ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id)` | **§D.M2 migration row**; **§D.M3 migration row**; **§D.M5.1 migration row**; AC matrix AC-13 |
| 6 | M5.0 abort criterion (Mail-Tester <8/10 after 4 wk → fall back to Resend / Mailgun-Frankfurt with EU-DPA) + detection signals for R3, R4, R7, R11, R14 | **§D.M5.0 (new "Abort & Fallback" sub-section)**; **§E Risks Table** rewritten with detection-signal column |
| 7 | Steelman F2 properly (deterministic FSM with Claude `tools:[]` + structured output) AND justify why hybrid 2C still wins; same depth for F1 (Architect's "BullMQ Worker inside API process" middle-ground) | **§A.3 forks rewritten**; **§G.3 ADR Alternatives expanded** |

### Architect tensions to address (besides the 7 above)

| # | Architect tension | Landed in |
|---|---|---|
| A | 2-process split + SMTP warmup parallel attention-bandwidth trap (T1) — pick: delay M5.0 by 3 wk OR accept AC-9 slip | **§A.4 "Calendar & Attention" decision**, **§D.M5.0 sequencing**, **§E Risks R5/R9 detection signals**, **§G.5 Consequences C-2** |
| B | ESLint-enforced adapter boundary (T3) — name exact rule + file, OR downgrade language | **§A.1 P1 rewrite**, **§D.M0 ESLint EDIT row** with exact rule names + per-lib `package.json` scoping |
| C | M4.0 Excel reverse-engineering cap — exact named-range count, max 1 wk, freeze-criterion if exceeded | **§D.M4.0 sub-section** rewritten with cap + freeze gate |
| D | `scoring-engine.evaluatePhase1` vs new `computeCompositeScore` relationship/migration | **§D.M2 (new "Scoring-Engine Migration" sub-section)**, **§G.5 Consequences C+7** |

### Architect "soft" recommendations (graded into plan)

- Soft-1 (M0.5 portfolio read-only wiring) — added as **§D.M0.5** half-sprint.
- Soft-2 (`cashflow-recompute` request-time path out of BullMQ) — applied: **§D.M3 + §D.M4** put pure function in `libs/shared/src/utils/scenario-recompute.ts`, worker only for cron + version-bump fan-out.
- Soft-3 (adapter deps in per-lib `package.json`, not root) — applied **§D.M0** package.json EDIT rows.

### Items kept verbatim from iter 1 (passed Critic gates)

- §B Pre-Mortem (3 scenarios) — passed.
- §C Test Plan structure (Quad-Coverage) — passed (extended for AC-3 manual-eval, AC-5a/5b, AC-6 abort-semantics).
- Brownfield Truth Table — kept; one-line addendum on `MailMessage` model + `tenantId` FK constraint readiness.
- Milestone order **M0 → M0.5 → M2 → M3 → M4 → M5 → M1 → M6** (M0.5 inserted; rest unchanged from D1).

---

## Brownfield Truth Table (verified 2026-04-26, unchanged from iter 1 except where noted)

Numbers anchor the plan. Cited inline below.

| Fact | Verified Path / Line | Status |
|------|----------------------|--------|
| App-Module wires 23 modules | `apps/api/src/app/app.module.ts:29-66` | Wired, services empty |
| Scout/AI/Mgmt module stubs are 0 bytes | `apps/api/src/modules/{property,analysis,pipeline,config,scraper,agent,research,vision,portfolio,unit,lease,renter,payment,document,contract,messaging,notification,maintenance,accounting,auth,billing,health}/{*.module,*.service,*.controller,*.processor}.ts` | All 0 Apr 6 17:31 |
| BullMQ processors: only 2 stubs exist | `apps/api/src/modules/scraper/scraper.processor.ts`, `pipeline.processor.ts` | Stubs |
| BullMQ wiring | `apps/api/src/app/app.module.ts:32-37` | Wired |
| Vue uses `pages/`, NOT `views/` | `apps/web-vue/src/pages/{search,properties,portfolio,renters,...}/` | Active |
| Pinia stores | `apps/web-vue/src/stores/{actions,auth,global-store,notifications,index}.ts` | Active |
| `libs/shared` calculator + scoring + filter | `libs/shared/src/utils/{immocation-calculator,scoring-engine,pipeline-filter}.{ts,spec.ts}` | Implemented |
| `scoring-engine.ts` exports 3 fns | `evaluatePhase1` L38, `evaluatePhase2` L90, `calculateOverallScore` L134 | Need migration plan (iter-2 § D.M2 "Scoring-Engine Migration") |
| Prisma models (counted) | `prisma/schema.prisma` (26 models — Property L13 … Tenant L470) | No `MailMessage` yet (M5.1 adds), no FK on hypothetical `tenantId` columns yet |
| Prisma init migration | `prisma/migrations/` (548 lines per spec) | Implemented |
| Docker compose | `docker-compose.yml` (postgres :5433, redis :6380; no MinIO/Playwright/Mailer yet) | Partial |
| `.env` keys present | `/.env` (`DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `ANTHROPIC_API_KEY=` empty, `JWT_SECRET=realty79-jwt-secret-change-me` checked-in) | Needs M0 hygiene |
| Angular skeleton | `apps/web/` (~991 LOC) | Slated for delete (D13) |
| Excel template present | `/immocation - Kalkulationstool Cockpit - Pro_202310 Leer.xlsx` (841833 bytes) | Pre-M4 reverse-eng input |
| `libs/integrations/*` | does not exist yet | NEW dir tree to create in M0 |
| `libs/agent-tools/` | does not exist yet | NEW lib in M0 (iter-2 critic edit #2) |
| `apps/api-e2e/src/` | exists but empty wireframe (`api/`, `support/` only) | Needs Happy-Path tests + manual-eval per milestone |
| `apps/api/src/modules/agent/tools/` | does not exist yet (only 0-byte module stubs) | **iter-2 edit #2: this directory will NOT be created — agent tools live in `libs/agent-tools/` instead** |

---

## A) RALPLAN-DR Deliberate Summary

### A.1 Principles (5)

P1. **External I/O is always behind an adapter in `libs/integrations/<vendor>/`.** No NestJS service ever instantiates Playwright, Anthropic SDK, SMTP transport, or HTTP scraper directly. **Enforcement is two-layer (iter-2 fix to architect tension B):**
- (1) **Lint-time:** Nx ESLint rule `@nx/enforce-module-boundaries` in `~/eslint.config.mjs` with `depConstraints` keyed on tags `scope:integrations`, `scope:agent-tools`, `scope:shared`, `scope:api`, `scope:worker`, `scope:web`; plus `import/no-restricted-paths` (zone-based) listing `apps/api/src/**` as a `from` zone forbidden to import `apps/api/src/modules/**/raw-sdk*`, `playwright`, `playwright-extra`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow`, `axios`. (Both rules together.)
- (2) **Runtime/package boundary:** Every adapter's npm dep is declared in **the lib's own `project.json` + `libs/integrations/<vendor>/package.json`**, NOT in root `package.json`. The API project's resolved `node_modules` graph therefore physically excludes `playwright`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow`. Verified by Nx `pnpm nx graph --focus=api` not depending on those leaves.
- A dev who writes `// eslint-disable-next-line` cannot also reach the binary at runtime — the dep simply isn't installed in the API process.
- The language "ESLint-enforced" is therefore upgraded to **"ESLint + package-graph enforced"** (architect tension B closed).

P2. **BullMQ workers own all long-running and risky I/O.** Anything > 500 ms p95, anything that can be rate-limited, and anything that can fail and retry must live in a `*.processor.ts`, not in a request handler. Consequence: API request handlers stay <50 ms; per-run €-budget cap (D5) is enforced in worker-tick boundaries; any HTTP endpoint that triggers an LLM tool-use loop **must** enqueue + return `202 {jobId, pollUrl}` (see §D.M3.6 — closes architect #3 / critic edit #2).

P3. **Vue is the single source of truth for the user.** All `mock*.ts` imports under `apps/web-vue/src/pages/**` are deleted milestone-by-milestone. M0.5 (new) wires the existing portfolio's read-only views to live API early to bound 10-week mock drift. Apps/web (Angular) is deleted in M0 (D13).

P4. **Schema-additive only; multi-tenant prepared, FK-enforced.** Prisma migrations are append-only; every new table that gets a `tenantId String?` column **also gets `REFERENCES "Tenant"(id) ON DELETE SET NULL` plus `@@index([tenantId])`** — naming convention upgraded to a constraint (closes critic edit #5 / architect P4 violation). The single seed row `Tenant(id='default')` continues to cover D2.

P5. **Cost & reputation are first-class metrics with detection signals.** `ScrapeLog.tokenCostEur`, `ScrapeLog.proxyCostEur`, BullMQ counter `mail.outbound.sentCount`, Mail-Tester score, and the new abort-semantic counters (`anthropic.budget.aborted_total`, `anthropic.budget.partial_writes_discarded_total`) are gating in the AC tests, not just observability decoration.

### A.2 Decision Drivers (top 3)

DD1. **Shortest path to first lukrative property surfaced** — every architecture choice that doesn't help the user see a Phase-1 hit within 24 h of M2-deploy is deferred. M0 + M0.5 + M2 + M3 close the MVP-Gate (AC-1 through AC-5a + AC-6).

DD2. **Minimize ToS / DSGVO / spam-reputation risk** — Immometrica via legitimate Playwright-export (D6) instead of live scraping; broker outreach gated behind opt-in autonomy L3 with hard caps (D3); SMTP warmup before M5 launch (D9) **with explicit fallback to managed EU provider if Mail-Tester stalls (iter-2 critic edit #6)**; DSGVO templates juristically reviewed pre-launch (F6).

DD3. **Minimize €/run** — Per-run budget cap (D5) that hard-stops the run on overrun **with deterministic abort semantics** (iter-2 critic edit #1); cache photo-vision keyed by `PropertyPhoto.hash`; deterministic glue (Composite-Score, scoring-engine) gates LLM calls — only Phase-1-passers reach Claude.

### A.3 Architecture Forks (steelmen rewritten — iter-2 critic edit #7)

#### Fork 1 — Browser-Worker Placement

| Option | Pros | Cons |
|---|---|---|
| **1A: In-process inside NestJS API** (Playwright spawned by API request handler) | Zero ops overhead, simple `pnpm nx serve api` covers everything | Long-running browser blocks Node event-loop, 1 crash = whole API down, no horizontal scaling, violates P2 |
| **1B: Dedicated NestJS worker process** (`apps/worker`, separate Nest bootstrap, no HTTP server, BullMQ consumer) | Restarts independently, shares Prisma/`libs/integrations/*`, isolates Playwright crashes from API | Two processes to deploy; doubles deploy surface; double log streams |
| **1B′ (NEW iter-2 steelman): BullMQ `Worker` class instantiated INSIDE the API process, dedicated queue, `concurrency: 1`, separate Redis connection pool** | 80% of 1B's isolation (independent retry, async job model, separate Redis conn) at 0% of dual-process ops cost; one bootstrap, one Sentry release, one log stream; `process.on('uncaughtException')` + Playwright `browser.close()` finally-blocks catch the rare crash | Playwright still in same Node heap as API → memory pressure shared; `concurrency:1` Worker can starve API request handlers under burst; scaling later requires extracting to `apps/worker` anyway (so 1B′→1B is irreversible-feeling for solo dev) |
| **1C: External Playwright-as-a-Service** (Browserbase / Browserless) | No browser binary on our VM, no proxy management | DSGVO-iffy (session cookies leave the VM), violates D11 self-hosted, €€/mo |

**Chosen: 1B (Dedicated NestJS worker process) — but with explicit reversibility tripwire.**

**Steelman of 1B′ (architect's middle-ground, iter-2 addition).** The architect surfaced 1B′ as an honest middle ground; in iter-1 the planner had implicitly conflated it with 1A. 1B′ keeps a single deploy unit while still using BullMQ's queue model. For a solo dev on a single Hetzner CCX13, it would mean: one `pnpm nx serve api` command starts everything; one Sentry project; no second `apps/worker` to forget to deploy. Empirically, BullMQ `Worker` instances have run inside API processes for years in many production deployments without incident. The strongest case is reversibility cost: **extracting from 1B′ to 1B later is a 1-day refactor (move processors + main bootstrap), so the irreversibility risk the architect flagged is small.**

**Why 1B still wins despite 1B′ being lower implementation cost.**
- **Memory pressure isolation.** Playwright headful Chromium can balloon to 600-900 MB per session; under 4× concurrency that is 2.4-3.6 GB. Sharing that heap with NestJS, Prisma's connection pool, OTel SDK, and a Pino transport on a CCX13 (8 GB) means a single OOM kills the API too. With 1B, the worker dies and BullMQ retries; the API serves other requests fine.
- **Crash blast radius.** P2 is not about ops aesthetics — it's about preserving API availability when a tool-use loop, a stealth-browser session, or a Vision call panics. 1B′ requires `process.on('uncaughtException')` discipline that solo devs forget; 1B makes the OS the supervisor.
- **Independent scale path.** D11 today is single-VM, but follow-up F7 will sizing-test on M3 prod load. If we need a second VM for browser workloads (Hetzner CX22 + CCX13 split), 1B is already that shape; 1B′ would require the 1-day refactor under load-test deadline pressure.
- **CI-test parity.** Integration tests already start `apps/worker` in a Testcontainer-style harness; 1B′ would require maintaining a second test path (in-API vs. out-of-API processor wiring).

**Reversibility tripwire (iter-2 addition).** **§D.M6 step 6.5** adds an explicit gate: if 1-week production telemetry shows API memory <512 MB and worker memory <512 MB at p95, AND no API outages caused by worker crashes, THEN file follow-up F11 to evaluate merging back to 1B′. This makes the split honest: it's the right default for unknown load, but it's not locked.

**Invalidation rationale (1A, 1C).**
- 1A invalidated by P2 (workers own all I/O) and the Hetzner CCX13 memory-pressure argument above (NOT the circular sizing argument iter-1 used).
- 1C invalidated by D11 (self-hosted) and DD2 (DSGVO — Immometrica session cookies must not transit a third-party VM).

#### Fork 2 — LLM Orchestration Topology

| Option | Pros | Cons |
|---|---|---|
| **2A: Single agent loop** (Claude with all tools — fetchListing, analyzePhotos, lookupRentIndex, runCashflow, requestMissingDocs — Claude decides every step) | Maximum flexibility; conversational UX; matches `AgentConversation`/`AgentMessage` ontology | Token-cost explodes (D5/AC-6 hard to enforce); failure modes hard to debug; vision-call may be skipped or repeated |
| **2B: Pure staged deterministic pipeline** (BullMQ jobs orchestrate; LLM called non-agentically with `tools:[]` per stage) | Predictable cost per stage; each phase isolated-testable; easy Sentry grouping; no mid-stream abort complexity | Less "agentic" UX; Claude loses cross-phase memory unless we replay |
| **2B′ (NEW iter-2 steelman per critic edit #7): Deterministic FSM in worker + Claude `tools:[]` + structured-output schema `{needsMorePages: bool, nextUrls: string[], vision: VisionSchema, done: bool}`. Worker loops up to N=5 iterations; each call is an isolated request/response.** | Eliminates `BudgetSupervisor`-mid-loop-interrupt complexity entirely (no in-flight cancellation needed); each Claude call is atomic; Anthropic streaming partial-token accounting becomes trivial (no streaming used); vision schema validation per call; conversational UX still possible by rendering `AgentMessage` from FSM transitions | Loop bound N=5 may truncate genuinely useful research that needs 6+ pages; doesn't leverage Claude's tool-use model that the spec ontology already supports |
| **2C: Hybrid — deterministic outer pipeline + Claude tool-use loop INSIDE `listing-detail-research` only, bounded by `BudgetSupervisor`** | Deterministic outer gate (cost ceiling) + Claude tool-use freedom inside the bounded research phase; matches spec's `AgentConversation` ontology; concentrates complexity in one file (`tool-use-loop.ts`) | `BudgetSupervisor` mid-loop interrupt has tricky abort semantics (now specified in §D.M3.5); two patterns to maintain |

**Chosen: 2C (Hybrid) — but with explicit Tool-Use-Loop Abort Semantics (§D.M3.5) closing the iter-1 gap that the critic correctly flagged.**

**Steelman of 2B′ (FSM with Claude `tools:[]`).** The architect's and critic's strongest argument: a worker calling Claude non-agentically with `tools:[]` and a structured-output schema can replicate "Claude decides when satisfied" via a `done: bool` field, deterministically loop up to N=5, and never give Claude tool-execution authority. **This kills `BudgetSupervisor`-mid-loop-interrupt entirely.** Each call is request/response: budget is checked between calls (trivial). Anthropic's streaming-partial-token accounting becomes a non-issue because we don't stream. Failure modes shrink: tool throws → no need to decide whether to re-prompt, the worker just retries the next FSM step.

**Why 2C still wins despite 2B′ being lower implementation risk.**
- **Spec ontology fit.** The Prisma schema defines `AgentConversation`/`AgentMessage` with explicit tool-use modeling (`AgentMessage.toolName`, `AgentMessage.toolInput`, `AgentMessage.toolOutput`). The spec's intent (D4 "Claude One-Stop") expresses tool use as a first-class user-visible artifact, not a worker-internal FSM. 2B′ would render `AgentMessage` rows as FSM transitions, which is a leaky abstraction — the user sees "I asked Claude to research, Claude decided to call X tool" but really the worker decided.
- **Genuine open-endedness in detail research.** N=5 is a guess. Empirically (architect noted), some listings need 7-9 page fetches (broker landing → ImmoScout cross-link → Energieausweis PDF → mietspiegel lookup → comparable-listing fetch → district report → photo-driven follow-up question). Capping at N=5 risks under-research; raising to N=15 makes 2B′ no cheaper than 2C.
- **Abort-semantics gap is now closed.** The critic's strongest objection to 2C — under-specified mid-loop abort — is resolved by §D.M3.5. The remaining complexity is concentrated in **two files** (`libs/integrations/llm/tool-use-loop.ts` + `BudgetSupervisor`); both are <500 LOC and can be unit-tested via the new `budget-cap.abort-semantics.int-spec.ts` fixture.
- **Migration path.** If 2C proves brittle in M3 (e.g., real Anthropic streaming partial-token charges turn out un-reconcilable in production), the worker can call `executeFsmFallback()` instead of `executeToolUseLoop()` — same input, same output schema. **Follow-up F12: re-evaluate 2B′ FSM as fallback after M3 prod-load test.**

**Invalidation rationale.**
- 2A invalidated by D5/AC-6 abort-semantics burden multiplied across an unbounded toolset (every `requestMissingDocs` call mid-loop must also be cancellable, vision calls mid-stream must reconcile, etc.).
- 2B invalidated as too rigid for the truly open-ended listing-detail step (N is unknown; FSM with `done: bool` is essentially 2B′).
- 2B′ is the lower-risk fallback; if 2C concentrates too much complexity in M3, F12 will switch to 2B′ in M3.5 / M6 hardening. **2C is the steel-of-D4; 2B′ is the safety net.**

#### Fork 3 — Mail-Stack (Outbound + Inbound)

| Option | Pros | Cons |
|---|---|---|
| **3A: Managed transactional + OAuth-IMAP** (Postmark/Resend/Mailgun-Frankfurt out, Gmail/MS-Graph in) | Day-1 deliverability, instant DKIM, no warmup, no IP reputation work; 3-week schedule compression | (Postmark) prohibits cold outreach; (Resend/Mailgun) supports the use-case but requires DPA; D11 self-hosted contradicted; D9 explicitly chose self-hosted |
| **3B: Self-hosted Postfix + Dovecot + OpenDKIM/SPF/DMARC + static IP on Hetzner** | Full control, DSGVO-clean, reputation owned, zero per-mail fees | 2-4 wk reputation warmup, ongoing reputation monitoring, larger ops footprint; **competing-attention with M2/M3 implementation work (architect T1)** |
| **3C: Self-hosted Haraka + IMAP via mail-poller adapter** | JS-native, easier integration with NestJS | Smaller community, less hardened |

**Chosen: 3B (Postfix + Dovecot + OpenDKIM, self-hosted on Hetzner) — with explicit M5.0 abort criterion (iter-2 critic edit #6).**

**Steelman of 3A (Resend / Mailgun-Frankfurt — corrected from iter-1).**
- Resend has an EU endpoint and supports DPAs; Mailgun-Frankfurt is a Mailgun region with EU residency and DPA available. Both sidestep the iter-1 "all managed = US sub-processor" conflation.
- The use-case (`SavedSearch.autonomyLevel=L3` + hard cap 10/day + score≥70 → outreach about a property the user is actively researching) is closer to "transactional triggered by user action" than "bulk cold outreach."
- Day-1 deliverability would let M5 ship in week 5 instead of week 8. **Calendar value: 3 weeks of solo-dev attention reclaimed for AC-9 hardening, AC-10 classifier tuning, M6 readiness** — exactly the items at risk under the architect T1 attention-bandwidth concern.

**Why 3B still wins (with abort fallback to 3A).**
- D9 + D11 are explicitly locked self-hosted; user re-affirmed in deep-interview.
- DDV and DD2 prefer no US sub-processor by default.
- BUT the iter-2 abort criterion (§D.M5.0) inverts the irreversibility: **if Mail-Tester score is <8/10 after 4 weeks of warmup, the plan automatically falls back to Resend (EU endpoint + DPA) or Mailgun-Frankfurt (DPA)**, because the alternative — indefinite warmup — burns more solo-dev attention than the DSGVO trade saves. This makes 3B a "preferred-but-falsifiable" choice.

**Invalidation rationale (3C).** Postfix is the reference implementation for sender-reputation guidelines (DKIM rotation, DMARC reject); Haraka is JS-native but smaller community and less hardened against spam-relay abuse.

### A.4 Calendar & Attention Decision (architect tension A — T1 closure)

Architect T1: warmup is NOT zero-touch; running M5.0 parallel to M2/M3 is a competing-attention trap.

**Decision (iter-2):** **Defer M5.0 start by 3 weeks** — M5.0 begins at the start of M3 (week 4), not in M0 week 1. Concretely:
- M0 week 1 still does the **one-shot ops setup** (~1 day): static-IP request, reverse-DNS ticket, DNS records (SPF/DKIM/DMARC), Postfix `main.cf`/`master.cf` baseline, OpenDKIM key generation. This is the architect's "Synthesis: tightly scope M5.0 to IP+DNS+DKIM/DMARC/SPF setup in M0 week 1 (one-shot, ~6 hours total)."
- The **passive warmup script** (`scripts/mail-warmup.ts` + `scripts/blocklist-check.ts`) runs as a cron from M0 onward, but with the `mailwarm`-style daily ramp NOT requiring human intervention.
- The **active tuning work** (template engineering, blocklist-check tuning, reputation-check.ts implementation) shifts to **M5.1 inside M5 sprint** instead of "parallel to M2/M3."
- AC-9 measurement (Mail-Tester ≥9/10) gate-checks at M5 launch (week ~9-10), not earlier.
- This costs ~3 weeks of calendar slip in the absolute worst case (if warmup needs the full 4 weeks AND M5.0 abort fires) — but the calendar critical path through M3 (MVP-Gate) is unchanged, since M5 is post-MVP-Gate anyway.

**Risk acceptance (G.5 Consequence C-2 strengthened):** Solo dev's attention during M2/M3 is now exclusively on the Scout-pipeline implementation. Postfix tuning is deferred. AC-9 is not at risk of slip from inattention.

---

## B) Pre-Mortem (3 mandatory failure scenarios — kept verbatim from iter 1)

### B.1 Immometrica blocks the Playwright session

**Trigger.** Immometrica detects automation: TLS-JA3 fingerprint, headless-chrome canvas-fingerprint, or rate of CSV-export download exceeds human baseline. Login succeeds, but the export download URL returns 403 or the session is silently throttled to stale data.

**Blast radius.** M2 stops producing new `Property` rows. AC-1 fails (no Phase-1 hits within 24 h). MVP-Gate slips. If undetected, downstream M3/M4 keep recomputing on stale data and look fine while the funnel is dry.

**Mitigation hooked into plan (M2 section D.M2 step "BullMQ workers" + M6 §D.M6 step 6.2).**
- `playwright-extra` + `puppeteer-extra-plugin-stealth` from the start; record a *human-recorded* Playwright trace as click-flow ground-truth (file: `libs/integrations/immometrica/fixtures/login-flow.zip`).
- BullMQ worker `immometrica-poll` writes `ScrapeLog.status='blocked'` whenever HTTP 403 OR the export ZIP delta is empty for >2 consecutive runs while ≥1 search is configured.
- Auto-fallback to `libs/integrations/proxy/bright-data-adapter.ts` (D7) flipped on by `Property.source='immometrica' AND blockedRunsConsecutive >= 3`.
- Manual-CSV-import fallback endpoint `POST /api/immometrica/import` accepts a user-uploaded ZIP from a manual download.

**Detection signal.**
- Prometheus counter `immometrica_poll_blocked_total{tenant="default"}`; alert at ≥3 in 24 h.
- Pino log `event="immometrica.session.blocked" reason=<...>` to Sentry; Sentry rule pages user via Telegram bot (ENV `TELEGRAM_BOT_TOKEN`).
- Daily digest e-mail to user listing `ScrapeLog` rows with `status!='ok'`.

### B.2 SMTP reputation dies during M5 launch

**Trigger.** Hetzner /32 IP is on a SORBS or Spamhaus blocklist on day 1; or DKIM signing breaks because the DNS TXT record has a typo; or first 200 outbound mails get ≥5 spam-complaints because brokers mark "Anfrage zur Wohnung X" as bulk.

**Blast radius.** M5 ships but L3 broker outreach is silently ignored. AC-9 (Mail-Tester ≥9/10) and AC-10 (≥90% reply classification) cannot be evaluated because no replies arrive. Brokers who *do* see the mail stop replying because the domain is now poisoned, contaminating M3 follow-ups.

**Mitigation hooked into plan (M5.0 mail-stack-setup, parallel pre-sprint, with abort-fallback per iter-2).**
- M5.0 one-shot ops setup (M0 week 1): static IP + reverse-DNS + DKIM/DMARC `p=quarantine` + DNS TXT records.
- Passive warmup: `mailwarm`-style cron sending to seeded mailbox 5→200/day over 2-4 wk, no human intervention.
- M5 launch gated on Mail-Tester ≥9/10 (AC-9). If <9/10 after 4 weeks → automatic fallback to managed EU provider with DPA (Resend EU or Mailgun-Frankfurt) — **iter-2 abort criterion §D.M5.0**.
- L3 hard caps (D3): max N mails/day per `SavedSearch`, only for Composite-Score ≥ X; default N=10, X=70.
- Manual SMTP kill-switch `feature.brokerOutreach.killswitch` toggled from `apps/web-vue/src/pages/settings/SettingsPage.vue`.

**Detection signal.**
- Daily cron writes `mailer.reputation.score` gauge to Pino; Sentry rule alerts on ≤7.
- Bounce rate counter `mailer.outbound.bounced_total / mailer.outbound.sent_total > 0.05` over 24 h → Telegram alert.
- DMARC aggregate report parser (RUA mailbox) → Sentry breadcrumb on `dkim=fail` or `spf=fail`.
- **NEW: `mail.warmup.daysElapsed` gauge + `mail.warmup.scoreLatest` gauge** → if `daysElapsed >= 28 AND scoreLatest < 8` for 2 consecutive days, auto-set `feature.brokerOutreach.transport='managed-fallback'` and Telegram-page user.

### B.3 Excel-parity drift surfaces only after months of operation

**Trigger.** A `KeyMetrics` field (e.g., `cashflowAfterTax30y`) drifts from Excel formula by 0.05 € on year-23 due to rounding-mode mismatch. M4.0 fixtures don't cover year-23 sensitivity. User notices in month 4 when comparing a real deal: €1,200 cumulative drift.

**Blast radius.** Trust in the calculator collapses; user falls back to Excel; conversion to "I bought it" drops to zero. Archived `Scenario` rows diverge silently.

**Mitigation hooked into plan (M4.0 + M4.1 + M6).**
- M4.0 = *capped* Reverse-Engineering Sub-Sprint (architect tension C, iter-2 §D.M4.0): max 1 week, exact deliverable count specified, freeze-criterion if exceeded.
- 5 parametrized fixtures covering edge cases: Sondertilgung, Mietausfall, Stresstest -20%, Verkauf in Jahr 10, full 30y projection.
- Property-based tests via `fast-check` over 1000 random `(financingParams, assumptions)` tuples → calc must agree with Python NumPy reference in `libs/shared/src/utils/_reference-calc.py` to 1 cent over 30 y.
- Versioned `Scenario.calculatorVersion` column; recompute is no-op if `Scenario.calculatorVersion === currentVersion`; bump triggers BullMQ `cashflow-recompute` for every Scenario.
- M6 `nightly-parity-drift` cron job: replays all production `Scenario` rows; >0.01 € drift → Sentry alert.

**Detection signal.**
- CI badge `parity-suite` per PR (5 fixtures × 30 KPIs × 30 years = 4500 assertions).
- Production gauge `calculator.scenario.recompute.maxAbsDrift_eur` per nightly run.
- User-visible diff banner in `apps/web-vue/src/pages/properties/PropertyDetailPage.vue` if `Scenario.calculatorVersion < currentVersion`.

---

## C) Expanded Test Plan (Quad-Coverage, kept verbatim from iter 1 + iter-2 additions)

### C.1 Unit (Jest 30) — kept; iter-2 additions marked NEW

| Milestone | Suite added | Example test name | Maps to AC |
|---|---|---|---|
| M0 | `libs/shared/src/dto/*.spec.ts` | `parses SavedSearchCreateDto with autonomyLevel default L1` | AC-13 |
| M0 | `apps/api/src/modules/auth/auth.service.spec.ts` | `rejects login with invalid bcrypt password` | AC-11 |
| M2 | `libs/integrations/immometrica/parser/csv-row.spec.ts` | `maps CSV row to PropertyCreateInput with sourceUrl` | AC-1 |
| M2 | `libs/shared/src/utils/scoring-engine.spec.ts` (extended) | `composite score equals 25/25/25/25 weighted average for default config` | AC-2 |
| M2 | `apps/api/src/modules/pipeline/pipeline.service.spec.ts` | `marks Property phase=2 when compositeScore >= phase1Threshold` | AC-1, AC-2 |
| M2 NEW | `libs/shared/src/utils/scoring-engine.migration.spec.ts` | `evaluatePhase1 wraps computeCompositeScore for backward compatibility; deprecation warn emitted` | AC-2 (architect tension D) |
| M3 | `libs/integrations/llm/anthropic-client.spec.ts` | `throws BudgetExceededError when accumulated tokenCost > runBudgetEur` | AC-6 |
| M3 NEW | `libs/integrations/llm/tool-use-loop.abort-semantics.spec.ts` | `aborts mid-tool-call by setting cancel-flag, lets in-flight tool finish, discards downstream queued tool calls, debits realized tokens only` | AC-6 (critic edit #1) |
| M3 | `libs/integrations/scraper/stealth-browser.spec.ts` | `falls back to proxy when block-detector observes 403 twice` | AC-3 |
| M3 | `apps/api/src/modules/vision/vision.service.spec.ts` | `caches PropertyPhoto.visionAnalysis by hash` | AC-4 |
| M4 | `libs/shared/src/utils/immocation-calculator.parity.spec.ts` | `fixture-01-sondertilgung matches Excel cell H47 to 0.01 EUR` | AC-7 |
| M4 | `libs/shared/src/utils/sensitivity-table.spec.ts` | `produces 5x5 grid for ±2% Zins / ±5% Miete` | AC-8 |
| M4 NEW | `libs/shared/src/utils/scenario-recompute.spec.ts` | `pure function returns KeyMetrics for given Scenario; idempotent across calls` | AC-5a, AC-5b (architect soft-2) |
| M5 | `libs/integrations/mailer/template-engine.spec.ts` | `renders broker-request template with property attachments link` | AC-10 |
| M5 | `libs/integrations/mailer/reply-classifier.spec.ts` | `classifies "anbei der Energieausweis" as documents-attached with confidence>=0.8` | AC-10 |
| M1 | `apps/api/src/modules/property/property.service.spec.ts` | `lists properties scoped to tenantId from JWT claim` | AC-13 |
| M6 | `apps/api/src/common/budget/budget-supervisor.spec.ts` | `emits hard-stop event when runBudgetEur reached mid-tool-call` | AC-6 |

### C.2 Integration (Jest + Testcontainers) — iter-2 additions marked NEW

| Milestone | Suite | Example test | AC |
|---|---|---|---|
| M0 | `auth.int-spec.ts` | register → login → refresh → logout flow stores hashed pw and rotates JWT | AC-11 |
| M2 | `immometrica-poll.int-spec.ts` | fixture ZIP with 3 rows produces 3 Property rows + 1 ScrapeLog row with hitCount=3 | AC-1 |
| M2 | `pipeline.int-spec.ts` | Property with rendite>=4% AND lageScore>=70 lands in phase=2 | AC-1, AC-2 |
| M2 NEW | `tenant-fk.int-spec.ts` | inserting Property with `tenantId='unknown-tenant'` raises Postgres FK violation 23503 | AC-13 (critic edit #5) |
| M3 | `listing-detail-research.int-spec.ts` | mocked Anthropic returns DeepResearch with all 4 score fields !=null | AC-3 |
| M3 | `photo-vision.int-spec.ts` | 5 photos → 5 PropertyPhoto.visionAnalysis JSON, all with confidence >=0.5 | AC-4 |
| M3 | `budget-cap.int-spec.ts` | runBudgetEur=0.05 stops research mid-loop with status=budget_exceeded | AC-6 |
| M3 NEW | `budget-cap.abort-semantics.int-spec.ts` | (a) cancel-flag set mid-tool-call → in-flight tool completes → no further tool calls; (b) `PropertyPhoto.visionAnalysis` row written by in-flight tool is committed; (c) downstream queued vision-calls discarded, no partial JSON committed for them; (d) `cost.tokenEur` debits only for completed responses (input + completed output tokens, NOT speculative output cap); (e) `ScrapeLog.status='budget_exceeded'`, `ScrapeLog.abortAt` set | AC-6 (critic edit #1) |
| M3 NEW | `agent-conversation-async.int-spec.ts` | `POST /agent/conversations/:id/messages` returns `202 {jobId, pollUrl}`; `GET /jobs/:jobId` returns 200 with progress; on completion, `GET /agent/conversations/:id` shows new `AgentMessage` rows | AC-3, AC-6 (critic edit #2 / architect #3) |
| M4 | `scenario-create-recompute.int-spec.ts` | creating Scenario calls `scenario-recompute` pure function, writes KeyMetrics on response | AC-5a, AC-7 |
| M4 NEW | `scenario-version-bump-fan-out.int-spec.ts` | `calculatorVersion` bump enqueues `cashflow-recompute` for every existing Scenario row | AC-7 (architect soft-2) |
| M5 | `mail-inbound-classify.int-spec.ts` | Mailpit-delivered .eml with PDF attachment → MailMessage.classification='documents-attached', Document row created | AC-10 |
| M5 NEW | `mail-warmup-abort.int-spec.ts` | simulate 28 days of warmup with `scoreLatest=7`; check that `feature.brokerOutreach.transport` flips to `managed-fallback` and Sentry breadcrumb fires | AC-9 (critic edit #6) |
| M1 | `payment-overdue.int-spec.ts` | daily cron flips Payment.status=overdue at +14d | AC-12 |
| M6 | `tenant-scope.int-spec.ts` | tenant-A JWT cannot read tenant-B Property rows (regression test) | AC-13 |

### C.3 E2E (Playwright) — iter-2 additions marked NEW

| Milestone | Suite | Test (AC mapping) |
|---|---|---|
| M0 | `apps/api-e2e/src/api/health.e2e-spec.ts` | `GET /api/health returns 200` (AC-11) |
| M0 | `apps/web-vue-e2e/src/auth.spec.ts` | register → login → see dashboard (AC-11, AC-12) |
| M0.5 NEW | `apps/web-vue-e2e/src/portfolio-readonly.spec.ts` | open `pages/portfolio/PortfolioPage.vue` → see real (empty-or-seeded) `Property[]` from `/api/portfolio`; no `mockProperties.ts` import remains (architect soft-1) |
| M2 | `apps/api-e2e/src/api/saved-search.e2e-spec.ts` | POST /saved-searches → GET /saved-searches/:id/properties returns ≥1 hit within 24 h (AC-1, AC-12) |
| M2 | `apps/web-vue-e2e/src/scout-pipeline.spec.ts` | create SavedSearch in UI → wait → see Phase-1 card on SearchPage (AC-1) |
| M3 | `apps/web-vue-e2e/src/property-detail.spec.ts` | Phase-2 property shows DeepResearch + ≥5 PropertyPhoto.visionAnalysis tiles (AC-3, AC-4) |
| M3 | `apps/api-e2e/src/api/budget-cap.e2e-spec.ts` | SavedSearch.runBudgetEur=0.10 → ScrapeLog.status='budget_exceeded' (AC-6) |
| M3 NEW | `apps/api-e2e/src/api/agent-async.e2e-spec.ts` | POST /agent/conversations/:id/messages returns 202; pollUrl reaches `done` within 60s (AC-3, AC-6) |
| M4 | `apps/web-vue-e2e/src/cockpit-cashflow.spec.ts` | open Property X → cockpit shows 30y projection matching Excel fixture-01 (AC-5b, AC-7, AC-8) |
| M5 | `apps/api-e2e/src/api/broker-outreach.e2e-spec.ts` | L3 SavedSearch → outbound mail visible in Mailpit; reply → Document attached to Property (AC-9, AC-10) |
| M1 | `apps/web-vue-e2e/src/verwaltung.spec.ts` | Property → Unit → Lease → Payment → MaintenanceTicket flow under 5 min (AC-12) |
| M6 | `apps/api-e2e/src/api/multitenant-isolation.e2e-spec.ts` | tenant-A cannot read tenant-B SavedSearch (AC-13) |

### C.4 Manual-Eval (NEW iter-2 layer — critic edit #3)

| Milestone | Artifact | Procedure | AC |
|---|---|---|---|
| M3 NEW | `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md` | versioned reference: 10 manually-curated Property records with ground-truth `lokalisierungen` (Bezirk/Mikrolage label) and `Zustandseinschätzung` (Neubau/Renoviert/Sanierungsbedarf/Schaden) per spec roadmap line 184. Procedure: solo dev runs `pnpm nx run api-e2e:manual-eval-m3-vision`; tool fetches DeepResearch + PropertyPhoto.visionAnalysis for each of the 10; outputs CSV; user reviews; tool computes accuracy %. **Done-when:** ≥80% Lokalisierungen correct AND ≥70% Zustandseinschätzungen correct on the 10 reference properties. The 10 reference properties are committed to repo as `apps/api-e2e/src/manual-eval/m3-reference-properties.json` with anonymized but reproducible inputs. | AC-3 |

### C.5 Observability — kept verbatim from iter 1

(Schema in `libs/shared/src/observability/log-schema.ts`; bull-board `/admin/queues`; Sentry env tags; OTel auto-instrumentation; per-milestone deliverable table identical to iter 1.)

---

## § AC Matrix (re-tabulated per critic §4 — every row unambiguously testable)

| AC | Test name / path | Measurement | Milestone | Done-when condition |
|---|---|---|---|---|
| **AC-1** | `apps/api-e2e/src/api/saved-search.e2e-spec.ts` + `apps/api/test/integration/immometrica-poll.int-spec.ts` | ≥1 Property row with `phase=1` linked to SavedSearch.id within 24 h of cron tick OR within 5 min of `POST /saved-searches/:id/run` | M2 | `pnpm nx e2e api-e2e --grep saved-search` green; manual: SavedSearch in UI → Phase-1 card visible |
| **AC-2** | `libs/shared/src/utils/scoring-engine.spec.ts` (extended) + `pipeline.int-spec.ts` | `computeCompositeScore({rendite:5, cashflow:300, lage:80, preisProQm:0.95}, weights={25,25,25,25})` returns total in [0,100] computed as weighted avg; configurable per `SavedSearch.scoringWeights` JSONB | M2 | unit test green; integration test: Property with all 4 inputs at 25/25/25/25 produces total = 25 |
| **AC-3** | `listing-detail-research.int-spec.ts` + `apps/web-vue-e2e/src/property-detail.spec.ts` + **NEW `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md`** | (a) all 4 DeepResearch score fields `!=null`; (b) Vision JSON parsed via `vision-schema.ts`; (c) **NEW manual-eval: ≥80% Lokalisierungen correct + ≥70% Zustandseinschätzungen correct on 10 reference properties** | M3 | int-spec green AND `pnpm nx run api-e2e:manual-eval-m3-vision` reports ≥80%/≥70% on the 10 ref properties |
| **AC-4** | `vision.service.spec.ts` + `photo-vision.int-spec.ts` | 5 photos → 5 `PropertyPhoto.visionAnalysis` JSON rows, all `confidence >= 0.5`, all conform to `vision-schema.ts` | M3 | int-spec green; manual: open Phase-2 property in Vue → ≥5 vision tiles render |
| **AC-5a** (NEW split) | `scenario-create-recompute.int-spec.ts` + `scenario-recompute.spec.ts` | M3: `KeyMetrics` JSONB on `Scenario` is non-null (rendite, cashflow1y, cashflow30y, irr30y) for every Phase-2 property's default Scenario | **M3** | int-spec: `KeyMetrics` non-null for fresh Scenario; closed by M3 |
| **AC-5b** (NEW split) | `apps/web-vue-e2e/src/cockpit-cashflow.spec.ts` | M4: full Vue cockpit visibility — 30y projection table + sensitivity grid + stress test + comparables tabs all render real data per spec wording "Werte sichtbar im Vue-Cockpit" | **M4** | e2e: 4 tabs navigable, all values match Excel fixture-01 ≤0.01€ |
| **AC-6** | `budget-cap.int-spec.ts` + **NEW `budget-cap.abort-semantics.int-spec.ts`** + `apps/api-e2e/src/api/budget-cap.e2e-spec.ts` | (a) `runBudgetEur=0.05` stops research mid-loop, sets `ScrapeLog.status='budget_exceeded'`; (b) **NEW: in-flight tool call finishes (cancel-flag policy), partial vision JSON committed, downstream queued tool calls discarded, only realized tokens debited** | M3 | both int-specs green; e2e green; abort semantics test asserts all 5 invariants from §D.M3.5 |
| **AC-7** | `immocation-calculator.parity.spec.ts` | 5 fixtures × 30 KPIs × 30 years (4500 assertions) all within 0.01 € of Excel master | M4 | CI badge `parity-suite` green |
| **AC-8** | `cockpit-cashflow.spec.ts` + `sensitivity-table.spec.ts` | 5×5 grid for ±2% Zins / ±5% Miete; 4 tabs (cockpit, sensitivity, stress, comparables) navigable in Vue | M4 | unit + e2e green |
| **AC-9** | `reputation-check.ts` (cron) + Mail-Tester manual run | (a) Mail-Tester ≥9/10 after warmup; (b) **NEW abort: if `daysElapsed>=28 AND scoreLatest<8` for 2 consecutive days → automatic transport-flip to `managed-fallback` (Resend EU or Mailgun-Frankfurt) per §D.M5.0** | M5 | manual mail-tester.com run on production-domain test mail returns ≥9/10 OR fallback engaged |
| **AC-10** | `reply-classifier.spec.ts` + `mail-inbound-classify.int-spec.ts` | ≥90% accuracy on 50-mail test corpus; corpus path: `libs/integrations/mailer/fixtures/reply-corpus/{en,de}-{documents-attached,more-info-requested,off-topic,negative-reply}/{1..N}.eml` (NEW: corpus location specified) | M5 | unit aggregate-accuracy test green |
| **AC-11** | CI workflow `~/.github/workflows/ci.yml` | `pnpm nx affected -t lint test build typecheck` exit 0 on PR | M0+ | green CI badge |
| **AC-12** | E2E suites per milestone | one happy-path each (auth, scout, property-detail, cockpit, broker-outreach, verwaltung, multitenant) | M0–M6 | per-milestone Done-when row |
| **AC-13** | `tenant-scope.int-spec.ts` + **NEW `tenant-fk.int-spec.ts`** + ESLint + migration template | (a) `tenantId String?` on every new table with `@@index([tenantId])`; (b) **NEW: FK constraint `REFERENCES "Tenant"(id) ON DELETE SET NULL` on every such column** (critic edit #5); (c) tenant-scope regression: tenant-A JWT cannot read tenant-B rows | M0 (invariant set) → M6 (full regression) | both int-specs green; FK violation raises Postgres 23503 in `tenant-fk.int-spec.ts` |

---

## D) Implementation Steps (per Milestone, with FILE PATHS)

Order: **M0 → M0.5 → M2 → M3 → M4 → M5 → M1 → M6** (Scout-First, locked by D1; M0.5 added per architect soft-1).

> Convention: `~` = `/opt/realty79-real-estate-naviagator/`. EDIT = modify existing 0-byte stub or populated file. NEW = create from scratch.

---

### M0 — Foundation (1 sprint) — iter-2 deltas

**Goal.** Same as iter 1. **Iter-2 deltas:** ESLint boundary rule names made concrete; per-lib `package.json` scoping for adapter deps; `libs/agent-tools/` lib added; M5.0 one-shot ops setup happens in M0 week 1 only (not parallel warmup).

#### M0 — Files to delete (unchanged)

- `~/apps/web/`, `~/.angular/`, `~/.env` (recreate after sanitizing); remove Angular deps from `package.json`.

#### M0 — Files to create / edit (iter-2 deltas marked **ITER-2**)

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/package.json` | **ITER-2 (architect soft-3):** remove Angular deps; add ONLY root-shared deps: `pino`, `pino-http`, `nestjs-pino`, `@sentry/node`, `@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`, `bull-board`, `@bull-board/express`, `zod`, `bcrypt`, `@types/bcrypt`, `@testcontainers/postgresql`, `@testcontainers/redis`. **DO NOT add at root: `playwright`, `playwright-extra`, `puppeteer-extra-plugin-stealth`, `@anthropic-ai/sdk`, `nodemailer`, `mailparser`, `imapflow`** — these go into the per-lib `package.json` files below. |
| EDIT | `~/.env` | drop `JWT_SECRET=...` value; replace with empty placeholder; copy current secrets to operator's password manager |
| NEW | `~/.env.example` | document all required env keys |
| EDIT | `~/.gitignore` | ensure `.env` (without `.example`) is ignored |
| EDIT | `~/eslint.config.mjs` | **ITER-2 (architect tension B):** add (1) `@nx/enforce-module-boundaries` with `depConstraints: [{sourceTag:'scope:api', onlyDependOnLibsWithTags:['scope:shared','scope:agent-tools']}, {sourceTag:'scope:worker', onlyDependOnLibsWithTags:['scope:shared','scope:integrations','scope:agent-tools']}, {sourceTag:'scope:agent-tools', onlyDependOnLibsWithTags:['scope:integrations','scope:shared']}, {sourceTag:'scope:integrations', onlyDependOnLibsWithTags:['scope:integrations','scope:shared']}, {sourceTag:'scope:web', onlyDependOnLibsWithTags:['scope:shared']}]`; AND (2) `import/no-restricted-paths` rule with zones forbidding `apps/api/src/**` from importing `playwright`, `playwright-extra`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow`, `mailparser`, `axios` (last-resort fence; primary fence is per-lib `package.json` scoping above). |
| EDIT | `~/nx.json` | add tags to existing projects: `scope:api`, `scope:worker` (new), `scope:web`, `scope:shared`; add new tag `scope:agent-tools`, `scope:integrations` |
| NEW | `~/apps/worker/` | new Nx project: `pnpm nx g @nx/nest:app worker --tags=scope:worker` |
| NEW | `~/apps/worker/src/main.ts` | Nest standalone bootstrap, registers `*.processor.ts` modules, exits on SIGTERM |
| NEW | `~/apps/worker/src/app/worker.module.ts` | imports same Prisma/Bull/Anthropic modules as API |
| EDIT | `~/apps/api/src/main.ts` | add Pino, OTel SDK, Sentry init; tighten CORS; mount `bull-board` at `/admin/queues` behind JWT |
| EDIT | `~/apps/api/src/app/app.module.ts` | swap `Logger` for `LoggerModule.forRoot({pinoHttp: ...})`; remove "Sprint 5/6/8/9" comments (lines 49-63) |
| NEW | `~/apps/api/src/common/observability/correlation-id.middleware.ts` | reads/generates `x-correlation-id`; AsyncLocalStorage |
| NEW | `~/apps/api/src/common/observability/sentry.interceptor.ts` | tags spans with `tenantId`, `userId` |
| NEW | `~/apps/api/src/common/budget/budget-supervisor.service.ts` | per-run accumulator; spec defined here, full impl in M3 |
| NEW | `~/apps/api/src/common/tenant/tenant.middleware.ts` | extracts `tenantId` from JWT; AsyncLocalStorage |
| EDIT | `~/apps/api/src/modules/health/health.{module,controller}.ts` | health endpoint with Prisma + Redis ping |
| EDIT | `~/apps/api/src/modules/auth/auth.{module,service,controller}.ts` | JWT register/login/refresh/logout; bcrypt; Prisma `Tenant` |
| NEW | `~/apps/api/src/modules/auth/dto/{register,login,refresh}.dto.ts` | Zod schemas from `libs/shared` |
| NEW | `~/libs/shared/src/dto/auth.ts` | Zod schemas |
| NEW | `~/libs/shared/src/dto/saved-search.ts` | Zod schemas (used in M2) |
| NEW | `~/libs/shared/src/dto/property.ts` | Zod schemas |
| NEW | `~/libs/shared/src/observability/log-schema.ts` | Pino schema constants |
| NEW | `~/libs/integrations/llm/{project.json,package.json,src/index.ts,src/anthropic-client.ts,src/cost-tracker.ts}` | **ITER-2:** `package.json` declares `@anthropic-ai/sdk` as a dep here; `project.json` `tags=["scope:integrations","domain:llm"]`. Adapter is the only place that imports the SDK. |
| NEW | `~/libs/integrations/scraper/{project.json,package.json,src/index.ts,src/stealth-browser.ts,src/block-detector.ts}` | **ITER-2:** `package.json` declares `playwright`, `playwright-extra`, `puppeteer-extra-plugin-stealth` here. |
| NEW | `~/libs/integrations/proxy/{project.json,package.json,src/index.ts,src/bright-data-adapter.ts}` | residential-proxy adapter |
| NEW | `~/libs/integrations/immometrica/{project.json,package.json,src/index.ts,src/login-flow.ts,src/csv-export.ts,src/parser/csv-row.ts,src/types.ts}` | scaffold (real impl in M2); reuses `playwright` from `libs/integrations/scraper` |
| NEW | `~/libs/integrations/standort/{project.json,package.json,src/index.ts,src/destatis-client.ts,src/regiostat-client.ts}` | scaffold |
| NEW | `~/libs/integrations/mailer/{project.json,package.json,src/index.ts,src/smtp-transport.ts,src/imap-poller.ts,src/template-engine.ts,src/reply-classifier.ts}` | **ITER-2:** `package.json` declares `nodemailer`, `mailparser`, `imapflow`. Scaffold (real impl in M5.1). |
| NEW (ITER-2 critic edit #2) | `~/libs/agent-tools/{project.json,package.json,src/index.ts,src/types.ts,src/abort-controller.ts}` | **NEW LIB**; `tags=["scope:agent-tools"]`; will host `fetch-listing.tool.ts`, `analyze-photos.tool.ts`, etc. in M3 (NOT in `apps/api/src/modules/agent/tools/` per critic edit #2). Depends on `libs/integrations/*`. |
| NEW | `~/apps/web-vue-e2e/` | Nx scaffolded with `pnpm nx g @nx/playwright:configuration --project=web-vue-e2e` |
| EDIT | `~/docker-compose.yml` | add `minio:` (S3-compatible 9000/9001), `mailpit:` (dev SMTP/IMAP 1025/1143/8025), `jaeger:` (16686) |
| NEW | `~/docker-compose.prod.yml` | parallel file for Hetzner: `postfix`, `dovecot`, `opendkim`, `traefik`, `tempo`, `loki`, `grafana` (referenced from M5/M6) |
| NEW | `~/prisma/migrations/<timestamp>_m0_tenant_default/migration.sql` | `INSERT INTO "Tenant" (id, name, planTier) VALUES ('default', 'Default Tenant', 'self-hosted') ON CONFLICT DO NOTHING;` |
| NEW (ITER-2 calendar A) | `~/infra/postfix/main.cf` + `~/infra/postfix/master.cf` + `~/infra/dovecot/dovecot.conf` + `~/infra/opendkim/{KeyTable,SigningTable,TrustedHosts}` + `~/infra/dns/realty79.de.zone` + `~/scripts/mail-warmup.ts` + `~/scripts/blocklist-check.ts` | **ITER-2 (calendar decision A.4):** the M5.0 ONE-SHOT ops setup happens in M0 week 1 (~6 hours: static IP request, reverse-DNS Hetzner ticket, DNS records, Postfix config baseline, OpenDKIM key gen, warmup cron). Active tuning DEFERRED to M5.1 (no parallel-attention conflict with M2/M3). |

#### M0 — Done when (AC closed)

- AC-11 (`pnpm nx affected -t lint test build typecheck` green) ✓
- AC-12 (E2E auth happy path) ✓ partial — auth-only
- AC-13 (every new table has `tenantId String? @index` + FK to `Tenant(id)`) ✓ enforced via M0 migration template; no new tables yet but invariant set
- Foundation for AC-1 through AC-10 (adapter scaffolds, DTO layer, observability, agent-tools lib) ✓
- M5.0 one-shot ops complete (static IP + DNS records + warmup cron live)

---

### M0.5 — Portfolio Read-Only Wiring (NEW, half-sprint, architect soft-1)

**Goal.** Wire `pages/portfolio/PortfolioPage.vue` and `pages/properties/PropertyListPage.vue` to a **read-only** slice of the real API (`GET /portfolio`, `GET /properties`) so that the existing portfolio's mock data is replaced with real (initially-empty-or-seeded) data immediately. This bounds 10-week mock drift across `pages/portfolio/`, `pages/renters/`, `pages/maintenance/`, `pages/accounting/` (write-paths still come in M1).

#### M0.5 — Files to create / edit

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/apps/api/src/modules/property/property.controller.ts` | implement `GET /properties` (read-only list scoped to `tenantId`) and `GET /properties/:id` |
| EDIT | `~/apps/api/src/modules/portfolio/portfolio.controller.ts` | implement `GET /portfolio` returning aggregated count/sum |
| EDIT | `~/apps/web-vue/src/pages/portfolio/PortfolioPage.vue` | drop `mockProperties.ts` import; bind to `services/api/portfolio.ts` |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyListPage.vue` | drop `mockProperties.ts` import; bind to `services/api/properties.ts` |
| EDIT | `~/apps/web-vue/src/services/api/portfolio.ts` | typed client (existing — extend) |
| EDIT | `~/apps/web-vue/src/services/api/properties.ts` | typed client (existing — extend) |
| NEW | `~/prisma/seed.ts` | seed 3-5 example Property rows for the default tenant (so the empty-portfolio UI doesn't look broken on first launch) |

#### M0.5 — Done when

- `apps/web-vue-e2e/src/portfolio-readonly.spec.ts` green (AC-12 partial)
- No `mockProperties.ts` import anywhere in `pages/portfolio/` or `pages/properties/` (PropertyListPage)
- Bound mock drift: any subsequent M2-M5 changes to Property shape must keep PortfolioPage/PropertyListPage compiling

---

### M2 — Scout-Pipeline (Foundation for AI-Agent) — ~2 sprints (iter-2 deltas)

**Goal.** Same as iter 1. Iter-2 delta: scoring-engine migration plan made explicit; `tenantId` FK added to migrations.

#### M2 — Files to create / edit (iter-2 deltas marked **ITER-2**)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m2_scout_fields/migration.sql` | **ITER-2 (critic edit #5):** additive — `ALTER TABLE "Property" ADD COLUMN "compositeScore" DOUBLE PRECISION;`, `ALTER TABLE "SavedSearch" ADD COLUMN "autonomyLevel" TEXT NOT NULL DEFAULT 'L1';`, `ALTER TABLE "SavedSearch" ADD COLUMN "scoringWeights" JSONB NOT NULL DEFAULT '{"rendite":25,"cashflow":25,"lage":25,"preisProQm":25}';`, `ALTER TABLE "PipelineConfig" ADD COLUMN "runBudgetEur" DOUBLE PRECISION NOT NULL DEFAULT 5.0;`, `ALTER TABLE "ScrapeLog" ADD COLUMN "tokenCostEur" DOUBLE PRECISION NOT NULL DEFAULT 0;`, `ALTER TABLE "ScrapeLog" ADD COLUMN "proxyCostEur" DOUBLE PRECISION NOT NULL DEFAULT 0;`. **Every NEW table created in this migration gets `tenantId String? @default("default")` + `@@index([tenantId])` AND `ALTER TABLE "<NewTable>" ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE SET NULL;`** (no new tables in M2 itself, but the pattern is locked here). |
| EDIT | `~/prisma/schema.prisma` | mirror additions; add enum `AutonomyLevel { L1 L2 L3 }`; declare `@relation` for any new `tenantId String?` columns |
| EDIT | `~/apps/api/src/modules/property/property.{module,service,controller}.ts` | **ITER-2:** keep M0.5 read-only `GET`; add CRUD `POST/PATCH /properties` (Phase 1 read-only via UI in M2; full edit only in M1) |
| EDIT | `~/apps/api/src/modules/pipeline/pipeline.{module,service,controller}.ts` | exposes `GET /pipeline/saved-searches/:id/properties?phase=1\|2\|3`; kanban-grouped |
| EDIT | `~/apps/api/src/modules/config/config.{module,service,controller}.ts` | `PipelineConfig` CRUD; default config seeded per `Tenant` |
| NEW | `~/apps/api/src/modules/saved-search/saved-search.{module,service,controller}.ts` | new module — register in `app.module.ts`; exposes `POST/PATCH/GET /saved-searches`, `POST /saved-searches/:id/run` |
| EDIT | `~/apps/api/src/app/app.module.ts` | register `SavedSearchModule`; register `BullModule.registerQueue({name:'immometrica-poll'}), {name:'composite-score'}, {name:'cashflow-recompute'}` |
| EDIT | `~/apps/api/src/modules/scraper/scraper.processor.ts` | RENAME → `~/apps/worker/src/processors/immometrica-poll.processor.ts` |
| NEW | `~/apps/worker/src/processors/immometrica-poll.processor.ts` | `@Processor('immometrica-poll')`; calls `ImmometricaService.fetchExportZip()`, parses CSV, upserts `Property` rows by `externalId`, writes `ScrapeLog` |
| NEW | `~/apps/worker/src/processors/composite-score.processor.ts` | `@Processor('composite-score')`; on `Property.created`, runs `scoring-engine.computeCompositeScore`, writes `Property.compositeScore` + `Analysis.compositeScore`, sets `Property.phase=2` if ≥ threshold |
| NEW | `~/apps/worker/src/processors/cashflow-recompute.processor.ts` | scaffold only (real use in M4 fan-out) |
| EDIT | `~/libs/integrations/immometrica/src/login-flow.ts` | full Playwright auto-login; cookies cached in `ImmometricaSession` (in-memory map, table-backed in M6) |
| EDIT | `~/libs/integrations/immometrica/src/csv-export.ts` | clicks "Export CSV" + "Export PDF"; downloads to `/tmp/immometrica-export-<ts>.zip` |
| EDIT | `~/libs/integrations/immometrica/src/parser/csv-row.ts` | maps CSV columns → `Prisma.PropertyCreateInput` |
| NEW | `~/libs/integrations/immometrica/fixtures/sample-export.csv` | 3-row anonymized fixture for unit tests |
| NEW | `~/libs/integrations/immometrica/fixtures/login-flow.zip` | Playwright trace recording (sanitized creds) |
| EDIT | `~/libs/shared/src/utils/scoring-engine.ts` | **ITER-2 (architect tension D):** see "Scoring-Engine Migration" sub-section below |
| EDIT | `~/libs/shared/src/utils/pipeline-filter.ts` | extend with phase-1 threshold filter |
| NEW | `~/libs/shared/src/dto/saved-search.ts` (extend) | autonomy enum, scoring weights validation |
| EDIT | `~/apps/web-vue/src/pages/search/SearchPage.vue` | drop `mockSearchProperties.ts`; bind to extended `services/api/properties.ts` + new `services/api/saved-search.ts`; render kanban Phase 1/2/3 |
| NEW | `~/apps/web-vue/src/services/api/saved-search.ts` | typed client |
| EDIT | `~/apps/web-vue/src/services/api/properties.ts` | add `listByPhase(savedSearchId, phase)` |
| NEW | `~/apps/web-vue/src/components/SavedSearchEditor.vue` | form with `autonomyLevel` (L1 default), `runBudgetEur`, `scoringWeights` sliders, `minScore` |

#### M2 — Scoring-Engine Migration (NEW iter-2 sub-section, architect tension D)

**Problem (raised by Architect §5 + Critic §8).** `libs/shared/src/utils/scoring-engine.ts` already exports:
- `evaluatePhase1(property: Property): number` (line 38)
- `evaluatePhase2(property: Property): number` (line 90)
- `calculateOverallScore(property: Property): number` (line 134)

The plan adds `computeCompositeScore(property, weights, marketMedian)` for AC-2. Without explicit migration guidance, both will live on and confuse implementers.

**Migration plan.**
1. **Re-implement `evaluatePhase1` as a thin wrapper around `computeCompositeScore`** with default weights `{rendite:25, cashflow:25, lage:25, preisProQm:25}` and a `console.warn` deprecation notice (will be removed in M6). This preserves any existing callers of `evaluatePhase1` while routing the actual logic through the new function.
2. **`evaluatePhase2` and `calculateOverallScore` are kept as-is for M1 Verwaltung scoring** (different semantics: post-acquisition portfolio scoring, not pipeline gating). Add JSDoc explicitly: "Used for portfolio-wide scoring after acquisition; NOT for SavedSearch pipeline gating — use `computeCompositeScore` for that."
3. **New unit test** `libs/shared/src/utils/scoring-engine.migration.spec.ts` (NEW row in C.1): asserts `evaluatePhase1(p) === computeCompositeScore(p, defaultWeights, marketMedian).total`; asserts deprecation warn fired; asserts `evaluatePhase2` and `calculateOverallScore` retain their M0-pre signatures.
4. **M6 cleanup:** remove `evaluatePhase1` and any deprecation warnings.

#### M2 — BullMQ workers — unchanged from iter 1

#### M2 — Vue UI changes — unchanged from iter 1

#### M2 — Done when

- AC-1 ✓ (SavedSearch → Phase-1 hits within 1 h, well under 24 h)
- AC-2 ✓ (Composite-Score 4 factors, 25/25/25/25 default, configurable)
- AC-13 ✓ (all new tables/columns are tenant-aware **AND FK-constrained to Tenant(id)**)
- AC-11 ✓ (CI green)
- AC-12 ✓ partial — happy-path e2e for SavedSearch creation
- **Iter-2 NEW:** `tenant-fk.int-spec.ts` green (Postgres FK 23503 raised on bad `tenantId`)

---

### M3 — AI-Research-Engine (Detail-Recherche + Vision) — ~2-3 sprints (iter-2 deltas)

**Goal.** Same as iter 1. Iter-2 deltas:
1. Agent-tool files relocated from `apps/api/src/modules/agent/tools/` to `libs/agent-tools/` (critic edit #2 / architect #2).
2. `POST /agent/conversations/:id/messages` returns `202 {jobId, pollUrl}` (architect #3 / critic edit #2).
3. Tool-Use Loop Abort Semantics fully specified (D.M3.5).
4. AC-3 manual-eval added.
5. AC-5 split — M3 closes AC-5a only; AC-5b lives in M4.
6. `cashflow-recompute` request-time path becomes a pure function (architect soft-2).
7. Migration adds `tenantId` FK constraint (critic edit #5).

#### M3 — Files to create / edit (iter-2 deltas marked **ITER-2**)

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m3_research_fields/migration.sql` | **ITER-2 (critic edit #5):** `ALTER TABLE "PropertyPhoto" ADD COLUMN IF NOT EXISTS "visionAnalysis" JSONB;`, `ALTER TABLE "PropertyPhoto" ADD COLUMN IF NOT EXISTS "hash" TEXT;`, `CREATE UNIQUE INDEX IF NOT EXISTS ... ON "PropertyPhoto" ("hash");`, `ALTER TABLE "DeepResearch" ADD COLUMN IF NOT EXISTS "sourcesList" JSONB;`, etc. **Plus:** create `LocationCache` table with `tenantId String? @default('default') @index` AND `ALTER TABLE "LocationCache" ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE SET NULL;` |
| EDIT | `~/prisma/schema.prisma` | sync types; declare `@relation` on `LocationCache.tenantId` |
| EDIT | `~/apps/api/src/modules/research/research.{module,service,controller}.ts` | exposes `POST /research/:propertyId/run` (manual trigger; **enqueues** to BullMQ + returns `202 {jobId, pollUrl}`), `GET /research/:propertyId` |
| EDIT | `~/apps/api/src/modules/vision/vision.{module,service,controller}.ts` | exposes `POST /vision/:propertyId/run` (enqueues, 202 + pollUrl), `GET /properties/:id/photos` |
| EDIT | `~/apps/api/src/modules/agent/agent.{module,service,controller}.ts` | **ITER-2 (critic edit #2 / architect #3):** exposes `POST /agent/conversations`, `GET /agent/conversations/:id`, **`POST /agent/conversations/:id/messages` returns `202 {jobId, pollUrl: '/jobs/:jobId'}` and enqueues to `agent-tool-use-loop` queue** (NOT a synchronous tool-use loop in the controller); persists `AgentConversation`/`AgentMessage` rows incrementally as the worker progresses |
| **REMOVED iter-2** | ~~`~/apps/api/src/modules/agent/tools/index.ts`~~ | **ITER-2:** files now live in `libs/agent-tools/` (see below); the `apps/api/src/modules/agent/tools/` directory is NOT created |
| NEW (ITER-2) | `~/libs/agent-tools/src/index.ts` | barrel exporting tool definitions (Claude tool-use schema) |
| NEW (ITER-2) | `~/libs/agent-tools/src/fetch-listing.tool.ts` | wraps `libs/integrations/scraper`; consumed by worker, not API |
| NEW (ITER-2) | `~/libs/agent-tools/src/analyze-photos.tool.ts` | wraps `libs/integrations/llm` Vision call |
| NEW (ITER-2) | `~/libs/agent-tools/src/lookup-rent-index.tool.ts` | wraps `libs/integrations/standort` |
| NEW (ITER-2) | `~/libs/agent-tools/src/lookup-location.tool.ts` | wraps Destatis/Regiostat |
| NEW (ITER-2) | `~/libs/agent-tools/src/run-cashflow.tool.ts` | wraps `libs/shared/src/utils/scenario-recompute.ts` (pure function, NOT BullMQ) |
| NEW | `~/apps/worker/src/processors/agent-tool-use-loop.processor.ts` | **ITER-2:** `@Processor('agent-tool-use-loop')`; consumes the job enqueued by `POST /agent/conversations/:id/messages`; runs `tool-use-loop.ts` bounded by `BudgetSupervisor`; on overrun → applies abort semantics per §D.M3.5; writes `AgentMessage` rows incrementally so the Vue chat UI can poll progress |
| NEW | `~/apps/worker/src/processors/listing-detail-research.processor.ts` | `@Processor('listing-detail-research')`; the deterministic outer-pipeline phase that triggers the agent-tool-use-loop for a single Property |
| NEW | `~/apps/worker/src/processors/photo-vision.processor.ts` | `@Processor('photo-vision')`; downloads photos, hashes (SHA-256), checks cache, calls Claude Vision with structured-output schema |
| NEW (ITER-2) | `~/apps/api/src/modules/jobs/jobs.{module,service,controller}.ts` | **ITER-2:** exposes `GET /jobs/:jobId` returning `{state: 'queued'|'running'|'done'|'failed', progress: number, result?: any, error?: string}`; backed by BullMQ `Queue.getJob()`; this is the pollUrl target for all 202-responses |
| EDIT | `~/libs/integrations/llm/src/anthropic-client.ts` | full impl: streaming, tool-use loop, vision-multipart, cost accounting; emits `cost.tokenEur` events |
| NEW | `~/libs/integrations/llm/src/tool-use-loop.ts` | **ITER-2:** runs tool-call → observation → tool-call cycle; honours `AbortController` from `BudgetSupervisor` per §D.M3.5 |
| NEW | `~/libs/integrations/llm/src/vision-schema.ts` | Zod schema for vision JSON (`zustand`, `renovierungsbedarf`, `schaeden`, `lichtverhaeltnisse`, `confidence`) |
| EDIT | `~/libs/integrations/scraper/src/stealth-browser.ts` | full impl with `playwright-extra` + stealth plugin |
| EDIT | `~/libs/integrations/scraper/src/block-detector.ts` | heuristics: HTTP 403/429, captcha selectors, CF interstitial, content-length<1KB on body-required page |
| EDIT | `~/libs/integrations/proxy/src/bright-data-adapter.ts` | wraps Bright Data Web Unlocker / Residential proxy; auto-fallback on block-detector |
| NEW | `~/libs/integrations/scraper/src/platforms/{immoscout24,ebay-kleinanzeigen,immowelt}.ts` | platform-specific extractors |
| EDIT | `~/libs/integrations/standort/src/destatis-client.ts` | full impl: GenesisOnline pull; cache results in `LocationCache` |
| EDIT | `~/libs/integrations/standort/src/regiostat-client.ts` | wraps regiostat (free tier) |
| NEW | `~/libs/integrations/standort/src/fb-client.ts` | F+B Mietspiegel (feature-flag, scaffold; D8 final after spike) |
| EDIT | `~/apps/api/src/common/budget/budget-supervisor.service.ts` | **ITER-2:** full impl with explicit AbortController integration per §D.M3.5; per-run accumulator backed by Redis `INCRBY`, keyed `budget:{savedSearchRunId}`; emits `BudgetExceeded` event AND signals `AbortController` |
| NEW (ITER-2 architect soft-2) | `~/libs/shared/src/utils/scenario-recompute.ts` | **ITER-2 NEW:** pure function `recomputeScenario(scenario, financingParams, assumptions): KeyMetrics` — used both by `ScenarioController.PATCH` synchronously (request-time, sub-50ms) AND by `cashflow-recompute.processor.ts` for cron+version-bump fan-out. NO BullMQ for the request-time path. |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyDetailPage.vue` | drop mocks; bind to `services/api/research.ts` + `services/api/vision.ts` + `services/api/agent.ts`; render `ResearchTimeline`, `PhotoAnalysisGrid`, `CashflowMiniCockpit` (M3-only mini cockpit; full cockpit M4 = AC-5b) |
| NEW | `~/apps/web-vue/src/services/api/{research,vision,agent,jobs}.ts` | typed clients (jobs.ts polls `/jobs/:id`) |
| NEW | `~/apps/web-vue/src/components/{ResearchTimeline,PhotoAnalysisGrid,CashflowMiniCockpit}.vue` | UI components |
| EDIT | `~/apps/web-vue/src/pages/chat/ChatPage.vue` | binds to `services/api/agent.ts`; **uses `services/api/jobs.ts` to poll the 202-response pollUrl** for incremental AgentMessage updates |

#### M3.5 — Tool-Use Loop Abort Semantics (NEW iter-2 sub-section, critic edit #1)

**Problem.** Critic §1 / §4 / §9 surfaced that without explicit abort semantics, AC-6 ("budget cap stops mid-loop") is not deterministically testable. Anthropic's streaming API does not let you abort cleanly mid-tool-call without partial token charges. Without spec, half-completed `PropertyPhoto.visionAnalysis` writes can pollute the dataset.

**Specification (the 5 invariants of `tool-use-loop.ts` abort behavior):**

1. **Cancel-policy = `cooperative-finish`.** When `BudgetSupervisor` sees `accumulatedCostEur >= runBudgetEur`, it sets a `cancelRequested = true` flag on the shared `AbortController`. The `tool-use-loop` checks this flag **between** tool-call iterations (after the current Claude response stream completes, before issuing the next request). The currently-executing tool call (e.g., a Vision request mid-stream OR a Playwright fetch mid-page-load) **finishes its current step** rather than being torn down mid-stream. Rationale: tearing down a streaming Anthropic response mid-tokens still incurs token billing for already-emitted tokens, AND leaves Postgres in an inconsistent state if a Vision JSON was 90% written.

2. **Partial-write rule for `PropertyPhoto.visionAnalysis`.** Every Vision call writes its result in **a single Prisma transaction at end-of-call** (`prisma.$transaction`), not progressively. If the cancel-flag is checked AFTER the Vision call completes, the row is committed (the tool finished); if the cancel-flag is checked BEFORE the next Vision call queues, that next call is skipped (no row written). **No partial Vision JSON is ever committed**. The integration test `budget-cap.abort-semantics.int-spec.ts` asserts: starting with 5 photos and `runBudgetEur` set so that exactly 3 calls fit, exactly 3 `PropertyPhoto.visionAnalysis` rows are committed (NOT 4 with one partial, NOT 5).

3. **Anthropic streaming token-billing reconciliation.** The `cost-tracker.ts` debits cost in two phases per Claude call: (a) **input-tokens debit** at `messages.create()` start (always charged by Anthropic); (b) **output-tokens debit** on `message_stop` event (charged for actually-emitted tokens). If an abort fires during the response stream, ONLY tokens emitted up to the abort point are debited — the cost-tracker uses Anthropic's `usage` field on the final `message_stop` event, which Anthropic provides even for aborted streams. **No speculative output-cap charging**: we do NOT pre-debit `max_tokens × output-rate` and refund on completion, because that breaks budget caps that are smaller than max_tokens. The integration test asserts that for an aborted stream, debited tokens equal `usage.input_tokens + usage.output_tokens` reported by Anthropic, and not `max_tokens`.

4. **Downstream queued tool calls discarded.** If at iteration N the cancel-flag is detected and Claude's response contained tool_use blocks for tools T1, T2, T3, the loop executes ONLY T1 (the first in the sequence Claude requested) — sequential, not parallel — and skips T2, T3. Rationale: simpler than parallel-cancel; predictable for testing; matches the way Anthropic sends tool_use blocks (sequential intent). The skipped tool calls are recorded as `AgentMessage` rows with `status='skipped-budget'` so the user sees what was cut.

5. **Scrape/Cost log finalization.** On abort, the worker writes:
   - `ScrapeLog.status = 'budget_exceeded'`
   - `ScrapeLog.abortAt = NOW()`
   - `ScrapeLog.tokenCostEur = <accumulated up to abort>`
   - `ScrapeLog.runBudgetEur = <the configured cap>`
   - Sentry breadcrumb `event: anthropic.budget.exceeded` with `fingerprint: anthropic.budget`
   - Counter `anthropic.budget.aborted_total{tenant=...,savedSearchId=...}` increments
   - Counter `anthropic.budget.partial_writes_discarded_total` increments by the number of skipped tool calls (for observability of how much research was cut)

**Test fixture (NEW per critic edit #1):** `apps/api/test/integration/budget-cap.abort-semantics.int-spec.ts` — asserts all 5 invariants above with a deterministic mocked Anthropic SDK that emits a known token sequence. This test gates AC-6 and is also referenced from `tool-use-loop.abort-semantics.spec.ts` (unit-level partial assertions) in C.1.

#### M3.6 — Async Agent-Conversation Contract (NEW iter-2 sub-section, critic edit #2 / architect #3)

**Problem.** Iter-1's `agent.controller.ts` design implied that `POST /agent/conversations/:id/messages` synchronously triggered the Claude tool-use loop, which is a P2 violation (long-running I/O in the API request handler).

**Specification.**

- `POST /agent/conversations/:id/messages` request body: `{ role: 'user', content: string }`.
- Controller appends an `AgentMessage` (role=user, content) row, then enqueues a job on `agent-tool-use-loop` queue with `{conversationId, savedSearchId?, propertyId?}` payload. Returns:
  ```
  HTTP 202 Accepted
  Location: /jobs/<jobId>
  Body: { jobId: "agent-tool-use-loop:abc123", pollUrl: "/jobs/agent-tool-use-loop:abc123", conversationId: "conv-xyz" }
  ```
- `GET /jobs/:jobId` (NEW JobsModule per M3 file table) returns:
  ```
  { state: 'queued' | 'running' | 'done' | 'failed' | 'budget_exceeded',
    progress: 0..100,            // worker calls job.updateProgress() as it proceeds
    result?: { newAgentMessageIds: string[] },
    error?: string }
  ```
- The Vue `ChatPage.vue` calls `POST` → reads `pollUrl` → polls every 2s via `services/api/jobs.ts` → on `state in ('done','budget_exceeded','failed')` re-fetches `GET /agent/conversations/:id` to render new AgentMessage rows.
- The worker writes `AgentMessage` rows INCREMENTALLY (one per tool call + one final assistant message) AND calls `job.updateProgress()` so the UI can show "Claude is fetching listing... (3/5)".

**Acceptance test (NEW per critic edit #2):** `apps/api/test/integration/agent-conversation-async.int-spec.ts` — POST returns 202 within 50ms; pollUrl reaches `state='done'` within 60s in test mode (mocked Anthropic); intermediate poll returns `state='running'` with `progress > 0`.

#### M3 — BullMQ workers — iter-2 update

- `listing-detail-research` — concurrency: 2; rate-limit: 30/min global to ImmoScout; retries: 3 exp backoff; budget-bound.
- `photo-vision` — concurrency: 4; deduplicates on photo SHA-256; budget-bound.
- **NEW iter-2:** `agent-tool-use-loop` — concurrency: 2; consumes from `POST /agent/conversations/:id/messages` enqueues; bounded by `BudgetSupervisor` per §D.M3.5; writes `AgentMessage` incrementally + calls `job.updateProgress()`.

#### M3 — Vue UI changes — unchanged from iter 1 except:

- `apps/web-vue/src/services/api/jobs.ts` (NEW) — generic poll-helper for any 202-returned `pollUrl`.
- `pages/chat/ChatPage.vue` uses `jobs.ts` to render incremental progress.

#### M3 — Done when (iter-2 rewritten per edits #3, #4)

- AC-3 ✓ (Phase-2 properties auto-trigger detail research with stealth+proxy fallback) **AND iter-2: `pnpm nx run api-e2e:manual-eval-m3-vision` reports ≥80% Lokalisierungen + ≥70% Zustandseinschätzungen on the 10 reference properties** (critic edit #3)
- AC-4 ✓ (≥5 photos per property with structured Vision JSON)
- **AC-5a ✓ (KeyMetrics non-null on every Phase-2 Property's default Scenario, computed via `scenario-recompute.ts` pure function called from `run-cashflow.tool.ts`)** — **AC-5b is NOT closed in M3; AC-5b moves to M4** (critic edit #4)
- AC-6 ✓ (Per-run budget cap enforced; `ScrapeLog.status='budget_exceeded'` on overrun; **all 5 abort-semantic invariants from §D.M3.5 verified by `budget-cap.abort-semantics.int-spec.ts`**) (critic edit #1)
- AC-11/12 ✓ (CI + e2e)
- AC-13 ✓ (M3 migration adds `tenantId` FK on `LocationCache`)
- **MVP-Gate closed** (M0 + M0.5 + M2 + M3 = AC-1..AC-4, AC-5a, AC-6 plus AC-11..AC-13).

---

### M4 — Cashflow-Cockpit (Excel-Parität FULL 1:1) — ~3-4 sprints (iter-2 deltas)

**Goal.** Same as iter 1. Iter-2 deltas:
1. M4.0 reverse-engineering capped at concrete deliverables, max 1 week, freeze-criterion (architect tension C).
2. Closes AC-5b (full Vue cockpit visibility).
3. `cashflow-recompute` worker is now ONLY for cron + version-bump fan-out; request-time uses pure function (architect soft-2).

#### M4.0 — Excel Reverse-Engineering Sub-Sprint (CAPPED, iter-2 architect tension C)

**Cap (NEW iter-2):**
- **Max duration: 1 calendar week** (5 working days).
- **Exact deliverable count:**
  - Run `~/scripts/excel-extract.ts` on day 1 to produce `~/.omc/notes/m4-excel-mapping.md` with **the actual count of named ranges, defined names, sheets, and volatile-formula cells (INDIRECT/OFFSET) extracted from the .xlsx**. This is the empirical baseline, not a guess.
  - Decision gate after day 1: if extract shows ≤30 named ranges across ≤5 sheets, proceed with **5 fixtures** as planned. If extract shows 30-60 named ranges, escalate fixture count to **8** within the 1-week cap. If >60 named ranges, **freeze M4.0** and file follow-up F13 to scope down (delete non-Hauptkalkulation tabs, agree with user on what's MVP-required).
  - **Freeze-criterion:** if at end of 5 working days the parity-suite is not green for at least the 5 baseline fixtures, M4.0 freezes; M4.1 starts with what's there; the missing fixtures become tech-debt tracked as F13.

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/libs/shared/src/fixtures/excel-parity/README.md` | doc: how each fixture was extracted from Excel master |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-01-baseline.json` | Property + financing + assumptions inputs + 30y expected `KeyMetrics` |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-02-sondertilgung.json` | extra payment in year 5 |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-03-mietausfall.json` | 3-month vacancy in year 7 |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-04-stresstest-minus20.json` | -20% rent shock |
| NEW | `~/libs/shared/src/fixtures/excel-parity/fixture-05-verkauf-jahr10.json` | sale event, residual value |
| NEW | `~/libs/shared/src/utils/_reference-calc.py` | NumPy reference for property-based testing |
| NEW (ITER-2) | `~/scripts/excel-extract.ts` | one-off `tsx` script: opens .xlsx via `exceljs`, dumps every named cell → JSON; **runs day-1 to produce the cap decision** |
| NEW (ITER-2) | `~/.omc/notes/m4-excel-mapping.md` | manual notes mapping Excel cells → calculator field names; **includes the day-1 extract count summary** |

#### M4.1 — Calculator Extension (Sprint 2) — unchanged from iter 1

| Status | Path | Purpose |
|---|---|---|
| EDIT | `~/libs/shared/src/utils/immocation-calculator.ts` | extend to cover all formula edges |
| NEW | `~/libs/shared/src/utils/sensitivity-table.ts` | builds 5x5 grids over (zinssatz±2pp, mietsteigerung±1pp) |
| NEW | `~/libs/shared/src/utils/stress-test.ts` | scenarios: Mietausfall 6 Mt, Zinsschock +3pp, Renovation €50k Jahr 8 |
| NEW | `~/libs/shared/src/utils/comparable-properties.ts` | scoring of comparables |
| EDIT | `~/libs/shared/src/utils/immocation-calculator.spec.ts` | extend to cover all 5 fixtures |
| NEW | `~/libs/shared/src/utils/immocation-calculator.parity.spec.ts` | cent-precision (AC-7) |
| NEW | `~/libs/shared/src/utils/immocation-calculator.property.spec.ts` | `fast-check` 1000-iter property-based |

#### M4.2 — Scenario Persistence + Recompute (Sprint 3) — iter-2 architect soft-2

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m4_scenario_versioning/migration.sql` | `ALTER TABLE "Scenario" ADD COLUMN "calculatorVersion" TEXT NOT NULL DEFAULT '1.0';`, `ADD COLUMN "keyMetrics" JSONB;`, `ADD COLUMN "yearProjection" JSONB;`, `ADD COLUMN "sensitivityGrid" JSONB;`, `ADD COLUMN "stressTestResults" JSONB;` |
| NEW | `~/apps/api/src/modules/scenario/scenario.{module,service,controller}.ts` | `GET/POST/PATCH /scenarios`, `POST /scenarios/:id/recompute`; tenant-scoped. **ITER-2 (architect soft-2): `PATCH /scenarios/:id` calls `libs/shared/src/utils/scenario-recompute.ts` SYNCHRONOUSLY (pure function, sub-50ms), returns updated KeyMetrics in the response body — NOT 202. The 202+poll pattern is reserved for genuinely long-running tasks (LLM tool-use, scraping).** |
| EDIT | `~/apps/api/src/app/app.module.ts` | register `ScenarioModule` |
| EDIT | `~/apps/worker/src/processors/cashflow-recompute.processor.ts` | **ITER-2:** full impl ONLY for: (a) cron `nightly-parity-drift` (rebuild every Scenario, check drift), (b) `calculatorVersion` bump fan-out (one job per existing Scenario row when version-string changes). **NOT used for request-time recompute.** |

#### M4.3 — Vue Cockpit (Sprint 4) — unchanged from iter 1

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/apps/web-vue/src/pages/properties/PropertyCockpitTab.vue` | 30y projection table + chart |
| NEW | `~/apps/web-vue/src/pages/properties/PropertySensitivityTab.vue` | 5x5 grid via `apexcharts` heatmap |
| NEW | `~/apps/web-vue/src/pages/properties/PropertyStressTestTab.vue` | scenario buttons + result panel |
| NEW | `~/apps/web-vue/src/pages/properties/PropertyComparablesTab.vue` | comparable list + map |
| EDIT | `~/apps/web-vue/src/pages/properties/PropertyDetailPage.vue` | adds tabs above; binds to `services/api/scenario.ts` |
| NEW | `~/apps/web-vue/src/services/api/scenario.ts` | typed client |
| NEW | `~/apps/web-vue/src/components/ScenarioEditor.vue` | financing + assumptions form |
| NEW | `~/apps/web-vue/src/utils/excel-export.ts` | uses `exceljs` to export computed Scenario back to .xlsx |

#### M4 — BullMQ workers (iter-2 update)

- `cashflow-recompute` — fully implemented but **only for cron and version-bump fan-out**, not request-time.

#### M4 — Done when (iter-2 update per critic edit #4)

- AC-7 ✓ (5 fixtures × 30 KPIs × 30 y ≤ 0.01 € drift) — OR M4.0 freeze documented with reduced fixture count and F13 follow-up
- AC-8 ✓ (4 tabs navigable in Vue, all numbers match Excel)
- **AC-5b ✓ (full Vue cockpit visibility — closes the half of AC-5 deferred from M3)** (critic edit #4)
- AC-12 ✓ (e2e cockpit happy path)

---

### M5 — Broker-Outreach-Agent (E-Mail Automation) — ~2 sprints (M5.0 ops in M0; M5.0 abort criterion iter-2)

**Goal.** Same as iter 1. Iter-2 deltas:
1. M5.0 active warmup tuning DEFERRED to M5.1 (architect tension A — calendar decision A.4); only ONE-SHOT ops setup happens in M0 week 1.
2. M5.0 abort criterion added (critic edit #6).
3. Migration adds `tenantId` FK constraint (critic edit #5).

#### M5.0 — Mail-Stack (split into ONE-SHOT-in-M0 + active-tuning-in-M5.1)

**One-shot ops setup (already in M0 per §D.M0):** static IP request, reverse-DNS Hetzner ticket, DNS records (SPF/DKIM/DMARC `p=quarantine`), Postfix `main.cf`/`master.cf` baseline, OpenDKIM key gen, warmup cron started. Estimated 1 day of human time at M0 week 1.

**Active warmup tuning (M5.1 sprint 1, NOT parallel to M2/M3 per architect T1):**
- Daily review of `mail.warmup.scoreLatest` gauge; tune Postfix params if score plateau.
- Adjust DMARC from `p=quarantine` to `p=reject` at day 30 if score >9/10.
- Tune blocklist-check thresholds.

**Abort criterion (NEW iter-2 critic edit #6):**
- Detection signal: gauge `mail.warmup.daysElapsed` + `mail.warmup.scoreLatest`.
- Trigger: `daysElapsed >= 28 AND scoreLatest < 8` for 2 consecutive daily checks.
- Action: automatic transport-flip — set `feature.brokerOutreach.transport = 'managed-fallback'`; specifically:
  - Primary fallback: **Resend (EU endpoint)** — DPA available, EU-region data residency, supports DKIM via DNS records we already have.
  - Secondary fallback: **Mailgun-Frankfurt** — same DPA + EU residency.
  - The chosen fallback is configured ahead of time as ENV `MAIL_FALLBACK_PROVIDER=resend|mailgun`; default `resend`.
- Rationale (critic edit #6): the alternative — indefinite warmup — burns more solo-dev attention than the DSGVO trade saves. Both Resend (EU) and Mailgun-Frankfurt are DSGVO-compliant via DPA + EU residency, so the trade is "self-hosted purity vs. attention bandwidth," not "DSGVO vs. not."
- AC-9 measurement updated: "Mail-Tester ≥9/10 OR fallback engaged within 28 days of warmup start, whichever comes first."

| Status | Path | Purpose |
|---|---|---|
| NEW (in M0 week 1) | `~/infra/postfix/main.cf` etc. (full list in §D.M0) | one-shot ops setup |
| NEW (M5.1) | `~/libs/integrations/mailer/src/managed-fallback-resend.ts` | **ITER-2:** Resend (EU endpoint) adapter for fallback path |
| NEW (M5.1) | `~/libs/integrations/mailer/src/managed-fallback-mailgun.ts` | **ITER-2:** Mailgun-Frankfurt adapter |
| NEW (M5.1) | `~/libs/integrations/mailer/src/transport-router.ts` | **ITER-2:** routes outbound mail to `smtp-transport.ts` (self-hosted Postfix) OR `managed-fallback-{resend,mailgun}.ts` based on `feature.brokerOutreach.transport` flag |
| NEW (M5.1) | `~/apps/worker/src/processors/mail-warmup-monitor.processor.ts` | **ITER-2:** cron daily; reads `mail.warmup.scoreLatest`; if abort condition hits, flips `feature.brokerOutreach.transport='managed-fallback'` and Sentry-pages user |

#### M5.1 — Mailer Adapter + Module (Sprint 1) — iter-2 deltas

| Status | Path | Purpose |
|---|---|---|
| NEW | `~/prisma/migrations/<timestamp>_m5_mail_message/migration.sql` | **ITER-2 (critic edit #5):** `CREATE TABLE "MailMessage" (id, direction TEXT, smtpHeaders JSONB, classification TEXT, propertyId, agentConversationId, attachments JSONB, sentAt, receivedAt, tenantId String DEFAULT 'default', ...)` + indexes. **`ALTER TABLE "MailMessage" ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE SET NULL;`** |
| EDIT | `~/prisma/schema.prisma` | add `MailMessage` model; declare `@relation` for `tenantId` |
| EDIT | `~/libs/integrations/mailer/src/smtp-transport.ts` | full `nodemailer` impl pointing at Postfix `localhost:587` (or `mailpit` in dev) |
| EDIT | `~/libs/integrations/mailer/src/imap-poller.ts` | full `imapflow` impl polling Dovecot every 60s, parses with `mailparser` |
| EDIT | `~/libs/integrations/mailer/src/template-engine.ts` | Handlebars-based; templates in `libs/integrations/mailer/templates/{energieausweis,teilungserklaerung,hausgeld,protokoll,mieterliste}.hbs` |
| EDIT | `~/libs/integrations/mailer/src/reply-classifier.ts` | calls Claude with structured-output; cached on `messageId` |
| NEW | `~/libs/integrations/mailer/src/reputation-check.ts` | blocklist + Mail-Tester wrapper |
| NEW | `~/libs/integrations/mailer/templates/*.hbs` | 5 outbound templates with DSGVO footer |
| NEW (ITER-2) | `~/libs/integrations/mailer/fixtures/reply-corpus/{en,de}-{documents-attached,more-info-requested,off-topic,negative-reply}/{1..*}.eml` | **ITER-2 (critic AC-10 minor finding):** the 50-mail test corpus is now committed to repo with directory structure specified |
| EDIT | `~/apps/api/src/modules/messaging/messaging.{module,service,controller}.ts` | `GET /mail-messages`, `POST /mail-messages/draft`, `POST /mail-messages/:id/send`, `POST /mail-messages/:id/classify` |

#### M5.2 — Outreach Workflow (Sprint 2) — unchanged from iter 1 (file paths)

#### M5 — Done when (iter-2 update)

- **AC-9 ✓ (Mail-Tester ≥9/10 OR fallback `transport='managed-fallback'` engaged within 28 days)** (critic edit #6)
- AC-10 ✓ (≥90% reply classification on 50-mail test corpus committed at `libs/integrations/mailer/fixtures/reply-corpus/`)
- AC-12 ✓ (e2e Mailpit-based)
- AC-13 ✓ (M5.1 migration adds `tenantId` FK on `MailMessage`)

---

### M1 — Verwaltung (Bestandsmanagement) — ~3 sprints — unchanged from iter 1

(File paths unchanged. M0.5 already wired Portfolio + PropertyList read-only, so M1 mostly adds write paths + Unit/Lease/Renter/Payment/Document/Maintenance modules. Done when: AC-13 ✓, AC-12 ✓, all `mock*.ts` deleted.)

---

### M6 — Hardening & Production-Readiness — ~1 sprint (iter-2 deltas)

**Goal.** Same as iter 1. Iter-2 deltas:
1. Step 6.5 added: **Worker process reversibility tripwire** — if 1-week production telemetry shows API memory <512 MB and worker memory <512 MB at p95 AND no API outages caused by worker crashes, file F11 to evaluate merging back to 1B′ (BullMQ Worker inside API process).
2. Detection signals for R3, R4, R7, R11, R14 added (critic edit #6).

#### M6 — Files to create / edit — unchanged from iter 1, plus:

| Status | Path | Purpose |
|---|---|---|
| NEW (ITER-2) | `~/scripts/m6-process-split-tripwire.md` | runbook: how to evaluate the 1B → 1B′ merge after 1 week of telemetry |
| NEW (ITER-2) | `~/scripts/m6-detection-signal-test-stimuli.md` | per-Pre-Mortem stimulus injection for verifying detection signals fire (e.g., synthetic 403 to test R1, mock vision-low-confidence to test R3) |

#### M6 — Done when

- All ACs (AC-1..AC-13, including AC-5a/5b split) green in production environment.
- Restore-test passes (kill DB, restore from pgBackRest, verify data).
- DSGVO audit checklist filled.
- All 3 Pre-Mortem detection signals firing in Grafana.
- **Iter-2: All 6 newly-detected risks (R3, R4, R7, R11, R14 detection signals) firing on synthetic stimulus** per `m6-detection-signal-test-stimuli.md`.
- Runbook executed in dry-run for each Pre-Mortem scenario.

---

## E) Risks Table (RE-TABULATED iter-2 — every row has a Detection Signal column)

| ID | Risk | Probability | Impact | Mitigation in plan | Detection signal | Owner |
|---|---|---|---|---|---|---|
| R1 | Immometrica detects Playwright session and blocks | High | High | M2: stealth + click-flow trace fixture; auto-fallback Bright Data; manual-CSV endpoint | Counter `immometrica_poll_blocked_total` ≥3/24h → Telegram (Pre-Mortem B.1) | Solo dev |
| R2 | LLM cost overrun per run | Medium | Medium | M0/M3: `BudgetSupervisor` Redis-INCRBY; hard-stop at `runBudgetEur`; **NEW iter-2 §D.M3.5 abort semantics** | Counter `anthropic.budget.aborted_total` per savedSearch + counter `anthropic.budget.partial_writes_discarded_total`; Sentry rule `event=anthropic.budget.exceeded` | Solo dev |
| R3 (NEW iter-2 detection) | Vision hallucinations skew cashflow | Medium | High | M3: structured Zod-schema with `confidence`; fallback "needs human review" if <0.5; cache by photo SHA-256 hash | **NEW:** Counter `vision.confidence.below_threshold_total{tenant=...}` increments when confidence<0.5; Sentry breadcrumb `event=vision.hallucination.suspected` with the photo URL + the rejected JSON; daily digest mail listing all properties with ≥1 low-confidence photo (if any photo<0.5, the property is flagged for human review in `pages/properties/PropertyDetailPage.vue` with a yellow banner) | Solo dev |
| R4 (NEW iter-2 detection, separate from R1) | Browser scraping blocked on ImmoScout24/eBay-K (NOT Immometrica) | High | High | M3: `block-detector` heuristics; auto-fallback Bright Data; per-platform rate-limit; backoff | **NEW:** Counter `scraper.platform.blocked_total{platform=immoscout24\|ebay-kleinanzeigen\|immowelt}` (separated from `immometrica_poll_blocked_total`); Pino log fingerprint `scraper.{platform}.blocked` to Sentry; alert at ≥5/24h per platform | Solo dev |
| R5 | SMTP IP flagged or DKIM misconfigured | Medium | High | M0 week 1 one-shot ops + M5.1 active tuning + **NEW iter-2 abort to managed fallback** | Gauge `mailer.reputation.score` ≤7 → Telegram; bounce ratio >5% → Telegram; DMARC RUA `dkim/spf=fail` → Sentry; **NEW gauge `mail.warmup.daysElapsed` + `mail.warmup.scoreLatest` triggers fallback at `daysElapsed≥28 AND score<8`** (Pre-Mortem B.2) | Solo dev |
| R6 | Excel parity drift after months | Medium | High | M4.0 (CAPPED) fixtures + Python ref + property-based; `Scenario.calculatorVersion`; nightly cron | Gauge `calculator.scenario.recompute.maxAbsDrift_eur` per nightly run; CI badge `parity-suite`; user-visible diff banner in PropertyDetailPage (Pre-Mortem B.3) | Solo dev |
| R7 (NEW iter-2 detection) | DSGVO violation in broker outreach | Medium | High | M5: opt-out footer mandatory; juristisch-geprüfte Templates pre-launch; L3 hard-caps; F6 BLOCKER for M5 launch | **NEW:** Counter `mailer.outbound.template_version_used{templateId, version}`; if any outbound mail uses a template version older than `current_legal_version` (set by F6 review), Sentry alarm `event=mailer.template.outdated` fires + the send is blocked at `transport-router.ts`; user-visible Settings dashboard widget shows "Last legal review: <date>"; **plus** counter `mailer.outbound.opt_out_link_missing_total` (Handlebars helper validates every render contains `{{optOutLink}}`; if missing, render fails AND counter increments) | Solo dev + Jurist |
| R8 | Postgres data loss | Low | Critical | M6: pgBackRest daily + 4h incr + S3 off-site; restore-runbook | **iter-2 strengthened:** Cron `weekly-restore-test` runs every Sunday 03:00 — restores yesterday's pgBackRest backup to a temp Postgres instance, runs `prisma migrate status`, asserts ≥1 row in `Tenant`, drops the temp instance; on failure, Sentry + Telegram. Gauge `backup.last_successful_restore_at` (epoch seconds) → alert if age >7 days. | Solo dev |
| R9 | Solo dev burnout / single-point-of-failure | Medium | High | OMC AI agents; 1-week sprints; Critic/Architect reviews; **iter-2 calendar A.4 — M5.0 active tuning deferred so M2/M3 attention is exclusive** | Process metric — none; tracked qualitatively via weekly retrospective in `~/.omc/notes/weekly-retro.md` | Solo dev |
| R10 | Anthropic SDK breaking change (model deprecation) | Low | Medium | All Anthropic imports gated to `libs/integrations/llm/`; pin model in env, not code | **NEW:** Sentry rule `event=anthropic.api.deprecation_warning` (Anthropic SDK emits these); follow-up F12 watcher in `scripts/anthropic-deprecation-check.ts` runs weekly via cron, queries Anthropic status page, opens Sentry issue if model is deprecated | Solo dev |
| R11 (NEW iter-2 detection) | Hetzner VM crashes or storage failure | Low | Critical | docker-compose restart-on-failure; pgBackRest off-site; runbook (M6); MinIO replication deferred | **NEW:** UptimeRobot (free tier) external check on `https://api.realty79.de/api/health` every 1 min; alert on 3 consecutive failures → Telegram; gauge `vm.disk.usedPercent` from `df -h` cron via Pino → Sentry rule at >85%; gauge `vm.memory.usedPercent` from `free -m` cron → Sentry rule at >90%; **MinIO replication remains deferred** but a follow-up F14 is filed with trigger "first storage incident OR M6+3-month survival" | Solo dev |
| R12 | Mock data drift between Vue and API | Medium (today, **lower iter-2 due to M0.5**) | Medium | Milestone-by-milestone removal; **iter-2: M0.5 wires Portfolio + PropertyList early**; M1 deletes all `mock*.ts`; ESLint `no-restricted-imports` for `**/mock*.ts` from M1 | CI rule `pnpm nx graph` post-M1 must show 0 dependencies on `apps/web-vue/src/data/mock*` files | Solo dev |
| R13 | `tenantId` plumbing forgotten | Medium | High (when SaaS pivot lands) | M0 ESLint + M0 migration template + **iter-2 M2/M3/M5 FK constraints**; integration tests `tenant-scope.int-spec.ts` AND `tenant-fk.int-spec.ts` | Postgres FK 23503 raised on bad insert (caught in `tenant-fk.int-spec.ts`); migration template lints any `ALTER TABLE … ADD COLUMN tenantId` without matching `ADD CONSTRAINT fk_tenant` (custom Prisma migration linter in `scripts/prisma-migration-lint.ts` runs in CI) | Solo dev |
| R14 (NEW iter-2 detection) | Per-platform extractor drift (ImmoScout DOM change) | High | Medium | M3: extractor selectors centralized in `libs/integrations/scraper/src/platforms/*.ts`; integration tests with frozen HTML fixtures; nightly smoke-test crawl | **NEW:** Cron `nightly-extractor-smoke` fetches 1 known live listing per platform, runs extractor, asserts `title!==null AND price!==null AND photos.length>=3`; on assertion fail, Pino fingerprint `scraper.{platform}.extraction_drift` → Sentry; counter `scraper.{platform}.extraction_drift_total`; alert at ≥1/24h | Solo dev |
| R15 | Disk fills on Hetzner from Playwright artifacts | Medium | Medium | M0: ephemeral `/tmp/immometrica-export-*.zip` purged on success; M6: cron `find /tmp -mtime +1 -delete` | **NEW:** Same gauge `vm.disk.usedPercent` from R11 — Sentry rule at >85% catches this too | Solo dev |

---

## F) Verification Steps (per Milestone) — iter-2 update

| Milestone | Nx command | Manual smoke check | Observability check |
|---|---|---|---|
| M0 | `pnpm nx affected -t lint test build typecheck e2e` | Vue: register → login → dashboard; API: `curl localhost:3000/api/health` → 200; bull-board reachable; Sentry test error; **iter-2: `dig +short TXT realty79.de` returns SPF, `dig +short TXT default._domainkey.realty79.de` returns DKIM, `dig +short TXT _dmarc.realty79.de` returns DMARC** | Pino structured log with `traceId`; Jaeger trace; **iter-2: warmup cron heartbeat in Pino** |
| M0.5 | `pnpm nx e2e web-vue-e2e --grep portfolio-readonly` | Vue: open `/portfolio` → see real (seeded) Property list, no mock data | `pnpm nx graph --focus=web-vue` shows no dep on `mock*.ts` from `pages/portfolio/` |
| M2 | `pnpm nx run-many -t test --projects=api,worker,shared,immometrica,scraper && pnpm nx e2e api-e2e --grep saved-search` | Vue: create SavedSearch → wait 1 h cron OR `POST /:id/run` → see Phase-1 cards | `immometrica.poll.hits` counter; `ScrapeLog.status='ok'`; `composite-score` queue drained; **iter-2: `tenant-fk.int-spec.ts` green** |
| M3 | `pnpm nx run-many -t test --projects=api,worker,llm,scraper,standort,agent-tools && pnpm nx e2e api-e2e --grep '(research\|vision\|budget\|agent-async)' && pnpm nx run api-e2e:manual-eval-m3-vision` | Vue: open phase-2 property → see ResearchTimeline + ≥5 PhotoAnalysisGrid + CashflowMiniCockpit; **iter-2: chat page POST returns 202 + pollUrl, message renders incrementally**; **iter-2: 10 reference properties manual-eval reports ≥80%/≥70%** | `cost.tokenEur.per_run` p95 < runBudget; spans visible; `anthropic.budget.aborted_total` baseline; **iter-2: `budget-cap.abort-semantics.int-spec.ts` green — all 5 invariants** |
| M4 | `pnpm nx test shared --testPathPattern=parity` + `python3 libs/shared/src/utils/_reference-calc.py` + `pnpm nx e2e web-vue-e2e --grep cockpit` | Vue: open property → cockpit/sensitivity/stress/comparables tabs; export to .xlsx; reopen in Excel → match | `calculator.parity.maxDrift_eur` < 0.01; **iter-2: AC-5b green — full Vue cockpit visibility verified by `cockpit-cashflow.spec.ts`** |
| M5 | `pnpm nx run-many -t test --projects=mailer,api,worker && pnpm nx e2e api-e2e --grep '(broker-outreach\|mail-inbound\|warmup-abort)'` | Trigger L3 outreach against Mailpit; reply with PDF; verify Document attached; check `mail-tester.com` score; **iter-2: simulate 28-day score=7 stall and verify transport flips to managed-fallback** | `mailer.outbound.sent`; `mailer.reputation.score` ≥9 OR fallback engaged; DMARC RUA pass; bounce ratio <5% |
| M1 | `pnpm nx run-many -t test --projects=api,worker && pnpm nx e2e api-e2e --grep verwaltung && pnpm nx e2e web-vue-e2e --grep verwaltung` | Vue: Property → Unit → Lease → Renter → Payment → MaintenanceTicket → Document upload, <5 min | `verwaltung.payment.overdue.flagged`; tenant-scope integration green; no `mock*.ts` in `pnpm nx graph` |
| M6 | `pnpm nx affected -t lint test build typecheck e2e` + `docker compose -f docker-compose.prod.yml config` + restore dry-run | Production smoke: TLS valid, `/api/health` 200, bull-board, Grafana dashboards render, restore from yesterday's pgBackRest succeeds | **iter-2: All Pre-Mortem detection signals fireable on synthetic stimulus per `m6-detection-signal-test-stimuli.md`; SLO doc finalized in `~/scripts/realty79-slo.md` (specific thresholds, not generic "green"); 1B → 1B′ tripwire memo executed per `m6-process-split-tripwire.md`** |

---

## G) ADR — Architecture Decision Record (iter-2 update)

### G.1 Decision (iter-2 rewrite)

The Realty79 Scout-MVP is implemented as a **brownfield extension of the existing Nx 22 monorepo**, splitting the runtime into two NestJS processes (`apps/api` for HTTP, `apps/worker` for BullMQ-driven I/O) — with an **explicit reversibility tripwire** (M6 step 6.5) that re-evaluates merging worker into API after 1 week of production telemetry. **All external I/O routes through `libs/integrations/<vendor>/` adapters**, enforced both lint-time (Nx `enforce-module-boundaries` + `import/no-restricted-paths`) AND runtime (per-lib `package.json` scoping — adapter SDKs are physically not present in the API process's resolved dependency graph). **Agent tools live in a dedicated `libs/agent-tools/` lib** (NOT under `apps/api/src/modules/agent/tools/`), consumed exclusively by the worker. The agent topology is a **deterministic outer pipeline with a Claude tool-use loop inside the `listing-detail-research` phase**, gated by a Redis-backed per-run €-budget supervisor with **explicitly specified abort semantics** (cooperative-finish; partial-write rules; Anthropic streaming token-billing reconciliation; sequential downstream-call discard) — see §D.M3.5. **All HTTP endpoints that trigger long-running tasks return `202 {jobId, pollUrl}` and the actual work runs on the worker**, polled via a new `JobsModule` (§D.M3.6). Mail is **self-hosted Postfix+Dovecot+OpenDKIM** with a **deferred-warmup-tuning calendar** (one-shot ops in M0 week 1; active tuning in M5.1 — closes architect attention-bandwidth tension) AND an **explicit abort criterion**: if Mail-Tester <8/10 after 28 days of warmup, automatic fallback to Resend (EU endpoint) or Mailgun-Frankfurt with DPA. Excel-parity is achieved via a **capped reverse-engineering sub-sprint (M4.0, max 1 week, with day-1 extract-decision gate)** producing 5 (or up to 8) JSON fixtures + a NumPy reference + property-based tests over a versioned `Scenario` schema. **AC-5 is split into AC-5a (M3 closes — KeyMetrics non-null) and AC-5b (M4 closes — full Vue cockpit visibility)**. The `tenantId` column on every new table carries a **FK constraint** referencing `Tenant(id) ON DELETE SET NULL`, upgrading "naming convention" to "schema-enforced invariant." The build proceeds in the locked Scout-First order **M0 → M0.5 → M2 → M3 → M4 → M5 → M1 → M6** (M0.5 added per architect soft-1 to bound mock drift).

### G.2 Drivers (top 3, unchanged from iter 1)

DD1. Shortest path to first lukrative property surfaced.
DD2. Minimize ToS / DSGVO / spam-reputation risk.
DD3. Minimize €/run.

### G.3 Alternatives Considered (steelman summaries — iter-2 expansion per critic edit #7)

**Alt-1 — In-process Playwright inside NestJS API (Fork 1A).** Steelman: zero-ops, single bootstrap, single deployment unit, simplest dev experience. Rejected because (a) Hetzner CCX13 8 GB shared between API + 4× Playwright Chromium (~3 GB peak) + Prisma + Pino pipes is an OOM risk; (b) Playwright crash takes API down; (c) violates P2.

**Alt-1′ — BullMQ Worker class instantiated INSIDE API process (NEW iter-2 steelman).** Steelman: 80% of dual-process isolation at 0% of dual-process ops cost — one Sentry release, one log stream, one `pnpm nx serve api` command; reversibility cost from 1B is also low (1-day refactor). Rejected for v1 because (a) Playwright memory pressure shares heap with NestJS — single OOM kills both; (b) `process.on('uncaughtException')` discipline is brittle for solo dev under deadline; (c) when load testing finishes (F7) and we may need a second VM, 1B is already that shape. **Reversibility tripwire in M6 step 6.5** keeps this option live: if 1-week telemetry shows API + worker each <512 MB at p95 with no API outages, F11 follow-up evaluates 1B → 1B′ merge.

**Alt-1″ — External Playwright-as-a-Service (Fork 1C).** Steelman: no browser binary on VM. Rejected: D11 self-hosted; DSGVO (Immometrica session cookies leaving VM).

**Alt-2 — Single agent loop with all tools (Fork 2A).** Steelman: maximum agent flexibility; richest user-facing chat. Rejected: D5/AC-6 budget cap unenforceable mid-loop across an unbounded toolset; abort-semantics burden multiplies per tool.

**Alt-2′ — Pure FSM with Claude `tools:[]` (Fork 2B′, NEW iter-2 steelman).** Steelman: deterministic FSM in worker calls Claude non-agentically with `tools:[]` + structured-output schema `{needsMorePages, nextUrls, vision, done}`; loops up to N=5 atomic request/response calls; eliminates `BudgetSupervisor`-mid-loop-interrupt complexity entirely; Anthropic streaming-partial-token accounting becomes a non-issue (no streaming used); failure modes shrink (tool throws → worker retries next FSM step). Rejected for v1 because (a) spec ontology defines `AgentConversation`/`AgentMessage` with first-class tool-use that 2B′ would render as worker-internal FSM (leaky abstraction); (b) N=5 cap may truncate genuinely useful research (some listings need 7-9 fetches); raising N erases 2B′'s simplicity advantage; (c) abort-semantics gap in 2C is now closed by §D.M3.5; (d) complexity is concentrated in two well-tested files (<500 LOC each). **Follow-up F12 keeps 2B′ live as fallback** — if M3 prod-load shows 2C abort-semantics brittle in real Anthropic streaming behavior, the worker can swap to `executeFsmFallback()` with same input/output schema.

**Alt-3 — Managed transactional mail (Fork 3A — Resend EU / Mailgun-Frankfurt; NEW iter-2 steelman beyond Postmark).** Steelman: day-1 deliverability, zero warmup, instant DKIM, 3-week schedule compression, EU DPA + EU residency available (sidesteps US-sub-processor objection that iter-1 used to dismiss all 3A). Use-case is closer to "transactional triggered by user-active research" than "bulk cold outreach." Rejected for v1 because D9 + D11 are explicitly user-locked; user re-affirmed self-hosted in deep-interview; DDV/DD2 prefer no third-party processor by default. **BUT iter-2 §D.M5.0 abort criterion** inverts the irreversibility: Mail-Tester <8/10 after 28 days → automatic fallback to Resend/Mailgun-Frankfurt. So 3A is the falsification path for 3B.

**Alt-4 — Multi-LLM-Provider routing from day 1.** Non-goal (spec); deferred. `libs/integrations/llm/anthropic-client.ts` adapter makes future split possible without refactor.

**Alt-5 — Live-DOM scraping of Immometrica.** Non-goal (D6 locked); replaced by CSV/PDF export via Playwright auto-login.

**Alt-6 — Verwaltung-First (M1 before M2/M3).** Non-goal (D1 locked); user prioritizes acquisition.

### G.4 Why Chosen (iter-2 update)

- **Fork 1B (split process) + reversibility tripwire** is the right default for unknown load (M3 prod-deploy F7 will determine), AND the M6 step 6.5 tripwire keeps 1B′ alive as a 1-day refactor target if 1-week telemetry shows merge is safe.
- **Fork 2C (Hybrid) with §D.M3.5 abort semantics** satisfies both D4 (Claude One-Stop with tool-use) and D5 (per-run €-budget hard-stop). Iter-1's gap (under-specified abort) is closed; complexity is bounded to two well-tested files. Follow-up F12 keeps 2B′ FSM as fallback if 2C proves brittle.
- **Fork 3B (self-hosted) with §D.M5.0 abort criterion + deferred-tuning calendar** satisfies D9 + D11 + DD2 as the preferred default, but is now FALSIFIABLE: if warmup stalls, Resend EU or Mailgun-Frankfurt take over. The 3-week calendar tension architect raised (T1) is resolved by deferring M5.0 active tuning out of M2/M3 critical path.
- **`tenantId` FK constraint** upgrades AC-13 from naming convention to schema invariant (critic edit #5).
- **`libs/agent-tools/` location** (NOT `apps/api/src/modules/agent/tools/`) honors P2 — the worker, not the API, owns the tool execution code (critic edit #2 + architect P2 violation).
- **AC-5 split into AC-5a (M3) + AC-5b (M4)** matches the actual delivery sequence (KeyMetrics computable in M3; full cockpit only in M4) and removes false-closure of AC-5 in M3 (critic edit #4 + architect #5).
- **AC-3 manual-eval ≥80%/≥70%** lifted from roadmap into Done-when prevents the M3 sign-off from being passable on a merely-non-null DeepResearch object that may be wildly inaccurate (critic edit #3 + architect #6).
- **M0.5 portfolio read-only** bounds 10-week mock drift across the existing portfolio's Vue pages (architect soft-1).
- **M4.0 cap + freeze gate** prevents Excel reverse-engineering from ballooning silently (architect tension C).
- **Scoring-engine migration plan** (§D.M2 sub-section) removes the silent coexistence of `evaluatePhase1` and `computeCompositeScore` (architect tension D).

### G.5 Consequences (iter-2 update)

**Positive.**
- C+1: Adapter boundary (P1) — now ESLint + package-graph enforced — lets us swap Mietspiegel (D8) and proxy (D7) without touching `apps/api`.
- C+2: BullMQ + correlation-IDs + OTel give reproducible debugging.
- C+3: M4.0 (CAPPED) + property-based tests turn Excel-parity into a CI-enforceable invariant.
- C+4: M5.0 deferred-tuning calendar means M2/M3 attention is undivided; AC-9 measurement window starts at week 9-10 not week 1-3.
- C+5: Single Claude provider (D4) keeps prompt/tool/cost in one place.
- C+6: Schema-additive multi-tenant (D2) with FK constraint pivots cleanly to SaaS.
- **C+7 (NEW iter-2):** AC-5a/AC-5b split, AC-3 manual-eval, AC-13 FK, abort semantics — six previously-WEAK ACs are now unambiguously testable.
- **C+8 (NEW iter-2):** `libs/agent-tools/` location + 202+pollUrl contract honors P2 across the entire agent-tool-use surface.
- **C+9 (NEW iter-2):** M5.0 abort-to-managed-fallback path means warmup is a 28-day bounded effort, not an open-ended liability.

**Negative.**
- **C-1 (iter-2 update):** Two NestJS processes are slightly more ops than one — partially offset by Nx running them both, AND M6 step 6.5 tripwire keeps 1B′ merge alive if telemetry permits.
- **C-2 (iter-2 update):** Self-hosted mail puts ongoing IP-reputation work on the solo dev. Iter-1 paper-promised this could happen "parallel to M2/M3" — iter-2 is honest: active tuning is deferred to M5.1, AC-9 measurement at week 9-10, and the abort-to-managed-fallback path means we don't pay this cost forever if it doesn't yield ≥9/10.
- C-3: Hybrid agent topology requires team to know which queries cross phases (none) vs. must (Claude-loop within research) — documented in `libs/integrations/llm/README.md`.
- C-4: M4.0 reverse-engineering is a 1-week capped detour before functional work; can feel slow but eliminates Pre-Mortem B.3.
- **C-5 (iter-2 lower):** Scout-First means existing portfolio sat on mocks until M1 — **iter-2 M0.5 reduces this to 1 sprint of half-mocks (read-only live; write-paths still M1).**
- C-6: Single Claude provider means vendor risk; mitigated by adapter abstraction (R10).

### G.6 Follow-ups (iter-2 update — added F11, F12, F13, F14)

| ID | Question | Trigger / Deadline |
|---|---|---|
| F1 | Final Mietspiegel provider (Destatis-only vs. + F+B paid) | After M3 spike |
| F2 | Final residential-proxy provider (Bright Data vs. Oxylabs vs. IPRoyal) | First production block-event in M3 |
| F3 | OCR/Beleg-Klassifikation (deferred from M1, behind feature flag) | Post-M6, on user demand |
| F4 | Multi-Tenant code-pathway activation (tenant-guard interceptor) | At first SaaS customer signup |
| F5 | Mobile-Native (Ionic) — currently a non-goal | Post-MVP, on user demand |
| F6 | DSGVO juristic review of broker-outreach templates | BLOCKER for M5 launch — pre-M5.2 deadline |
| F7 | Hetzner VM sizing finalization (CCX13 vs. CCX23 vs. CCX33) | After M3 prod-deploy load-test |
| F8 | OpenTelemetry exporter target (local Tempo vs. Grafana Cloud) | Pre-M6 |
| F9 | Backup off-site target (Hetzner Storage Box vs. external S3) | Pre-M6 |
| F10 | Photo-Vision cache TTL + invalidation strategy | Post-M3 once cache hit-rate observable |
| **F11 (NEW iter-2)** | **1B → 1B′ merge** (BullMQ Worker inside API process) — evaluated against 1-week production telemetry per M6 step 6.5 tripwire | M6+1 week |
| **F12 (NEW iter-2)** | **2C → 2B′ FSM fallback** if production reveals streaming-token reconciliation brittle in §D.M3.5 abort path | M3+2 weeks of production traffic |
| **F13 (NEW iter-2)** | **M4.0 freeze fallback** — if Excel extract on day 1 reveals >60 named ranges, scope-down conversation with user (which tabs are MVP-required) | M4 day 1 (depending on extract result) |
| **F14 (NEW iter-2)** | **MinIO replication to second region** — currently deferred per Outstanding-Info row 9; reconsidered after first storage incident OR M6+3 months | Trigger-based |

---

## H) Open Questions (will be appended to `.omc/plans/open-questions.md`)

```
## realty79-scout-mvp-consensus-iter2 - 2026-04-26

- [ ] F1 Mietspiegel provider final (Destatis-only vs. +F+B) — Cost vs. lage-score accuracy tradeoff
- [ ] F2 Residential-proxy provider final (Bright Data vs. Oxylabs vs. IPRoyal) — Will surface at first production block in M3
- [ ] F6 DSGVO juristic review of broker-outreach templates — BLOCKER for M5 launch
- [ ] F7 Hetzner VM sizing (CCX13 / CCX23 / CCX33) — Determined by M3 prod load-test
- [ ] F8 OTel exporter target (local Tempo vs. Grafana Cloud) — Pre-M6 €/month decision
- [ ] F10 Photo-Vision cache TTL strategy — Post-M3 hit-rate observation
- [ ] F11 (iter-2 NEW) 1B → 1B′ merge after M6 telemetry — re-evaluation gate per M6 step 6.5 tripwire
- [ ] F12 (iter-2 NEW) 2C → 2B′ FSM fallback if streaming-token reconciliation proves brittle
- [ ] F13 (iter-2 NEW) M4.0 freeze fallback if Excel day-1 extract shows >60 named ranges
- [ ] F14 (iter-2 NEW) MinIO replication to second region — trigger: first storage incident
- [ ] Bestandsgröße quantifizieren (Property/Unit/Lease counts today) — Required for M1 sizing
- [ ] Score-Faktor-Defaults: 25/25/25/25 sane? — Calibrate empirically after first 50 hits
- [ ] Min-Score-Schwellen für Phase-2: empirical from first 50 hits — M3 spike
- [ ] Excel-Tab-Struktur expliziter Mapping — produced as M4.0 day-1 extract deliverable
- [ ] Choice between Resend EU and Mailgun-Frankfurt for §D.M5.0 fallback — set ENV `MAIL_FALLBACK_PROVIDER` ahead of M5 launch
```

---

## I) Plan Quality Self-Check (iter-2)

- [x] All 13 ACs (AC-1..AC-13, with AC-5 now split into AC-5a/AC-5b) mapped to test names in §C and re-tabulated in § AC Matrix — every row unambiguously testable
- [x] Every milestone names concrete file paths (absolute or repo-relative)
- [x] Every milestone names BullMQ workers + queue names
- [x] Every milestone lists Vue page mock-removal explicitly (M0.5 added; M2 SearchPage; M3 PropertyDetail; M5 messaging; M1 the rest)
- [x] Every milestone lists first 3 PR-sized git commits (carried forward from iter 1, unchanged)
- [x] Pre-Mortem covers 3 mandatory scenarios (B.1, B.2, B.3) with trigger / blast / mitigation / detection
- [x] Test plan is quad-coverage (unit / integration / e2e / observability) PLUS a manual-eval layer (C.4) with libraries + suites + AC mapping
- [x] ADR present with Decision / Drivers / Alternatives (all 3 forks have iter-2 expanded steelmen) / Why / Consequences / Follow-ups
- [x] All locked decisions D1-D13 honored; non-goals respected; M5.0 abort path is "preferred-but-falsifiable" not "override"
- [x] No new capabilities invented outside spec scope
- [x] Risks Table has 15 entries with detection signals on **every row** (R3, R4, R7, R11, R14 newly detection-specified per critic edit #6)
- [x] Verification step per milestone with exact Nx command (M0.5 added)
- [x] Open Questions appended to global tracker (F11–F14 added)
- [x] **Iter-2 surgical edits all landed:** §D.M3.5 abort semantics; `libs/agent-tools/` relocation + 202+pollUrl; AC-3 manual-eval; AC-5a/5b split; FK constraint; M5.0 abort criterion; F1+F2 expanded steelmen
- [x] **Iter-2 architect tensions all addressed:** T1 calendar A.4; T3 ESLint exact rule + per-lib package.json scoping; T4 M4.0 cap + freeze gate; T5 M0.5 portfolio read-only; scoring-engine migration §D.M2

---

**End of plan iter-2 — ready for Architect review (round 2) and Critic review (round 2).**
