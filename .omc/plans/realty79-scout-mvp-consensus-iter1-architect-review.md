# Architect Review — Realty79 Scout-MVP Consensus Plan, Iteration 1

**Reviewer Stage:** Architect (RALPLAN-DR Deliberate Mode)
**Plan under review:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1.md`
**Spec:** `/opt/realty79-real-estate-naviagator/.omc/specs/deep-interview-realty79-scout-mvp.md`
**Roadmap:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-roadmap.md`
**Date:** 2026-04-26

---

## 1. Steelman Antithesis (per Architecture Fork)

### Fork 1 — Browser-Worker Placement (Planner chose 1B: Dedicated NestJS worker)

**Strongest case for the rejected alternative (1A — In-process Playwright):**
For a *solo dev on a single Hetzner CCX13*, Option 1A is genuinely defensible. The plan claims P2 forbids long-running I/O in the API, but P2 is itself a self-imposed principle, not a binding constraint. With a docker-compose stack that already runs Postgres :5433, Redis :6380, and the API on the same VM, adding a *second* NestJS bootstrap doubles the memory floor (Node baseline ~120MB × 2 = ~240MB), doubles the deploy surface, doubles the log streams to multiplex, and forces the dev to remember which queue is consumed where. BullMQ's `Worker` class can run *inside* the API process bound to a dedicated queue with `concurrency: 1` and a separate connection pool, which gives 80% of the isolation benefit (independent retry, separate Redis connection, async job model) at 0% of the dual-process ops cost. The argument "1 Playwright crash = whole API down" is real but mitigated by `process.on('uncaughtException')` + Playwright `browser.close()` finally-blocks; Playwright crashes are rare in stealth-headless mode once the fingerprint is stable.

**What the Planner's invalidation rationale missed:**
The plan invokes "Hetzner CCX13 sizing assumption" but Outstanding-Info row 9 explicitly leaves VM sizing open until M3 prod-deploy load-test (Follow-up F7). So the sizing argument is circular — the plan justifies splitting based on a sizing assumption that the plan itself defers. C-1 (Negative Consequence "two processes are slightly more ops") understates the operational reality: two processes on Docker Compose mean two health-check endpoints, two Sentry releases, two log streams in Loki, two restart policies, and double the surface for "did I deploy the worker too?" mistakes that are common for solo devs on Sunday evenings.

**Does it change the recommendation?**
No, but it *strengthens the requirement to articulate a tripwire*: the plan should commit to a "merge `apps/worker` back into `apps/api` if memory <512MB or if a single-process variant survives 1 week of M3 load tests" branch, so that the split is reversible. Currently the split is treated as locked architecture; for a solo dev, irreversibility is the real risk. Recommendation: keep 1B but add a "reversibility test" to M6.

### Fork 2 — LLM Orchestration Topology (Planner chose 2C: Hybrid)

**Strongest case for the rejected alternative (2B — Pure staged pipeline):**
The Planner argues 2B is "too rigid" because Claude needs to fetch 1-N pages and decide when satisfied. But this *understates* how well structured outputs + a finite-state-machine in the worker can replicate that flexibility deterministically. Concretely: a `listing-detail-research` worker can call Claude *non-agentically* with `tools: []` and a structured-output schema {`needsMorePages: bool`, `nextUrls: string[]`, `vision: SchemaA`, `done: bool`}, loop deterministically up to N=5 fetches, and never give Claude tool-execution authority. This kills the entire `BudgetSupervisor`-as-mid-loop-interrupt complexity (which is the most fragile piece in M3), kills the `agent-tool-use-loop.ts` failure modes where Claude calls a tool, the tool throws, and the loop now has to decide whether to re-prompt Claude or abort. Pure 2B is dramatically easier to reason about, easier to budget, and easier to test (each call is an isolated request/response). The conversational UX in `pages/chat/ChatPage.vue` can still exist — it's just rendered from `AgentMessage` rows produced by the deterministic loop, not by Claude itself driving tool calls.

