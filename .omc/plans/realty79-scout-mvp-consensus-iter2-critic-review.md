# Critic Review (Iter 2) — Realty79 Scout-MVP Consensus Plan

**Stage:** Critic (RALPLAN-DR Deliberate, iter 2 — verification pass)
**Plan:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter2.md`
**Iter-1 critic edits:** §9 of `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter1-critic-review.md`
**Iter-2 architect:** `/opt/realty79-real-estate-naviagator/.omc/plans/realty79-scout-mvp-consensus-iter2-architect-review.md` (APPROVED-WITH-IMPROVEMENTS, 3 non-blocking)
**Date:** 2026-04-26
**Mode:** THOROUGH (no escalation triggers; 0 CRITICAL, 0 MAJOR found)

## Section 1 — Surgical-Edit Verification

| # | Edit | Landed? | Concrete & testable? | Verdict |
|---|---|---|---|---|
| C1 | Abort semantics + `budget-cap.abort-semantics.int-spec.ts` | YES — §D.M3.5 lines 547-570 | YES — 5 named invariants (cooperative-finish, single-tx Vision write, two-phase token billing using `usage.input_tokens+usage.output_tokens`, sequential T1-only execution, `ScrapeLog` finalization fields). Test fixture line 570 references all 5 invariants explicitly. | **OK** |
| C2 | `libs/agent-tools/` lib + 202+pollUrl async contract | YES — M0 lib scaffold line 396; §D.M3.6 lines 572-595; `apps/api/src/modules/agent/tools/` explicitly REMOVED line 519; `JobsModule` line 529 backs `GET /jobs/:jobId`; `agent-conversation-async.int-spec.ts` line 290 + e2e line 309 | YES — exact 202 body shape, `Location` header, polling cadence, incremental `AgentMessage` writes, `job.updateProgress()` semantics | **OK** |
| C3 | AC-3 thresholds + manual-eval artifact | YES — C.4 lines 315-319; AC-3 row line 333; M3 Done-when line 610 | YES — ≥80% / ≥70% thresholds named; artifact `apps/api-e2e/src/manual-eval/m3-vision-accuracy.md` + reference data `m3-reference-properties.json`; Nx target `pnpm nx run api-e2e:manual-eval-m3-vision` named | **OK** |
| C4 | AC-5 split into AC-5a/AC-5b | YES — matrix rows 335-336; M3 closes AC-5a line 612 (M4 explicitly deferred); M4 closes AC-5b line 690 | YES — AC-5a measures `KeyMetrics` non-null (M3); AC-5b measures Vue cockpit 4-tab visibility against fixture-01 ≤0.01€ (M4) | **OK** |
| C5 | tenantId FK constraint | YES — M2 migration line 445; M3 migration line 514 (`LocationCache`); M5.1 migration line 733 (`MailMessage`); P4 upgraded line 96; `tenant-fk.int-spec.ts` line 285 asserts Postgres 23503 | YES — exact SQL `ADD CONSTRAINT fk_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"(id) ON DELETE SET NULL` repeated at every migration row | **OK** |
| C6 | M5.0 abort + 5 risk detection signals | YES — abort sub-section lines 711-719; Risks Table lines 791-803 has detection-signal column on EVERY row | YES — R3 `vision.confidence.below_threshold_total`; R4 `scraper.platform.blocked_total{platform}` (separated from R1); R7 `mailer.outbound.template_version_used` + opt-out-link counter (render-fail enforced); R11 UptimeRobot + `vm.disk.usedPercent` + `vm.memory.usedPercent` + F14 trigger; R14 `nightly-extractor-smoke` cron + `extraction_drift_total` counter | **OK** |
| C7 | F1 + F2 steelmen | YES — F1 1B′ option lines 116, 121-128 with quantified memory-pressure rationale + reversibility tripwire (M6 step 6.5 line 764); F2 2B′ FSM steelman lines 141, 146-152 with concrete schema `{needsMorePages, nextUrls, vision, done}` + F12 fallback path; F3 3A steelman line 169-173 (Resend EU + Mailgun-Frankfurt corrected from US-conflation) | YES — invalidation rationale is now non-circular (Hetzner CCX13 8GB memory math; spec ontology fit; abort-semantics gap closed in §D.M3.5) | **OK** |

**All 7 edits: LANDED, concrete, testable.**

## Section 2 — Re-tabled 6 Failed Gates (iter-2 status)

