# CompatibilityJourney/v1 Report

Date: 2026-07-13
Area: MUGEN-lite evidence aggregation
Roadmap entry: 478
Wayfinder ticket: 128

## Delivered

- Added a typed `mugen-web-sandbox/compatibility-journey/v1` contract for one immutable evidence envelope.
- The aggregate keeps package/license/provenance, loader findings, runtime trace references, browser proof, native regression, and claim language addressable without copying the underlying artifacts.
- Added serialized round-trip validation that recomputes the stable aggregate checksum and rejects tampered metadata.

## Evidence

- Aggregate checksum: `cabcd573`.
- Canonical source-package digest: `sha256:f0389c3f95003bb16e26d6ae2020acdb57c12fa0f088d63ba25ca3466ed71eb0`.
- Legal package: `MUGEN Lite Journey`, `CC0-1.0`, entry `chars/mugen-lite-journey/journey.def`, intentional unsupported finding `JourneyUnknownController` retained.
- Runtime references: `mugen-lite-journey` checksum `a372a02c` / final `24709fb2`; `mugen-lite-journey-nokoslow` checksum `ceac9f37` / final `1d5b25e4`.
- Browser references: `.scratch/qa/qa-smoke/diagnostics.json`, independent desktop/mobile legal-fixture captures.
- Native references: current `183` files / `1953` assertions, TypeScript typecheck, module boundaries, and production build pass; existing large-chunk advisory remains.
- Focused verification: `CompatibilityJourney.test.ts` and `MugenLiteJourneyFixture.test.ts` pass together, `9/9` tests.

## Claim Allowed

One inspectable, immutable evidence envelope can connect the existing repository-owned legal package, loader, runtime, browser, and native regression artifacts.

## Claim Blocked

MUGEN-lite milestone or score adjudication, independent package breadth, exact Common1 timing, commercial character compatibility, broad controller parity, and full MUGEN/IKEMEN parity.

## Closure Audit

- Strongest remaining objection: a report aggregator could create the appearance of compatibility by hiding failures or copying stale payloads. The result preserves component statuses, warnings/errors, unsupported findings, artifact checksums, paths, claim ceilings, and aggregate diagnostics.
- Adversarial correction: partial or missing components fail closed; serialized checksum mismatch and diagnostics/status drift are rejected by the parser.
- The current aggregate is evidence organization only. The next ticket separately adjudicates written MUGEN-lite exit criteria and must not infer score movement from this contract.
- Independent review was not used; this narrow slice received a manual schema/provenance/failure-path audit.

## Quality Record

- Task state: completed.
- Artifact verdict: win against the evidence-envelope acceptance target.
- Verification state: verified for the aggregate contract and current legal fixture instance.
- Browser gate: existing browser artifacts are referenced; no frontend or renderer code changed in this slice.

## Global Status

- Playable sandbox: unchanged.
- MUGEN compatibility: evidence is now navigable as one versioned envelope; compatibility claims remain bounded.
- IKEMEN runtime: unchanged.
- Studio/editor: unchanged.
- Scores: unchanged pending the next milestone-adjudication gate.
