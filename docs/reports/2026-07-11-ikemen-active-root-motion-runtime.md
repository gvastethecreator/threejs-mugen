# IKEMEN Active-root Motion Runtime Report

Date: 2026-07-11
Scope: Wayfinder 097
Compatibility profile: explicit `ikemen-go` Tag normal ticks

## Delivered

- `RuntimeRootAdvancePhaseWorld` takes one immutable pre-actor snapshot of `playable`, `active-motion`, and `bounded-standby` roots. Tag changes cannot widen the caller's remaining phases during the same pass.
- Already-live, available, non-KO P3-P8 roots now run state clock, restricted motion CNS, local kinematics, then animation through `RuntimeRootMotionAdvanceWorld`.
- The motion profile adds `Gravity`, `VelSet`, `VelAdd`, `VelMul`, `HitVelSet`, `PosSet`, and `PosAdd` to the existing bounded CNS allowlist while keeping every side-effect route empty.
- P1/P2 keep the full playable path when non-standby. Standby, disabled, non-player, invalid-side, over-KO, Single, and legacy roots stay bounded or fail closed.
- `RuntimeRootPhaseCapabilities/v1` reports `active-motion` and enables only controller CNS, kinematics, and animation beyond the previously mapped command axis for P3-P8.
- Pause and hitpause behavior are unchanged. Reset restores authored standby, state, position, velocity, and animation without retaining a phase snapshot.

## Source Basis

- Commands update before actor preparation/execution: [Ikemen-GO `char.go` lines 13014-13176](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13014-L13176).
- Character state logic precedes position physics and animation commit: [Ikemen-GO `char.go` lines 11737-11868](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11737-L11868).
- Standby masks effective control while hit detection independently excludes standby actors: [effective control](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L5255-L5337), [hit detection](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L13207-L13228).
- Full order and local owner audit: [`docs/research/2026-07-11-ikemen-active-root-playable-phase-promotion.md`](../research/2026-07-11-ikemen-active-root-playable-phase-promotion.md).

## Required Trace

`synthetic-imported-ikemen-active-root-motion.json` is required.

- Trace checksum: `8ee92f65`.
- Frame checksums: `2cdd8661`, `3a90a6dd`, `64d76d9a`, `df69cd20`.
- Frame 1 executes P3 `TagIn` but no P3 kinematics or animation.
- Frames 2-3 execute allowed P3 `VelSet`, kinematics, and animation; final P3 position is `-152,0`, velocity is `4,0`, and P4 remains inert.
- A blocked P3 `Helper` route emits no operation/effect evidence. Opposite-side input, hit, and guard routes remain absent.

## Verification

- Full suite: 174 files / 1781 tests.
- TypeScript 7: `pnpm typecheck` passed.
- Production build: passed; the existing large-chunk warning remains at 1,602.48 kB for the main JS chunk.
- Trace gates: 541/541 artifacts, including 510 required and 31 optional.
- Architecture: `pnpm check:boundaries` passed.
- Browser smoke: N/A because P3-P8 remain outside `snapshot.actors`, camera, renderer, HUD, and visible presentation.
- Final diff gate is recorded in the commit closeout.

## Adversarial Audit

- Same-pass escalation is impossible because every root phase is selected before the first actor executes.
- Motion CNS has no side-effect capability; an authored `Helper` probe remains blocked while allowed kinematic operations execute.
- Pause and hitpause tests prove the new normal-tick phase does not leak into frozen branches.
- Single, legacy, unavailable, invalid-side, over-KO, and standby roots retain the bounded path.
- Required trace registration plus the complete 541-artifact run protects historical pair behavior and the new reserve-root route together.
- Independent second-agent review was unavailable; invariant, negative-route, regression, simplifier, and full-gate passes provide the current evidence.

## Quality Record

Task state: completed

Artifact verdict: win against Wayfinder 097 acceptance

Verification state: verified

Deferred: direct native input/AI, exact same-frame Tag promotion, Pause/hitpause motion, stage clamp/push, presentation/camera/HUD/audio, root-key effects/targets, combat, round, resources, ZSS/Lua, rollback, and netplay

Claim allowed: an already-live explicit-Tag P3-P8 root can execute bounded imported CNS-driven local motion and animation on normal ticks under an immutable phase policy.

Claim blocked: visible or collidable Tag, complete fighter advancement, direct native control/AI, broader gameplay ownership, score movement, or full MUGEN/IKEMEN parity.