**What the Planner's invalidation rationale missed:**
2C's "BudgetSupervisor with Redis INCRBY mid-tool-call" is genuinely hard: Anthropic's streaming API doesn't let you abort cleanly mid-tool-call without partial token charges, and the cost-tracker has to debit *predicted* tokens before the response completes to enforce a hard-stop. This is a known failure mode in production tool-use systems. Going 2B sidesteps this entirely — budget is enforced *between* worker invocations where it's trivial.

**Does it change the recommendation?**
Partially. 2C is still defensible because the spec's `AgentConversation`/`AgentMessage` ontology genuinely models tool-use, and the user wanted "Claude One-Stop" (D4) with tool flexibility. But the steelman exposes that the *implementation cost* of 2C is concentrated in `tool-use-loop.ts` and `BudgetSupervisor` mid-loop interrupt — the two riskiest files in M3. Recommendation: keep 2C but require Iteration 2 to specify the *exact abort semantics* of the mid-loop budget cap (does it set a flag and let the current tool finish? Does it throw? What happens to half-completed `PropertyPhoto.visionAnalysis` writes?). This needs to be in the plan, not in the implementer's head.

### Fork 3 — Mail-Stack (Planner chose 3B: Self-hosted Postfix)

**Strongest case for the rejected alternative (3A — Managed transactional + OAuth-IMAP):**
The plan dismisses 3A by quoting Postmark's TOS prohibiting cold outreach. This is an *incomplete* read. Postmark forbids unsolicited bulk mail; *transactional* messages tied to a SavedSearch the user explicitly created (autonomy L3 opt-in, hard-cap N=10/day, score ≥70) are arguably transactional, not bulk cold outreach — they're triggered by a property the user is actively researching. **Resend** explicitly supports this use case, and **Mailgun** has tiered "broadcast" plans for moderate-volume B2B outreach. Day-1 deliverability would let M5 ship in week 5 instead of week 8, compressing the calendar by 3 weeks. The DSGVO sub-processor argument is real but solvable with a DPA + EU-region (Mailgun has Frankfurt; Resend has EU endpoint).

**What the Planner's invalidation rationale missed:**
The plan treats D9 ("Self-hosted SMTP") as locked and uses that to dismiss 3A. But locked decisions can be challenged in consensus review if the underlying assumption is shaky. The deeper question: *does the user actually have the operational appetite for ongoing IP-reputation work?* C-2 ("Self-hosted mail puts ongoing IP-reputation work on the solo dev — daily blocklist-check cron + DMARC RUA monitoring become permanent operational burdens") admits the cost. For a solo dev whose primary job is property analysis, *this is operational debt that compounds*. The honest tradeoff is: 3-week schedule compression + zero ongoing reputation work, vs. €0/mo SMTP + DSGVO purity + 2-4wk warmup + permanent operational burden.

**Does it change the recommendation?**
The decision is locked by D9 and the planner cannot override it. But the steelman should be visible to the user *before* M5.0 starts, because pre-mortem B.2 ("SMTP reputation dies during M5 launch") has the highest blast radius of the three pre-mortems and is the only one where the rejected alternative (3A) would have eliminated the failure mode entirely. **Recommendation: add an explicit "M5.0 abort criteria" — if Mail-Tester score is <8/10 after 4 weeks of warmup, fall back to a managed provider with a DPA, accept the DSGVO trade.** Without an abort criteria, the plan is at risk of warmup-drag-on (warmup that "almost works" but never crosses 9/10 because of some misconfigured PTR record).

---

## 2. Tradeoff Tensions

### T1 (Most Important) — The 2-process split + 2-4wk SMTP warmup parallel to M2/M3 is a solo-dev attention-bandwidth trap

The plan claims M5.0 SMTP warmup runs "parallel to M2/M3" (D9, plan section M5.0). But warmup is not zero-touch: Hetzner reverse-DNS support tickets require human follow-up; DNS TXT typos are common; Postfix `main.cf` tuning needs feedback from the warmup mail-tester runs. Empirically, 2-4 weeks of warmup with daily tweaks is a half-day-per-day attention cost — *exactly when M2/M3 hits its hardest engineering problems* (Immometrica login flow brittleness, Claude tool-use loop budget enforcement, Vision schema validation). The plan acknowledges the workload (C-2) but underestimates the *competing-attention* cost. A solo dev hitting an Immometrica block in M2 week 2 will not also be tweaking Postfix `master.cf` — one will be neglected.

