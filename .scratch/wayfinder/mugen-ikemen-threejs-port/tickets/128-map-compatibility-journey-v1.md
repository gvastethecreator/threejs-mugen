# Map CompatibilityJourney/v1

Type: research
Status: resolved
Blocked by: None

## Question

Which bounded repository-owned compatibility journey should follow the active-root air-guard landing proof while preserving the playable MUGEN-lite lane and avoiding another already-closed guard micro-matrix?

## Candidate Inputs

- Existing legal MUGEN-lite package journey and its browser/runtime evidence.
- Current `CompatibilityJourney/v1` manifest/export/session boundary, if already present in the runtime and Studio surfaces.
- One materially independent legal package, ACT/palette, or import/export route that can graduate from existing evidence without changing the scorecard by documentation alone.
- The next I2 architecture decision for global `AssertSpecial` ownership before team KO, Helper, or Projectile widening.

## Acceptance

- Inventory the current `CompatibilityJourney/v1` runtime, manifest, export, and browser evidence before selecting implementation work.
- Choose one narrow implementation slice with a required trace or browser gate, named ownership boundary, source basis, and explicit claim ceiling.
- Keep active-root generic aerial physics, projectiles/helpers, target precedence, Pause/hitpause, teams, score movement, and full MUGEN/IKEMEN parity out of scope unless separately gated.
- Record the selected next slice in the Wayfinder map and the roadmap/report ledger before implementation.

## Research Input

- `docs/reports/2026-07-13-active-root-air-guard-landing.md`
- `docs/PORT_COMPLETION_SCORECARD.md`
- `docs/ROADMAP_EXECUTION_BOARD.md`
- `docs/NEXT_BUILD_ROADMAP.md`

## Claim Ceiling

Allowed: a source-backed next-step selection for `CompatibilityJourney/v1` with an executable acceptance gate.

Blocked: declaring the MUGEN-lite milestone complete, moving scores without fresh evidence, or claiming full MUGEN/IKEMEN parity from a planning pass.

## Outcome

- Added `src/mugen/compatibility/CompatibilityJourney.ts` with `CompatibilityJourney/v1` input/result types, deterministic normalization, stable checksum, fail-closed diagnostics, deep immutability, and serialized checksum validation.
- The current legal fixture instance is covered by `CompatibilityJourney.test.ts` without reimplementing ZIP loading, runtime traces, browser smoke, or the native regression suite.
- Aggregate checksum: `cabcd573`; canonical source-package digest: `sha256:f0389c3f95003bb16e26d6ae2020acdb57c12fa0f088d63ba25ca3466ed71eb0`.
- Runtime references: `mugen-lite-journey` checksum `a372a02c` / final `24709fb2`; `mugen-lite-journey-nokoslow` checksum `ceac9f37` / final `1d5b25e4`.
- Report: `docs/reports/2026-07-13-compatibility-journey-v1.md`.

## Closure Audit

- The aggregate stores references, checksums, paths, counts, and claim language; it does not copy trace frames or rerun loader/Playwright logic.
- The intentional `JourneyUnknownController` finding remains visible inside the loader evidence instead of being treated as a clean compatibility pass.
- Serialized round-trip accepts the generated checksum; a tampered checksum is rejected before a journey result is returned.
- Independent review was not used; this narrow contract received a manual schema, immutability, provenance, and fail-closed audit.
