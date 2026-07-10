# Common1 state source precedence report

Date: 2026-07-10
Area: R1 runtime compatibility / loader / trace provenance

## Delivered

- Added explicit character-over-common state resolution with one compiled state per number.
- Added selected/shadowed source diagnostics with source kind, path, fingerprint, and selection reason.
- Propagated selected state source into controller telemetry and trace gate requirements.
- Added loader fixtures for state 120 override and fallback.
- Added required runtime artifacts for character-owned and Common1-owned guard-start execution.

## Claim allowed

The sandbox now proves that character state 120 overrides `stcommon` state 120, and that `stcommon` supplies state 120 when character data omits it. Both routes expose executable source provenance and preserve the existing synthetic 120-to-130 timing.

## Claim blocked

This slice does not prove complete Common1 compatibility, exact same-tier duplicate semantics, automatic guard-phase order, exact MUGEN/IKEMEN guard timing, ZSS execution, or full MUGEN/IKEMEN parity.

## Evidence

- `src/tests/StateSourceResolver.test.ts`
- `src/tests/MugenCharacterLoader.test.ts`
- `src/tests/RuntimeTraceGatePresets.test.ts`
- `.scratch/qa/trace-gates/synthetic-imported-common1-state-source-override.json`: character source, `fnv1a32:a0faab3b`, state 120 at tick 1 and state 130 from tick 2.
- `.scratch/qa/trace-gates/synthetic-imported-common1-state-source-fallback.json`: common source, `fnv1a32:4755d14b`, state 120 at tick 1 and state 130 from tick 2.
- Full tests: 157 files / 1547 tests passed.
- Trace gate: 528/528 passed (497 required, 31 optional).
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries` passed.

## Global status impact

- Runtime compatibility: stronger Common1 loader/provenance evidence; no full-port score claim.
- Playable sandbox: guard-start behavior unchanged.
- Studio editor: unchanged.
- IKEMEN execution: unchanged; scanner/reference scope remains separate.
- Modular engine: source ownership is more explicit, but no boundary score movement is claimed.