**The honest tradeoff:** Either delay M5.0 start to M3 completion (M5 ships week 11 instead of week 8 — 3 weeks delay), OR accept that warmup will be sloppy and AC-9 (Mail-Tester ≥9/10) will slip. The current plan papers over this by saying "parallel."

### T2 — `cashflow-recompute` as a separate worker is over-engineered

`cashflow-recompute` is a deterministic, in-memory NumPy-equivalent computation over `Scenario` rows. Pushing it through BullMQ adds Redis serialization overhead, a separate failure surface, retry semantics that don't really apply (a recompute either works or has a code bug — retry doesn't help), and indirection for the Vue UI when the user clicks "edit assumptions" and expects an immediate KPI update. **A direct in-process service called from `ScenarioController.PATCH` would be simpler** — return KeyMetrics in the response. The plan should justify why this needs to be a worker rather than a service, especially since `cashflow-recompute` is also called for the `nightly-parity-drift` job (which legitimately is a worker). The tension is: same logic surfaces both as request-time and as cron-time. Recommendation: put the calc itself in `libs/shared/src/utils/`, expose it both ways — keep a *thin* worker only for the nightly drift job and Scenario-version-bump fan-out.

### T3 — ESLint boundary rule is gatekeeping, not enforcement

The plan repeatedly cites P1 ("ESLint-enforced adapter boundary") as the mechanism that makes adapter swaps safe. But Nx `@nx/enforce-module-boundaries` is *opt-in at lint time*. A new file in `apps/api/src/modules/agent/tools/fetch-listing.tool.ts` that calls `import { chromium } from 'playwright'` directly will lint-fail in CI, but if a dev does `// eslint-disable-next-line` (and AI agents do this routinely under deadline pressure), the boundary evaporates. The plan needs a *runtime* boundary (e.g., the API process doesn't have `playwright` in its `package.json` at all — it's only a dep of `apps/worker` and `libs/integrations/scraper`). Currently the plan adds `@playwright/test` and `playwright-extra` to the root `package.json` (M0 EDIT row), which means every app pulls them transitively. **Recommendation: scope adapter deps to the integration libs' own `project.json` peer-deps, not the root.**

### T4 — M4.0 Reverse-Engineering is a hidden dependency that can balloon

Excel cockpit templates of this sort routinely have 50-100 named ranges, 20+ defined names, and cross-tab volatile formulas (INDIRECT, OFFSET) that don't trivially serialize to JSON fixtures. The plan allocates one sprint for M4.0 and produces 5 fixtures. If the Excel has *more* than 5 logically distinct calculation modes, the parity-suite will have blind spots — exactly the failure mode of Pre-Mortem B.3. **Recommendation: in iteration 2, run `scripts/excel-extract.ts` *first*, count the actual named cells and tab count, and only then commit to "5 fixtures suffice." Currently this is a guess.**

### T5 — Scout-First means M1 (Verwaltung) sits on mocks for ~10 weeks

The plan acknowledges this in C-5 ("Scout-First means the existing portfolio sits on mocks until M1 ~week 10"). But the user has a *real* existing portfolio (Outstanding-Info row 1 — Bestandsgröße to be quantified). The longer mocks live, the more drift accumulates between Vue page expectations and Prisma reality. By M1, the Vue components in `pages/portfolio/`, `pages/renters/`, `pages/maintenance/` may have been touched in M2-M5 to add Scout-related navigation, and the mock data shape will have diverged from what the real API returns. **Recommendation: a single-sprint M0.5 — wire the Vue pages to a `read-only` slice of the real API for the existing portfolio in week 2, even if write-paths come in M1. This bounds drift.**

---

## 3. Principle Violations (Deliberate Mode — Required)

