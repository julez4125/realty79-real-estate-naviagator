# Realty79 — Open Questions Tracker

Cross-plan open questions accumulated by Planner. Each entry: `[ ]` checkbox + question + why it matters.

## realty79-scout-mvp-consensus-iter1 — 2026-04-26

- [ ] F1 Mietspiegel provider final (Destatis-only vs. +F+B paid) — Cost vs. lage-score accuracy tradeoff. Decide after M3 spike if Destatis lage-score quality is >=80% accurate vs ground-truth.
- [ ] F2 Residential-proxy provider final (Bright Data vs. Oxylabs vs. IPRoyal) — Decided at first production block event in M3.
- [ ] F3 OCR/Beleg-Klassifikation re-evaluation — Currently deferred to post-M6 behind feature flag; reopen on user demand.
- [ ] F4 Multi-Tenant code-pathway activation (tenant-guard interceptor) — Trigger: first SaaS customer signup. Schema is already prepared (D2/AC-13).
- [ ] F5 Mobile-Native (Ionic) — Currently a non-goal; reopen post-MVP if user requests.
- [ ] F6 DSGVO juristic review of broker-outreach templates — BLOCKER for M5 launch. Must complete pre-M5.2 ship.
- [ ] F7 Hetzner VM sizing (CCX13 vs. CCX23 vs. CCX33) — Determined by M3 prod load-test once API+worker+Playwright+Postgres+Redis colocation memory profile is observed.
- [ ] F8 OpenTelemetry exporter target (local Tempo vs. Grafana Cloud) — Pre-M6, decision based on EUR/month budget.
- [ ] F9 Backup off-site target (Hetzner Storage Box vs. external S3 like Backblaze B2 / Cloudflare R2) — Pre-M6.
- [ ] F10 Photo-Vision cache TTL + invalidation strategy — Currently: SHA-256 hash-keyed, no TTL. Reopen post-M3 once cache hit-rate is observed.
- [ ] Bestandsgrosse quantifizieren (Anzahl Properties/Units/Leases heute) — Required for M1 sizing; from spec Outstanding-Info.
- [ ] Score-Faktor-Defaults 25/25/25/25 sane? — Calibrate empirically after first 50 Phase-1 hits in M2.
- [ ] Min-Score-Schwellen fuer Phase-2 promotion — Empirical from first 50 hits; from spec Outstanding-Info.
- [ ] Excel-Tab-Struktur expliziter Mapping — Produced as M4.0 deliverable; from spec Outstanding-Info.
- [ ] Angular-App final delete confirmation — Recommended in spec/D13; final user confirm scheduled in M0 commit 1.
