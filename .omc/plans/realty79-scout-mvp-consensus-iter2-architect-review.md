# Architect Review — Realty79 Scout-MVP Consensus Plan, Iteration 2

**Reviewer Stage:** Architect (RALPLAN-DR Deliberate Mode, iter 2)
**Plan under review:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter2.md`
**Iter-1 Architect:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-architect-review.md`
**Iter-1 Critic:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-critic-review.md`
**Date:** 2026-04-26
**Mandate:** Verify, do not redesign.

---

## Section 1 — Iter-2 Diff Audit

| # | Edit | Landed? | Evidence (line/section in iter2.md) | Verdict |
|---|---|---|---|---|
| C1 | Tool-Use Loop Abort Semantics in §D-M3 | **YES** | §D.M3.5 (lines 547-570). Five invariants explicitly named: cooperative-finish cancel-policy, single-tx Vision write rule, two-phase Anthropic token-billing reconciliation using `usage` field on `message_stop`, sequential downstream-tool discard with `status='skipped-budget'`, and ScrapeLog finalization with two new counters. Test fixture `budget-cap.abort-semantics.int-spec.ts` references all 5. AC-6 row in matrix (line 337) re-cites the 5 invariants. | **Concrete & sufficient** |
| C2 | `libs/agent-tools/` + 202+pollUrl async contract | **YES** | New lib scaffolded in M0 (line 396); §D.M3.6 (lines 572-595) specifies 202 response shape, `Location` header, `JobsModule` (line 529) for `GET /jobs/:jobId` with `state\|progress\|result\|error`. `apps/api/src/modules/agent/tools/` explicitly NOT created (Brownfield Truth row line 78; "REMOVED iter-2" row line 519). Acceptance test `agent-conversation-async.int-spec.ts` named. | **Concrete & sufficient** |
| C3 | AC-3 manual-eval thresholds + versioned artifact | **YES** | C.4 manual-eval table (lines 315-319) names artifact `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md` + reference data file `m3-reference-properties.json`; thresholds ≥80% Lokalisierungen / ≥70% Zustandseinschätzungen lifted into AC matrix AC-3 row (line 333) and M3 Done-when (line 610). Nx target `pnpm nx run api-e2e:manual-eval-m3-vision` named. | **Concrete & sufficient** |
| C4 | AC-5 split into AC-5a/AC-5b | **YES** | AC matrix rows AC-5a (line 335, M3, KeyMetrics non-null) and AC-5b (line 336, M4, full Vue cockpit visibility) cleanly separated. M3 Done-when (line 612) closes AC-5a only and explicitly defers AC-5b. M4 Done-when (line 690) closes AC-5b. | **Concrete & sufficient** |
| C5 | tenantId FK constraint in M2/M3/M5 migrations | **YES** | M2 migration row (line 445) names `ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE SET NULL`. M3 migration row (line 514) repeats for `LocationCache`. M5 migration row (line 733) repeats for `MailMessage`. P4 principle (line 96) upgraded; integration test `tenant-fk.int-spec.ts` (line 285) asserts Postgres 23503; CI lint `scripts/prisma-migration-lint.ts` (line 801) blocks future migrations missing the constraint. | **Concrete & sufficient** |
| C6 | M5.0 abort criterion + R3/R4/R7/R11/R14 detection signals | **YES** | §D.M5.0 "Abort criterion" (lines 711-719) names trigger `daysElapsed≥28 AND scoreLatest<8 for 2 consecutive checks`, primary fallback Resend EU + secondary Mailgun-Frankfurt, ENV-driven choice. Risks Table (lines 791-803) gives concrete detection signals for R3 (`vision.confidence.below_threshold_total`), R4 (`scraper.platform.blocked_total{platform}` separated from R1), R7 (`mailer.outbound.template_version_used` + opt-out-link counter, render-fail enforcement), R11 (UptimeRobot + disk/mem gauges + F14 trigger), R14 (`nightly-extractor-smoke` cron + drift counter). | **Concrete & sufficient** |
| C7 | F2 steelman + F1 middle-ground | **YES** | §A.3 Fork 1 adds 1B′ option (lines 116, 121-128) with quantified memory-pressure rationale and reversibility-tripwire (M6 step 6.5, lines 129, 764). Fork 2 adds 2B′ FSM steelman (lines 141, 146-152) with concrete schema `{needsMorePages, nextUrls, vision, done}` and F12 fallback path. ADR §G.3 mirrors with Alt-1′ and Alt-2′ entries (lines 838, 844). | **Concrete & sufficient** |
| A1 | Calendar trap (T1) — defer M5.0 OR accept AC-9 slip | **YES** | §A.4 (lines 181-192) explicitly defers M5.0 active tuning to M5.1 sprint; M0 week 1 retains only one-shot ops (~6h). C-2 consequence (line 882) honest about the trade. AC-9 measurement window slides to week 9-10, not at risk from inattention. | **Concrete & sufficient** |
| A2 | ESLint-enforced adapter boundary (T3) — name exact rule or downgrade | **YES** | P1 (lines 86-90) upgraded to "ESLint + package-graph enforced" with two named rules: `@nx/enforce-module-boundaries` with explicit `depConstraints` keyed on tags `scope:api\|worker\|agent-tools\|integrations\|shared\|web`, AND `import/no-restricted-paths` zone-based. M0 root `package.json` EDIT row (line 368) explicitly excludes `playwright`, `@anthropic-ai/sdk`, `nodemailer`, `imapflow`, `mailparser`; per-lib `package.json` rows (lines 390, 391, 395) declare them locally. Verifiable via `pnpm nx graph --focus=api`. | **Concrete & sufficient** |
| A3 | M4.0 capped with concrete deliverables + freeze criterion | **YES** | §D.M4.0 (lines 627-647) names: max 1 calendar week, day-1 `scripts/excel-extract.ts` produces baseline count of named ranges/sheets/volatile cells, escalation thresholds (≤30→5 fixtures, 30-60→8 fixtures, >60→freeze + F13), freeze-criterion at end of day-5 if parity-suite not green for 5 baseline fixtures. F13 follow-up filed (line 904). | **Concrete & sufficient** |
| A4 | scoring-engine migration documented | **YES** | New §D.M2 sub-section "Scoring-Engine Migration" (lines 469-482) specifies: `evaluatePhase1` re-implemented as thin wrapper over `computeCompositeScore` with deprecation `console.warn`; `evaluatePhase2` and `calculateOverallScore` retained for M1 portfolio scoring with explicit JSDoc; new test `scoring-engine.migration.spec.ts` (line 265) gates the wrapper equivalence; M6 cleanup removes deprecated symbol. C+7 consequence (line 876) acknowledges. | **Concrete & sufficient** |

**All 11 items: LANDED, concrete.**

---

## Section 2 — Lingering Architectural Concerns

Three small new tensions surface from the iter-2 edits. None block.

**N1 — 202+pollUrl + incremental `AgentMessage` writes create read-after-write race for the Vue chat UI.** §D.M3.6 (line 593) has the worker write `AgentMessage` rows incrementally and the Vue page poll `GET /agent/conversations/:id` after `state='done'`. But intermediate polls during `state='running'` should also re-fetch the conversation to render in-flight tool-use steps; otherwise the UX is "spinner for 60s, then big reveal." The plan's ChatPage description (line 545, 605-606) implies this works but doesn't pin the polling contract: does `GET /agent/conversations/:id` return rows committed by the worker mid-loop? With the single-tx commit rule from §D.M3.5 (Vision-call atomicity), yes — but the same isn't asserted for `AgentMessage` rows themselves. Recommendation (non-blocking): in §D.M3.6 add a sentence "AgentMessage rows are committed in their own transaction immediately on each tool-use boundary; reads from `GET /agent/conversations/:id` see committed rows immediately." Or reuse `progress` field to deliver `newAgentMessageIds[]` cumulatively.

**N2 — `tenantId String? @default("default") REFERENCES "Tenant"(id) ON DELETE SET NULL`: the `?` (nullable) + the `SET NULL` cascade interact awkwardly with the seed row.** P4 (line 96) and the migration rows say `tenantId String?` nullable with FK `ON DELETE SET NULL`. The seed migration in M0 (line 400) inserts `Tenant(id='default')`. The default value `'default'` is not actually a constant in the column — it's the application-level default at insert time. If a future operator deletes the `'default'` Tenant row by mistake, every row's `tenantId` flips to NULL and the integration test `tenant-scope.int-spec.ts` will silently start passing for cross-tenant reads (because NULL=NULL in row-level tenant guards is implementation-dependent). For single-tenant default, `ON DELETE RESTRICT` would be safer than `ON DELETE SET NULL`; SaaS multi-tenant later can switch to `CASCADE` per-table. This isn't a blocker for v1 because there's only one tenant, but worth noting in F4 (Multi-Tenant code-pathway). Recommendation (non-blocking): clarify the FK-action in §G.3 ADR or downgrade to RESTRICT for the single-tenant phase.

**N3 — `agent-tool-use-loop` worker concurrency:2 + `BudgetSupervisor` Redis INCRBY keyed on `savedSearchRunId` is correct, but the NEW counters `anthropic.budget.aborted_total{tenant, savedSearchId}` (§D.M3.5 invariant 5, line 567) and `anthropic.budget.partial_writes_discarded_total` are reset semantics undefined.** Are these Prom counters (monotonic) or BullMQ job-level metrics? If monotonic, fine. If they back a per-run cap test, the iter-2 test suite must reset them. The integration test row (line 289) implies per-test reset is handled. Non-blocking; flag for implementer.

No tension is severe enough to require iter 3. The 202 contract does NOT introduce a new concurrency problem — it actually fixes one (sync controller blocking on tool-use loop). The FK on `tenantId` interacting with single-tenant nullable rows is a minor correctness concern around `ON DELETE` action choice, not the FK itself.

---

## Section 3 — Verdict

**APPROVED-WITH-IMPROVEMENTS**

All 7 Critic surgical edits and all 4 Architect tensions from iter 1 landed concretely with file-path-level evidence in iter2.md. Three minor follow-ups for the Critic to consider (none blocking, none requiring iter 3):

1. **(N1)** §D.M3.6 should pin per-tool-call `AgentMessage` transaction commit so Vue mid-flight polls see incremental progress rows.
2. **(N2)** Reconsider FK action `ON DELETE RESTRICT` (vs. `SET NULL`) for the single-tenant phase to harden against accidental seed-row deletion; revisit at F4.
3. **(N3)** Specify reset semantics of the new abort counters (`anthropic.budget.aborted_total`, `anthropic.budget.partial_writes_discarded_total`) — monotonic Prom counter vs. per-run BullMQ metric — so test fixtures don't drift.

---

## 80-Word Summary

Iter 2 lands all 7 Critic edits plus all 4 Architect tensions with concrete file-path evidence. §D.M3.5 abort semantics, §D.M3.6 async 202+pollUrl contract, AC-5 split, AC-3 manual-eval thresholds, FK constraints across M2/M3/M5 migrations, M5.0 abort criterion, expanded F1/F2 steelmen, calendar deferral, ESLint+package-graph dual fence, M4.0 cap, and scoring-engine migration are all present and unambiguously testable. Three minor follow-ups (read-after-write polling, FK ON-DELETE choice, counter reset semantics) are non-blocking. Plan is execution-ready.