**P1: External I/O behind adapter in `libs/integrations/<vendor>/`.** **Violation flagged (minor):** M3 plan adds `~/apps/api/src/modules/agent/tools/fetch-listing.tool.ts` which the description says "wraps `libs/integrations/scraper`". The wrapping itself is correct, but the *file location* (`apps/api/src/modules/agent/tools/`) puts adapter consumers in the API app — and per Fork 1B these tools are invoked by the worker, not the API. The agent-tool files should live in `apps/worker/src/agent-tools/` or in a shared lib `libs/agent-tools/`. **Severity: low (refactor, not architectural).**

**P2: BullMQ workers own all long-running and risky I/O.** **Violation flagged (medium):** The plan in M3 puts `agent.module.ts` exposing `POST /agent/conversations/:id/messages` in `apps/api`. If this endpoint synchronously triggers a Claude tool-use loop (which the description suggests), the API request handler owns long-running I/O — direct violation of P2. The plan should specify that POST `/agent/conversations/:id/messages` enqueues to a BullMQ queue and returns 202 + a poll URL, with the actual loop running on the worker. **Severity: medium — needs explicit API/worker contract.**

**P3: Vue is single source of truth; mocks deleted milestone-by-milestone.** **No violation.** The plan tracks mock removal per milestone (M2 drops `mockSearchProperties.ts`, M3 drops `mockProperties.ts`-PropertyDetail-portion, M1 deletes the files). Consistent with P3.

**P4: Schema-additive only; multi-tenant prepared.** **Violation flagged (low):** Plan M2 migration adds `tenantId String? @default("default")` — but `Tenant` table already exists with rows; the foreign-key constraint should reference `Tenant(id)`. The plan does not specify FK; it specifies just the column. Without FK, "default" string is a magic value with no enforcement. **Severity: low — add FK in iteration 2.**

**P5: Cost & reputation are first-class metrics.** **No violation.** ScrapeLog.tokenCostEur and proxyCostEur are added in M2; mailer.reputation.score is gauged in M5; Mail-Tester is gating in AC-9. Consistent.

---

## 4. AC Coverage Audit

| AC | Test/Verification in Plan | Concrete Measurement | Milestone | Status |
|----|---------------------------|----------------------|-----------|--------|
| AC-1 | `saved-search.e2e-spec.ts` + `immometrica-poll.int-spec.ts` | "≥1 hit within 24h" via hourly cron | M2 | **OK** |
| AC-2 | `scoring-engine.spec.ts` (extended) + `pipeline.int-spec.ts` | "compositeScore = 25/25/25/25 weighted average" | M2 | **OK** |
| AC-3 | `listing-detail-research.int-spec.ts` + `property-detail.spec.ts` | "all 4 score fields !=null"; no concrete % accuracy threshold | M3 | **PARTIAL — accuracy threshold is in roadmap (≥80% lokalisierungen, ≥70% Zustandseinschätzungen) but not lifted into the consensus plan's AC-3 test** |
| AC-4 | `vision.service.spec.ts` + `photo-vision.int-spec.ts` | "5 PropertyPhoto.visionAnalysis JSON, all confidence ≥0.5" | M3 | **OK** |
| AC-5 | `scenario-create-recompute.int-spec.ts` | "creates Scenario triggers cashflow-recompute" — does NOT verify "30y projection visible in Vue cockpit" per spec wording | M3 (declares closed) / M4 (full UI) | **WEAK — AC-5 says "Werte sichtbar im Vue-Cockpit"; M3 has only `CashflowMiniCockpit`, full visibility is in M4. AC-5 should be split into AC-5a (compute) closed in M3 and AC-5b (Vue cockpit visibility) closed in M4** |
| AC-6 | `budget-cap.int-spec.ts` + `budget-cap.e2e-spec.ts` | "runBudgetEur=0.05 stops mid-loop with status=budget_exceeded" | M3 | **OK** |
| AC-7 | `immocation-calculator.parity.spec.ts` | "5 fixtures × 30 KPIs × 30y ≤ 0.01€" | M4 | **OK** |
| AC-8 | `cockpit-cashflow.spec.ts` + `sensitivity-table.spec.ts` | "5×5 grid for ±2%/±5%; 4 tabs navigable" | M4 | **OK** |
| AC-9 | `reputation-check.ts` + Mail-Tester manual | "≥9/10 Mail-Tester score after warmup" | M5 | **OK but no abort criteria if score stalls at 8** |
| AC-10 | `reply-classifier.spec.ts` + `mail-inbound-classify.int-spec.ts` | "≥90% on 50 test mails" | M5 | **OK** |
| AC-11 | CI badge; `pnpm nx affected -t lint test build typecheck` | binary green/red on PR | M0+ | **OK** |
| AC-12 | E2E suites per milestone | one happy-path each | M0–M6 | **OK** |
| AC-13 | `tenant-scope.int-spec.ts` + ESLint + migration template | "every new table has tenantId String? @index" | M0+ (tracked through M6) | **OK with caveat — see P4 violation: FK constraint not specified** |