| Gate | Iter-1 | Iter-2 | One-line evidence |
|---|---|---|---|
| Principle/Option Consistency | Fail | **Pass** | 2C abort semantics fully specified §D.M3.5; F1 invalidation no longer circular. |
| Alternatives Depth | Fail | **Pass** | 1B′ + 2B′ steelmen are non-strawman, with quantified rationale and explicit migration paths (F11, F12); F3-3A corrected. |
| Risk/Verification Rigor | Fail | **Pass** | Every risk row in §E now has Detection-Signal column; M6 step 6.5 + `m6-detection-signal-test-stimuli.md`; SLO doc named (line 818). |
| Deliberate Pre-Mortem | Pass | **Pass** | B.1/B.2/B.3 kept verbatim + B.2 extended with `mail.warmup.daysElapsed`. |
| Deliberate Test Plan | Pass | **Pass** | Quad-coverage extended with C.4 manual-eval row; 6 new named test files. |
| AC Testability | Fail | **Pass** | AC-3, AC-5a/5b, AC-6, AC-9, AC-10, AC-13 all have concrete measurement + test path + Done-when threshold. |

**6/6 gates pass.**

## Section 3 — AC-Matrix Re-audit

- **AC-3:** Unambiguous — int-spec + manual-eval ≥80% / ≥70% on 10 reference properties; Nx target named.
- **AC-5a:** Unambiguous — `KeyMetrics` non-null per Phase-2 default Scenario, M3 int-spec.
- **AC-5b:** Unambiguous — 4 Vue cockpit tabs match Excel fixture-01 ≤0.01€, M4 e2e.
- **AC-6:** Unambiguous — all 5 abort invariants verified by `budget-cap.abort-semantics.int-spec.ts`.
- **AC-9:** Unambiguous — Mail-Tester ≥9/10 OR fallback within 28 days.
- **AC-10:** Unambiguous — corpus path committed.
- **AC-13:** Unambiguous — both `tenant-scope.int-spec.ts` AND `tenant-fk.int-spec.ts` gating.

## Section 4 — Architect Follow-ups (3 non-blocking)

| # | Architect note | Truly non-blocking? | Justification |
|---|---|---|---|
| N1 | `AgentMessage` per-tool-call commit visibility for mid-flight Vue polls | **Yes** | The `progress` field + `job.updateProgress()` semantics already imply per-tool-call commits; tightening wording is 1-line clarification, not structural fix. Defer to F-new at execution time. |
| N2 | `ON DELETE SET NULL` vs `RESTRICT` for single-tenant phase | **Yes** | Single-tenant v1 has only `Tenant(id='default')`; deletion is operationally guarded. Trade revisited at F4 (Multi-Tenant code-pathway). |
| N3 | Counter reset semantics for new abort counters | **Yes** | Implementer-level concern; per-test setup handles reset. Standard Prom monotonic counters. Surfaces during M3 implementation. |

**No architect follow-up rises to iter-3 escalation.**

## Section 5 — Verdict

**APPROVE.**

All 7 surgical edits from iter-1 §9 landed with file-path-level evidence; all 4 architect tensions (T1 calendar, T3 ESLint+package fence, T4 M4.0 cap, T5 scoring-engine migration) landed; all 3 architect soft items (M0.5, scenario-recompute pure function, per-lib `package.json`) landed; all 6 previously-failed gates now pass; all 7 previously-WEAK ACs are now unambiguously testable. The 3 architect non-blocking follow-ups are correctly scoped as execution-time clarifications. **The plan is execution-ready.**

### Ralplan Summary Row

| Gate | Verdict | Reason |
|---|---|---|
| Principle/Option Consistency | **Pass** | 2C abort semantics specified; 1B/3B invalidations non-circular. |
| Alternatives Depth | **Pass** | 1B′/2B′ steelmen quantified with reversibility paths. |
| Risk/Verification Rigor | **Pass** | Detection-signal column on all 15 risk rows. |
| Deliberate Pre-Mortem | **Pass** | B.1/B.2/B.3 retained + B.2 extended. |
| Deliberate Test Plan | **Pass** | Quad-coverage expanded with 6 new named test files. |
| AC Testability | **Pass** | All 7 previously-WEAK ACs measurable. |

## 100-Word Summary

Iter-2 verification confirms all 7 surgical edits from iter-1 landed with file-path-level evidence: §D.M3.5 abort semantics, §D.M3.6 async 202+pollUrl contract, AC-3 manual-eval thresholds + artifact, AC-5a/5b split, tenantId FK constraints across M2/M3/M5 migrations, M5.0 abort criterion with detection signals for R3/R4/R7/R11/R14, and proper F1/F2/F3 steelmen with quantified rationale. All 6 previously-failed gates now pass; all 7 previously-WEAK ACs are unambiguously testable. The architect's 3 non-blocking follow-ups (mid-flight AgentMessage commit boundary, ON DELETE action, counter reset semantics) are correctly scoped as execution-time clarifications. Plan is execution-ready. **Verdict: APPROVE.**
