# InGuardDist latch lifecycle report

Date: 2026-07-10
Area: R1 runtime compatibility / guard and projectile lifecycle

## Delivered

- Replaced live direct-move `InGuardDist` reads with an observable previous-refresh latch.
- Added direct, projectile, and combined source provenance.
- Refreshes active ticks before contact and refreshes Pause/SuperPause and hitpause branch tails.
- Routed auto-guard and CNS trigger evaluation through the latch.
- Added actor-frame latch requirements and forbidden combat-reason gates.
- Added required projectile-only no-contact artifact.
- Migrated the official KFM air-guard oracle to state 154 with air guard-start animation 122 and direct latch evidence.

## Claim allowed

The sandbox now proves direct and projectile guard-distance eligibility as tick-latched runtime state, consumes it through automatic and authored guard routes, refreshes it on all three match branches, and exposes source/tick provenance in traces.

## Claim blocked

This does not prove exact MUGEN/IKEMEN guard scheduling, both IKEMEN guard-start checkpoints, pause-time guard-state changes, multi-opponent semantics, rollback/netplay behavior, or complete projectile coordinate-space parity.

## Evidence

- `src/tests/RuntimeGuardDistanceSystem.test.ts`: direct/projectile set and clear behavior.
- `src/tests/PlayableMatchRuntime.test.ts`: active, Pause, and hitpause schedule placement.
- `src/tests/RuntimeTraceGatePresets.test.ts`: direct trigger, auto-guard, projectile-only, and official KFM evidence.
- `.scratch/qa/trace-gates/synthetic-imported-projectile-guard-distance-latch.json`.
- `.scratch/qa/trace-gates/kfm-official-default-air-guard-state.json`.
- Trace gate: 529/529 passed (498 required, 31 optional).
- Full tests: 157 files / 1550 tests passed.
- TypeScript 7 typecheck, production build, and modular boundary check passed.

## Global status impact

- Runtime compatibility: meaningful guard/projectile lifecycle improvement with intentional checksum migration.
- Playable sandbox: guard approach behavior is more engine-like; existing trace matrix remains green.
- Studio editor: unchanged.
- IKEMEN execution: latch lifecycle implemented; two-checkpoint action ordering remains open.
- Modular engine: guard-distance ownership is explicit in `RuntimeGuardDistanceWorld`; no score movement claimed.