**Gaps to fix in iteration 2:** AC-3 needs the accuracy threshold (lokalisierungen ≥80%, Zustandseinschätzungen ≥70%) elevated from the roadmap into the consensus plan as a measurable test. AC-5 needs to split into AC-5a (M3 compute) + AC-5b (M4 Vue visibility), or M3-Done-When should be marked partial for AC-5 and final closure assigned to M4.

---

## 5. Brownfield-Reality Audit

**Prisma additive migrations:** Verified against `/opt/realty79-real-estate-naviagator/prisma/schema.prisma`. The plan correctly notes Property at L13, Analysis at L85, DeepResearch at L113, etc. (matches my line-by-line confirmation). **`MailMessage` does not yet exist** — plan correctly creates it as new in M5 migration. **No violation of additive-only.** However, the M3 migration declares `ALTER TABLE "PropertyPhoto" ADD COLUMN "visionAnalysis" JSONB` — verify this column doesn't already exist before iteration 2 commits (the spec says it does, the plan says it might already exist with conditional `IF NOT EXISTS`). **Low risk; conditional is correct mitigation.**

**Stub paths touched:** Verified `apps/api/src/modules/{property,analysis,pipeline,config,scraper,research,vision,agent,...}` directories all exist. The plan correctly EDITs these; **no path errors found**. Note: the plan path `~/apps/api/src/scout/{scraper,research,vision}` from the user's review prompt is *not* the actual repo layout — actual is `apps/api/src/modules/{scraper,research,vision}`. **Plan correctly uses `apps/api/src/modules/...` everywhere; no Brownfield error in the plan, but the user's review-prompt phrasing was inaccurate.**

**Conflict between existing `libs/shared/src/utils/scoring-engine.ts` and new Phase-1 score code:** Existing scoring-engine exports `evaluatePhase1`, `evaluatePhase2`, `calculateOverallScore` (verified at file lines 38, 90, 134). Plan M2 says "extend with `computeCompositeScore(property, weights, marketMedian)`" — this is *additive*, not a replacement, so no conflict. **However**, the plan does not specify whether `computeCompositeScore` *replaces* the role of `evaluatePhase1` or runs alongside it. AC-2 mentions 4 factors with 25/25/25/25 default weights, which the existing `evaluatePhase1` does not implement that way. **Recommendation: iteration 2 should explicitly say `evaluatePhase1` is deprecated/repurposed/superseded by `computeCompositeScore`, with a deprecation note. Otherwise both functions will live on and confuse implementers.**

**Vue route mock-removal mapping:**
- `pages/search/SearchPage.vue` drops `mockSearchProperties` in M2 — verified file exists.
- `pages/properties/PropertyListPage.vue` drops `mockProperties` in M2 — verified.
- `pages/properties/PropertyDetailPage.vue` drops mocks in M3 — verified file exists.
- `pages/portfolio/`, `pages/renters/`, `pages/maintenance/`, `pages/accounting/` mock-removal in M1 — verified directories exist.
- `data/mockProperties.ts` and `data/mockSearchProperties.ts` deletion in M1 — verified files exist.

