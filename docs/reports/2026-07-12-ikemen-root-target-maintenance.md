# IKEMEN Root Target Maintenance

Date: 2026-07-12
Wayfinder: 111
Verdict: implemented and verified

## Delivered

- Deterministic explicit-Tag target-maintenance roster over valid P1-P8 roots.
- One target-memory aging pass per selected root.
- Complete exact-id candidate lists with self excluded.
- Global TargetBind-before-BindToTarget ordering preserved across all roots.
- Actor-scoped `post-fighter:target-maintenance` schedule evidence.
- Pair/Single and pause/hitpause behavior preserved.

## Focused Evidence

- TypeScript 7 typecheck: passed.
- Focused target/runtime/schedule/trace suite: 5 files / 751 tests passed.
- Active-root behavior checksum remains `fdd687cb` with required P1-P4 maintenance phase evidence.
- Selector tests reject disabled, non-player, invalid-id, and duplicate roots.
- Stale binding-subject telemetry is explicitly cleared for every authoritative root before eligible binding resolution.
- Full tests: 178 files / 1816 tests passed.
- Trace gate: 543/543 artifacts passed (512 required, 31 optional).
- TypeScript 7 + Vite build: 260 modules; JS 1,615.68 kB, gzip 405.99 kB.
- Architecture boundaries and `git diff --check`: passed.

## Claim Boundary

This cut maintains existing target refs and bindings only. It does not add deferred HitDef acquisition, active-root hit mutation, target-controller widening, throws, Helper/Projectile target breadth, pause parity, round/HUD/audio, resources, or score movement.

## Next

Wayfinder 112 maps actor-local pending HitDef targets and deterministic post-update commit.
