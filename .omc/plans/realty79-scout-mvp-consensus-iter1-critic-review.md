# Critic Review — Realty79 Scout-MVP Consensus Plan, Iteration 1

**Stage:** Critic (RALPLAN-DR Deliberate Mode)
**Plan:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1.md`
**Architect:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-architect-review.md`
**Spec:** `/opt/realty79-real-estate-naviagator/.omc/specs/deep-interview-realty79-scout-mvp.md`
**Roadmap:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-roadmap.md`
**Date:** 2026-04-26
**Review Mode:** Started in THOROUGH; escalated to ADVERSARIAL after 4+ MAJOR findings surfaced (see §9).

---

## 1. Principle-Option Consistency

| Fork | Option | Principle the Option claims to serve | Honest verdict |
|---|---|---|---|
| F1 | 1B (`apps/worker`) | P2 (workers own I/O), P1 (adapters), Hetzner sizing | **Pass with reservation.** 1B genuinely serves P2. Reservation: the *invalidation rationale* for 1A leans on a sizing argument the plan itself defers (Outstanding-Info row 9, F7 — VM sizing finalized only after M3 prod-deploy load-test). The Architect flagged this; Planner did not address. The principle is consistent, but the rejection rationale is partially circular. |
| F2 | 2C (Hybrid) | D4 (Claude One-Stop), D5 (per-run €-cap) | **Internally inconsistent.** 2C concentrates the implementation cost in `tool-use-loop.ts` + `BudgetSupervisor` mid-loop interrupt. The plan promises a "hard-stop" at line 386/418 but does not specify *abort semantics* — what happens to a Claude tool-call that is mid-flight when budget is exceeded? Does it cancel the streaming response (partial tokens still billed)? Does it let the current tool finish? Does it write or discard partial `PropertyPhoto.visionAnalysis`? Architect raised this in improvement #1. Without explicit abort semantics, D5 is aspirational, not enforced — and that breaks AC-6 testability. |
| F3 | 3B (Postfix self-hosted) | D9, D11, DD2 (DSGVO) | **Pass.** Locked decision; Planner respected it. Caveat: AC-9 has no abort criterion if Mail-Tester stalls at 8/10 (Architect improvement #7). |

**Verdict: 2C is consistent in intent but under-specified in implementation. Without abort semantics, the principle of "predictable cost" (DD3) is not actually enforced.**

---

## 2. Fair Alternative Exploration

| Fork | Steelman quality | Invalidation rationale quality | Missed alternative? |
|---|---|---|---|
| F1 (1A in-process) | Plan: 2 lines. Architect's steelman: 7 lines, named `process.on('uncaughtException')` + BullMQ-Worker-in-API as middle-ground. **Plan steelman is shallow.** | Cites P2 (self-imposed) and Hetzner sizing (deferred to F7). Partially circular. | **Yes.** Architect surfaced "BullMQ Worker class inside API process with concurrency:1 + dedicated Redis connection" — a viable 1.5th option (80% isolation at 0% dual-process cost). Planner did not consider this. |
| F2 (2B pure pipeline) | Plan: 1 line ("too rigid"). Architect's steelman: shows that structured-output FSM with `{needsMorePages, nextUrls, vision, done}` replicates flexibility deterministically. **Plan steelman is a strawman.** | "Pure pipeline can't decide when satisfied" — directly refuted by the Architect's deterministic-loop counter-example. | **Yes.** A non-agentic Claude call with `tools: []` and an FSM loop in the worker would eliminate the entire `BudgetSupervisor`-mid-loop-interrupt complexity. Planner did not steelman this. |
| F3 (3A Postmark) | Plan: cites TOS only. Architect notes Postmark forbids *bulk* not *transactional*; the SavedSearch-triggered, opt-in, hard-capped flow is closer to transactional. | Plan invalidates with "D9 locked"—correct but circular for steelman purposes. | **Yes.** Resend (EU endpoint) and Mailgun-Frankfurt (DPA + EU region) sidestep the DSGVO objection entirely. Planner conflated all managed providers with Postmark. |

**Verdict: REJECT this section's quality.** F1 and F2 use shallow steelmen that the Architect refuted with concrete counter-arguments. F3's invalidation is partly self-referential. Per Deliberate-Mode rules (§Constraints, §Failure-Modes), this alone warrants ITERATE.

---

## 3. Risk Mitigation Clarity

Risks Table (§E, lines 679-696). Audit per row:

| ID | Mitigation specificity | Detection signal | Verdict |
|---|---|---|---|
| R1 Immometrica block | Concrete (stealth + Bright Data + manual-CSV endpoint) | `immometrica_poll_blocked_total` counter, Pino log `event="immometrica.session.blocked"`, threshold ≥3/24h | **OK** |
| R2 LLM cost overrun | `BudgetSupervisor` Redis INCRBY, hard-stop at `runBudgetEur` | `cost.tokenEur.per_run` histogram, Sentry rule on `anthropic.budget.exceeded` | **WEAK** — abort semantics undefined (§1 above). |
| R3 Vision hallucinations | Zod schema with `confidence`, fallback "needs human review" if <0.5 | None named — what triggers the fallback in code? Where is it logged? | **WEAK — no detection signal.** |
| R4 Browser blocking | block-detector heuristics, Bright Data fallback | Implicit in R1 metric? Not explicitly named. | **WEAK — detection signal not separated from R1.** |
| R5 SMTP IP flagged | Hetzner static IP + reverse-DNS + warmup + blocklist-check | `mailer.reputation.score` gauge, alert on ≤7, bounce rate >5% Telegram | **OK** |
| R6 Excel parity drift | M4.0 fixtures + property-based + nightly cron | `calculator.parity.maxDrift_eur` gauge | **OK** |
| R7 DSGVO violation | Opt-out footer, juristisch-geprüfte Templates | None — no metric, no alarm. F6 is a deadline gate, not a detection signal. | **WEAK — no runtime detection.** |
| R8 Postgres data loss | pgBackRest daily + 4h incr + S3 off-site + restore-runbook | None — no automated restore-test cadence; "tested in dry-run" is one-shot, not continuous. | **WEAK — no continuous detection.** |
| R9 Solo dev burnout | OMC AI agents, 1-week sprints | None — no metric. | **MINOR (process risk, accept).** |
| R10 Anthropic SDK breaking change | Adapter gating + ENV pin | None — no version-deprecation watcher. | **MINOR.** |
| R11 Hetzner VM crash | restart-on-failure, pgBackRest, MinIO replication deferred | None named; "MinIO replicated to second region (deferred)" makes R11 partly unmitigated. | **WEAK — partly deferred.** |
| R12 Mock drift | Milestone-by-milestone removal + ESLint `no-restricted-imports` from M1 | "from M1 onward" — but Scout-First means M1 is week ~10. Drift can accumulate before then. | **MAJOR — see §8 / Architect T5.** |
| R13 tenantId plumbing forgotten | ESLint + migration template + integration test | `tenant-scope.int-spec.ts` regression | **OK** |
| R14 Extractor drift | Centralized selectors, frozen HTML fixtures, nightly smoke-crawl | "nightly smoke-test crawl 1 known listing" — not a metric, not an alarm; what fails the test? | **WEAK — verification is binary but not measured.** |
| R15 Disk fills | Ephemeral `/tmp` purge + cron `find -mtime +1 -delete` | None — no disk-usage gauge. | **MINOR.** |

**Verdict: 6 of 15 risk rows have weak or missing detection signals.** Per Deliberate-Mode, this is grounds for ITERATE on §E.

---

## 4. Acceptance Criteria Testability

| AC | Test name/path (in plan) | Measurement | Runnable? | Verdict |
|---|---|---|---|---|
| AC-1 | `apps/api-e2e/src/api/saved-search.e2e-spec.ts` + `immometrica-poll.int-spec.ts` | "≥1 hit within 24h" via hourly cron | Yes (fixture: `libs/integrations/immometrica/fixtures/sample-export.csv`) | **OK** |
| AC-2 | `libs/shared/.../scoring-engine.spec.ts` (extended) + `pipeline.int-spec.ts` | "compositeScore = 25/25/25/25 weighted average" | Yes | **OK** |
| AC-3 | `listing-detail-research.int-spec.ts` + `property-detail.spec.ts` | "all 4 score fields !=null"; **NO accuracy %** | Partial | **WEAK — spec roadmap line 184 demands ≥80% lokalisierungen, ≥70% Zustandseinschätzungen on 10 manually verified properties; this human-eval test is missing from the plan.** Architect improvement #6 flagged this. |
| AC-4 | `vision.service.spec.ts` + `photo-vision.int-spec.ts` | "5 PropertyPhoto.visionAnalysis JSON, all confidence ≥0.5" | Yes | **OK** |
| AC-5 | `scenario-create-recompute.int-spec.ts` | "creates Scenario triggers cashflow-recompute" | Partial | **WEAK** — spec AC-5 says "Werte sichtbar im Vue-Cockpit"; M3 has only `CashflowMiniCockpit` (line 425). Full cockpit is M4. M3 cannot close AC-5. Plan claims it does at line 445. Architect improvement #5 flagged this. |
| AC-6 | `budget-cap.int-spec.ts` + `budget-cap.e2e-spec.ts` | "runBudgetEur=0.05 stops mid-loop with status=budget_exceeded" | Yes — but **abort semantics under-specified** (§1 above). The test cannot be written deterministically without specifying whether the in-flight tool-call's tokens count, whether partial JSON is persisted, etc. | **WEAK** |
| AC-7 | `immocation-calculator.parity.spec.ts` | "5 fixtures × 30 KPIs × 30y ≤ 0.01€" | Yes | **OK** |
| AC-8 | `cockpit-cashflow.spec.ts` + `sensitivity-table.spec.ts` | "5×5 grid for ±2%/±5%; 4 tabs navigable" | Yes | **OK** |
| AC-9 | `reputation-check.ts` + Mail-Tester manual | "≥9/10 Mail-Tester after warmup" | Manual, not CI | **WEAK — no abort criterion if score stalls at 8/10.** Architect improvement #7. |
| AC-10 | `reply-classifier.spec.ts` + `mail-inbound-classify.int-spec.ts` | "≥90% on 50 test mails" | Yes — but the 50-mail test corpus is not described. Where do they live? Anonymized? Versioned? | **MINOR-leaning-WEAK** |
| AC-11 | CI badge + `pnpm nx affected -t lint test build typecheck` | binary green | Yes | **OK** |
| AC-12 | E2E suites per milestone | one happy-path each | Yes | **OK** |
| AC-13 | `tenant-scope.int-spec.ts` + ESLint + migration template | "tenantId on every new table" | Yes — but **FK constraint missing** (Architect P4 violation). `tenantId String? @default("default")` without `@relation` to `Tenant.id` makes "default" a magic string. | **WEAK** |

**Summary: 6 ACs are WEAK (AC-3, AC-5, AC-6, AC-9, AC-10, AC-13).** Per Deliberate-Mode, multiple WEAK ACs gate ITERATE. The most damaging is AC-6 — the entire budget-cap principle (D5) hinges on it being deterministically testable, which abort-semantics gaps prevent.

---

## 5. Concrete Verification Steps

§F lines 701-709. Per-milestone audit:

| Milestone | Nx command | Manual smoke | Observability | Verdict |
|---|---|---|---|---|
| M0 | `pnpm nx affected -t lint test build typecheck e2e` — exact | Concrete (register→login→dashboard, curl, bull-board, Sentry test error) | Pino + Jaeger trace | **OK** |
| M2 | `pnpm nx run-many -t test --projects=api,worker,shared,immometrica,scraper && pnpm nx e2e api-e2e --grep saved-search` — exact | "create SavedSearch → wait 1h cron OR `POST /:id/run`" — concrete | counter + queue drained | **OK** |
| M3 | `--grep '(research\|vision\|budget)'` — exact | Concrete (open phase-2 property, see timeline + tiles + cockpit numbers) | histogram p95 < runBudget, spans, Sentry empty for `anthropic.budget.exceeded` | **OK** |
| M4 | parity test + `python3 _reference-calc.py` validation + `--grep cockpit` — exact | "open property → tabs; export to .xlsx; reopen in Excel — values match" — concrete | `calculator.parity.maxDrift_eur` < 0.01 | **OK** |
| M5 | `--grep '(broker-outreach\|mail-inbound)'` + Mailpit + mail-tester.com manual | Concrete | counters + gauge + DMARC RUA + bounce ratio | **OK but mail-tester.com is manual — see AC-9 weakness.** |
| M1 | `--grep verwaltung` + Vue e2e | "<5min full flow" — concrete | counter + tenant-scope test + `nx graph` mock check | **OK** |
| M6 | Affected + `docker compose -f docker-compose.prod.yml config` + restore dry-run | "TLS valid, /api/health 200, bull-board, Grafana, restore from yesterday's pgBackRest" | "All Pre-Mortem signals fireable on test stimulus; SLO dashboards green" — **vague**: "fireable" is not measured, "SLO dashboards green" depends on undefined SLOs. | **WEAK** |

**Verdict: §F is mostly OK. M6's "Pre-Mortem detection signals fireable" and "SLO dashboards green" are the only generic items — but M6 is the production-readiness gate, so fuzzy verification here is dangerous.**

---

## 6. Deliberate-Mode Pre-Mortem Quality

| Scenario | Trigger specificity | Blast quantification | Mitigation tied to plan? | Detection signal | Verdict |
|---|---|---|---|---|---|
| B.1 Immometrica blocks | Specific (TLS-JA3 fp, headless canvas, rate, HTTP 403, empty ZIP delta) | Quantified (M2 stops; AC-1 fails; downstream M3/M4 recompute on stale data) | Yes — M2 step 2.4 + M6 step 6.2 named (though M2 lacks a numbered step 2.4 in §D — see §8) | `immometrica_poll_blocked_total` ≥3/24h Prometheus alert; Pino fingerprint to Sentry; daily digest mail | **OK with caveat: M2 is not numbered as 2.4 in §D, so the "hooked into plan" claim is loose.** |
| B.2 SMTP reputation dies | Specific (SORBS/Spamhaus blocklist day-1, DNS TXT typo, ≥5 spam complaints on first 200 mails) | Quantified (M5 ships but AC-9/AC-10 unevaluatable; brokers stop replying; M3 follow-up contamination) | Yes — M5.0 sequence (i)(ii)(iii)(iv); kill-switch | `mailer.reputation.score` ≤7 alert; bounce ratio >5%; DMARC RUA `dkim=fail`/`spf=fail` Sentry breadcrumb | **OK** |
| B.3 Excel-parity drift | Specific (cashflowAfterTax30y year-23 0.05€ rounding; €1,200 cumulative drift in month 4) | Quantified (trust collapse → conversion to zero; archived Scenarios diverge silently) | Yes — M4.0 fixtures, property-based 1000-iter, `Scenario.calculatorVersion`, M6 `nightly-parity-drift` | CI badge, `calculator.scenario.recompute.maxAbsDrift_eur` gauge, user-visible diff banner | **OK** |

**Verdict: All three pre-mortems pass Deliberate-Mode quality bars. Strongest section of the plan.**

---

## 7. Deliberate-Mode Test Plan Quality

§C audit:

| Layer | Library + scope | Example test name | AC mapping coverage |
|---|---|---|---|
| Unit (C.1) | Jest 30, co-located `.spec.ts`, ≥80% coverage gate per integrations lib | 14 named tests across M0-M6 | AC-1, 2, 3, 4, 6, 7, 8, 10, 11, 13 covered. **AC-5 (cashflow), AC-9 (reputation), AC-12 (e2e per milestone) not covered at unit level — acceptable, those are integration/e2e.** |
| Integration (C.2) | Jest + `@testcontainers/postgresql` + `@testcontainers/redis`, `apps/api/test/integration/*.int-spec.ts` | 10 named tests | AC-1, 2, 3, 4, 5 (via `scenario-create-recompute`), 6, 10, 11/12 partial, 13 covered. |
| E2E (C.3) | Playwright; `apps/api-e2e` + `apps/web-vue-e2e`; `pnpm nx e2e api-e2e` / `web-vue-e2e` | 10 named tests | AC-1, 3, 4, 5 (via cockpit-cashflow but only in M4), 6, 7, 8, 9, 10, 11, 12, 13 covered. **AC-2 not explicitly e2e (only int + unit) — acceptable, scoring is internal.** |
| Observability (C.4) | Pino + bull-board + Sentry + OTel SDK; per-milestone deliverable table | Span/counter/gauge names listed (e.g., `immometrica.session.login`, `cost.tokenEur.per_run`, `calculator.parity.maxDrift_eur`) | Concrete schema in `libs/shared/src/observability/log-schema.ts`. **OK.** |

**AC mapping check:** Every AC except AC-5 and AC-9 has at least one test layer mapped clearly. AC-5 maps to int (`scenario-create-recompute`) + e2e (`cockpit-cashflow`), but AC-5b (Vue cockpit visibility per spec wording) lands only in M4 — yet M3 claims to close AC-5 (line 445). **Mapping is mostly good; the AC-5 issue is structural (§4 above), not test-coverage.**

**Verdict: Test plan passes Deliberate-Mode quality. Strong section.**

---

## 8. Architect-Review Integration

The Architect's review surfaces 7 numbered improvements + 3 softer recommendations. Audit:

| Architect item | Mergeable change? | Iter 2 or follow-up? |
|---|---|---|
| #1 Mid-loop budget abort semantics for `tool-use-loop.ts` | Yes — needs a §D.M3 sub-section "Abort Semantics" with: tool-finish-then-stop OR cancel-immediately-and-discard, partial-write rules for `PropertyPhoto.visionAnalysis`, token-charging policy on partial Anthropic streams. | **ITER 2 — blocks AC-6 testability.** |
| #2 Move agent-tool files out of `apps/api/src/modules/agent/tools/` | Yes — relocate to `libs/agent-tools/` or `apps/worker/src/agent-tools/`. Verified via grep: `apps/api/src/modules/agent/` exists as 0-byte stub today, so no migration cost. | **ITER 2 — P2 violation.** |
| #3 Async contract for `POST /agent/conversations/:id/messages` (202 + poll URL) | Yes — append to §D.M3 the request/response contract: `POST` returns `202 {jobId, pollUrl: '/jobs/:id'}`. | **ITER 2 — P2 violation.** |
| #4 FK constraint on `tenantId` columns | Yes — migration SQL line in §D.M2 should be `tenantId String? @default("default") REFERENCES "Tenant"(id) ON DELETE SET NULL` — Prisma `@relation`. | **ITER 2 — P4 violation; AC-13 weak without it.** |
| #5 Split AC-5 into AC-5a/AC-5b | Yes — edit §D.M3 "Done when" + §D.M4 "Done when". | **ITER 2 — AC false-closure.** |
| #6 Lift AC-3 accuracy thresholds (≥80% / ≥70%) into plan | Yes — append manual-eval test deliverable in M3 `Done when`. | **ITER 2 — AC-3 weak without it.** |
| #7 M5.0 abort criteria (Mail-Tester <8/10 after 4wk → fall back to managed provider with DPA) | Yes — append to §D.M5.0 or §G.6 follow-up F-new. | **ITER 2 — needed; protects from indefinite warmup.** |
| Soft-1 M0.5 portfolio read-only wiring | Half-sprint addition to bound mock drift during Scout-First's 10-week Verwaltung-on-mocks window. | **ITER 2 strongly recommended; mitigates R12.** |
| Soft-2 `cashflow-recompute` request-path out of BullMQ | Make a pure function in `libs/shared/src/utils/scenario-recompute.ts`; keep worker only for cron + version-bump. | **ITER 2 recommended.** |
| Soft-3 Adapter deps to per-lib `package.json` (runtime boundary) | `playwright`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow` move out of root `package.json`. | **ITER 2 recommended (T3 closure).** |

**Additional Critic-only finding** (Architect missed): The plan's Pre-Mortem B.1 says "M2 step 2.4 + M6 step 6.2" but §D-M2 has no numbered step 2.4 and §D-M6 has no step 6.2. The mitigation hooks reference structure that doesn't exist. **MINOR — fix in iter 2.**

**Additional Critic-only finding**: §D-M0 lists `@playwright/test` and `playwright-extra` in root `package.json` (line 269), confirming Architect's T3 concern that adapter deps leak into the API process. Verified via `grep -c '"playwright"' /opt/realty79-real-estate-naviagator/package.json` = `0` today — root package does NOT yet include Playwright. So the violation is *being introduced* by the plan, not existing. The fix is straightforward and should not be deferred.

**Additional Critic-only finding**: `scoring-engine.ts` exports `evaluatePhase1`, `evaluatePhase2`, `calculateOverallScore` (verified at lines 38, 90, 134). Plan §D-M2 says "extend with `computeCompositeScore`" but does not describe the relationship to `evaluatePhase1` (different signature, different factor weighting). Without explicit deprecation, both will live on. Architect raised this in §5 Brownfield-Reality Audit. **MINOR — clarify in iter 2.**

---

## 9. Verdict

**ITERATE.**

The plan is comprehensive, brownfield-accurate, file-path-concrete, and honors all 13 locked decisions. Pre-Mortem coverage is excellent. The test plan structure is strong. **However**, multiple Deliberate-Mode quality bars are not met:

- §2 Fair Alternative Exploration: F1 and F2 use shallow steelmen the Architect refuted with concrete counter-arguments (REJECT-grade per protocol).
- §3 Risk Mitigation: 6 of 15 rows have WEAK or MISSING detection signals.
- §4 AC Testability: 6 of 13 ACs are WEAK (AC-3, AC-5, AC-6, AC-9, AC-10, AC-13).
- §1 Principle Consistency: 2C is internally inconsistent because abort semantics are not specified, which prevents AC-6 from being deterministic.

**Mode escalation:** Started in THOROUGH, escalated to ADVERSARIAL after the §4 audit produced 6 WEAK findings — a pattern, not isolated mistakes. ADVERSARIAL pass surfaced two additional findings (Pre-Mortem step references that don't exist; `scoring-engine` evaluatePhase1 vs computeCompositeScore relationship undocumented).

**Realist Check applied:** Three findings were pressure-tested. AC-6 stays WEAK because abort-semantics ambiguity will surface immediately on first budget-overrun in production and could leave half-written `PropertyPhoto.visionAnalysis` rows polluting the dataset (no easy rollback). AC-13 stays WEAK because missing FK on `tenantId` allows orphaned rows whose blast radius compounds over time. AC-3 stays WEAK because shipping M3 without manual accuracy-eval breaks user trust on day-1 use — the spec roadmap explicitly demands ≥80% / ≥70%. None downgraded.

### Surgical iter-2 changes the Planner must make (max 7):

1. **Add §D-M3 "Tool-Use Loop Abort Semantics"** specifying: cancel-policy (current tool finishes vs. immediate abort), partial-write rules for `PropertyPhoto.visionAnalysis`, Anthropic streaming token-billing reconciliation, and the deterministic test fixture `budget-cap.abort-semantics.int-spec.ts`. Without this, AC-6 is not testable.
2. **Relocate agent-tool files** from `apps/api/src/modules/agent/tools/` to `libs/agent-tools/` (new lib) **AND specify the async contract** for `POST /agent/conversations/:id/messages` as `202 {jobId, pollUrl}` — closes Architect #2 + #3 in one edit.
3. **Lift AC-3 manual-eval thresholds** (≥80% lokalisierungen, ≥70% Zustandseinschätzungen on 10 reference properties) into `Done when` for M3, and add `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md` as a versioned eval artifact.
4. **Split AC-5 into AC-5a (M3, KeyMetrics non-null) and AC-5b (M4, full Vue cockpit visibility)**; mark M3 as closing AC-5a only.
5. **Add `tenantId` FK constraint** in M2/M3/M5 migrations: `ALTER TABLE ... ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id)`. Required for AC-13 to be more than a naming convention.
6. **Add M5.0 abort criterion**: if Mail-Tester <8/10 after 4 weeks of warmup, fall back to managed provider with EU-DPA (Resend/Mailgun-Frankfurt). Also add detection signals for risk rows R3, R4 (separate from R1), R7, R11, R14.
7. **Steelman F2 properly** (deterministic FSM with Claude `tools:[]` + structured output) and explicitly justify why 2C still wins despite the FSM alternative being lower implementation risk; OR consider 2B with Claude-as-FSM-decider as a serious challenger. Same for F1 (Architect's "BullMQ Worker inside API process" middle-ground).

The plan should re-emerge as iter 2; do **not** proceed to execution as-is.

---

## Ralplan Summary Row

| Gate | Pass/Fail | Reason |
|---|---|---|
| Principle/Option Consistency | **Fail** | F2/2C lacks specified abort semantics; D5/AC-6 not deterministic. |
| Alternatives Depth | **Fail** | F1, F2, F3 use shallow steelmen Architect refuted. |
| Risk/Verification Rigor | **Fail** | 6/15 risk rows missing detection signals; M6 verification has fuzzy items. |
| Deliberate Pre-Mortem Quality | **Pass** | All 3 scenarios concrete (trigger/blast/mitigation/detection). |
| Deliberate Test Plan Quality | **Pass** | Quad-coverage with libraries + AC mapping; minor AC-5 split issue. |
| AC Testability | **Fail** | 6/13 ACs WEAK (AC-3, AC-5, AC-6, AC-9, AC-10, AC-13). |

**Overall: ITERATE — 4 of 6 gates fail. Pre-mortem and test-plan quality are the saving graces; principle consistency, alternatives depth, risk detection, and AC testability all need iter 2.**

---

*End of Critic review.*
