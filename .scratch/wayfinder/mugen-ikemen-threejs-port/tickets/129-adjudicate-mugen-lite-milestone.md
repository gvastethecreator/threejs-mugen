# Adjudicate MUGEN-lite Milestone

Type: research
Status: resolved
Blocked by: None

## Question

Does the current `CompatibilityJourney/v1` evidence meet the written MUGEN-lite milestone exits, or which independently named gate remains missing?

## Inputs

- `docs/reports/2026-07-13-compatibility-journey-v1.md`
- `docs/ROADMAP_RELEASE_TARGETS.md`
- `docs/ROADMAP_PACKAGE_MILESTONES.md`
- `docs/PORT_COMPLETION_SCORECARD.md`
- `docs/PROGRESS_TRACKER.md`

## Acceptance

- Compare every written MUGEN-lite exit criterion with a current artifact id, checksum, or explicit missing gate.
- Mark each criterion accepted, deferred, or blocked; do not infer a score change from aggregate documentation.
- Produce a scorecard decision note with the exact claim ceiling and the next independent breadth gate.
- Keep commercial/third-party compatibility, exact Common1 timing, broad controller parity, teams, and full MUGEN/IKEMEN parity blocked unless separately evidenced.

## Claim Ceiling

Allowed: an evidence-linked milestone decision with explicit accepted, deferred, and blocked criteria.

Blocked: score movement without the written exit gate, full-engine parity, or treating one repository-owned package as corpus breadth.

## Outcome

- Accepted the bounded M2 Imported MUGEN-lite MVP exit: local KFM artifacts cover movement, normal/special input, guard, get-hit, fall, and recovery, while the repository-owned CC0 journey covers the legal ZIP/loader/runtime/browser/native evidence envelope.
- Current KFM trace references: `02b6bfc0` / `81e3500f` basic movement, `89bc15e0` / `330f329a` normal attack, `5242ac11` / `9e559255` QCF special, `07870510` / `b4c3f3b9` guard, `dc476568` / `bc7d27b6` get-hit, `88a7c7aa` / `86e41e54` ground recovery, and `ecce3c63` / `60591b38` recovery input.
- The legal aggregate remains `CompatibilityJourney/v1` checksum `cabcd573`, with package digest `sha256:f0389c3f95003bb16e26d6ae2020acdb57c12fa0f088d63ba25ca3466ed71eb0` and runtime references `a372a02c` / `ceac9f37`.
- Scores remain unchanged. The exact next missing breadth gate is one independent legal package or an ACT/palette route; it is tracked by Wayfinder 130.
- Report: `docs/reports/2026-07-13-mugen-lite-milestone-adjudication.md`.
- Verification: `pnpm test` 184 files / 1958 tests; `pnpm typecheck`; `pnpm check:boundaries`; `pnpm build`; `pnpm qa:trace` 577/577 artifacts (546 required, 31 optional); and `pnpm qa:smoke` all pass. Build retains the existing 1,662.07 kB chunk advisory.

## Closure Audit

- KFM optional-fixture evidence and the repository-owned legal fixture are named separately, so the decision does not promote one package into a broad compatibility corpus.
- Unsupported findings, blocked claims, optional-fixture status, checksums, and the aggregate digest remain visible.
- Exact Common1 timing, broad controller parity, commercial/third-party compatibility, teams, screenpacks/lifebars, ZSS/Lua, rollback, and full MUGEN/IKEMEN parity remain blocked.
- Independent review was not used; the manual audit compared every written M2 criterion with a current artifact or an explicit missing gate.