**One mismatch:** The plan's Brownfield Truth Table row 5 says "Vue uses `pages/`, NOT `views/`" — verified correct (`apps/web-vue/src/pages/` exists; no `views/` directory). The original roadmap (line 54) says "`apps/web-vue/src/views/Search.vue`" which is **wrong**. The plan correctly catches this and uses `pages/`. Good catch.

---

## 6. Synthesis Path

**For T2 (cashflow-recompute as worker vs. service):** Synthesis exists. Put the computation in `libs/shared/src/utils/immocation-calculator.ts` (already there) + a new `libs/shared/src/utils/scenario-recompute.ts` that's a pure function. Expose it both ways: `ScenarioController.PATCH` calls it directly and returns updated KeyMetrics in the response (sub-50ms — fits P2 because no external I/O); `nightly-parity-drift.processor.ts` and `cashflow-recompute.processor.ts` (only used for `calculatorVersion` bumps fan-out across all Scenarios) call the same pure function. This honors P2 (worker for cron-time fan-out) AND avoids over-engineering for the request-time path.

**For T1 (warmup attention bandwidth):** Synthesis: tightly scope M5.0 to *only* the IP+DNS+DKIM/DMARC/SPF setup in M0 week 1 (one-shot, ~6 hours total), then run a *passive* warmup script (`mailwarm`-style cron sending to a seeded mailbox, no human intervention required). Defer template engineering, blocklist-check tuning, and reputation-check.ts implementation to M5.1 sprint. This compresses the human-in-the-loop part of M5.0 into 1 day, and the rest is genuinely passive.

**For T3 (ESLint vs. runtime boundary):** Synthesis: combine ESLint (lint-time) with package-scoped deps (runtime). Move `playwright-extra`, `puppeteer-extra-plugin-stealth`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow` from root `package.json` into the respective integration lib's `package.json` (Nx supports per-lib deps via `project.json` and `package.json` per project). API package then physically *cannot* import them.

---

## 7. Verdict

**APPROVED-WITH-IMPROVEMENTS**

The plan is architecturally sound, brownfield-accurate, AC-traced, and honors all 13 locked decisions. The Pre-Mortem coverage is excellent and the file-path-level concreteness is unusually strong. However, 7 concrete improvements should land in iteration 2:

1. **Specify mid-loop budget abort semantics** for `tool-use-loop.ts` — what happens to half-completed `PropertyPhoto.visionAnalysis` writes? Add abort-spec to plan section D-M3.
2. **Move agent-tool files** (`fetch-listing.tool.ts` etc.) out of `apps/api/src/modules/agent/tools/` into `apps/worker/src/agent-tools/` or `libs/agent-tools/` to honor P2 (current location violates the API/worker split).
3. **Specify async contract** for `POST /agent/conversations/:id/messages` — must enqueue + return 202 + poll URL, not run the tool-use loop synchronously.
4. **Add FK constraint** on `tenantId String?` columns referencing `Tenant(id)` in all M2/M3/M5 migrations — currently only the column is specified.
5. **Split AC-5** into AC-5a (M3 compute, KeyMetrics non-null) and AC-5b (M4 Vue cockpit visibility), since M3 alone cannot close AC-5 per spec wording.
6. **Lift AC-3 accuracy thresholds** from roadmap (≥80% lokalisierungen, ≥70% Zustandseinschätzungen) into the consensus plan as a manual-eval test deliverable in M3.
7. **Add M5.0 abort criteria** — if Mail-Tester <8/10 after 4 weeks of warmup, fall back to managed provider with DPA. Without this, warmup can drag indefinitely.

Plus three softer-but-high-value recommendations:
- Add a "M0.5 portfolio read-only wiring" half-sprint to bound mock drift during the 10-week Scout-First window (T5).
- Move `cashflow-recompute` request-time path out of BullMQ into a direct service call; keep worker only for cron + version-bump fan-out (T2 synthesis).
- Move adapter deps from root `package.json` into per-lib `project.json` for runtime boundary enforcement (T3 synthesis).

The plan is ready to proceed to Critic review after these improvements are merged. None of the issues block — they are all refinements of an already-strong plan.
