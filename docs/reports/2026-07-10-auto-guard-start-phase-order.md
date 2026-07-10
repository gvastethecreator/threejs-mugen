# Automatic guard-start phase-order report

Date: 2026-07-10
Area: R1 runtime compatibility / match schedule diagnostics

## Delivered

- Added `fighter:auto-guard-check` to `MatchTickSchedule/v0` with `RuntimeAutoGuardStartWorld` ownership.
- Stamped the actual defender on both active-branch checks.
- Required the phase in active trace-artifact diagnostics.
- Added an artifact oracle for `P1 controllers -> P2 check -> P2 controllers -> P1 check -> combat`.
- Preserved pause/hitpause behavior and behavior-checksum exclusion.

## Claim allowed

The sandbox can now expose and gate its current automatic guard-start checkpoint order in active ticks, including actor identity and its placement before post-fighter contact resolution.

## Claim blocked

This is diagnostic proof of current behavior, not exact MUGEN/IKEMEN parity. Two-checkpoint IKEMEN behavior, latched `InGuardDist`, pause-time state changes, and exact collision timing remain blocked.

## Evidence

- `src/tests/PlayableMatchRuntime.test.ts`: exact active phase/actor sequence.
- `src/tests/RuntimeMatchFighterAdvanceSystem.test.ts`: normal and same-tick Pause cutoff order.
- `src/tests/RuntimeTraceGatePresets.test.ts`: required auto-guard-start artifact phase order.
- Trace gate: 528/528 passed (497 required, 31 optional).
- Full tests: 157 files / 1547 tests passed.
- `pnpm typecheck`, `pnpm build`, and `pnpm check:boundaries` passed.

## Global status impact

- Runtime compatibility: stronger guard/schedule observability; no parity score movement.
- Playable sandbox: behavior unchanged.
- Studio editor: unchanged.
- IKEMEN execution: source-backed divergence documented; execution unchanged.
- Modular engine: guard checkpoint ownership is explicit; no score movement claimed.
