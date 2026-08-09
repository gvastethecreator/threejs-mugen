# Issue 123 — Ikemen Projectile Pause/SuperPause move time

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime lifecycle`
- Priority: `P1`

## Objective

Carry official Projectile `pausemovetime` and `supermovetime` through typed
controller operations, live projectile state, Pause/SuperPause advancement,
and the existing numeric `ProjVar` trigger.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` stores both values on Projectile.
The Projectile compiler adds one to non-negative authored values because the
new Projectile ticks on its spawn frame. A Projectile advances during Pause or
SuperPause while the matching value is positive or `-1`; positive values are
decremented on every active Projectile tick. `ProjVar` returns the current
stored values. The source is MIT licensed.

## Acceptance fixture

- Compile static `pausemovetime` and `supermovetime` for Projectile and
  ModifyProjectile without adding a new parser surface.
- Store both counters on `RuntimeProjectile`, expose them in snapshots, and
  return them through numeric `ProjVar`.
- Advance eligible projectiles during Pause/SuperPause; freeze zero and values
  below `-1`; keep `-1` as unlimited movement.
- Prove normal-tick countdown, paused movement/countdown, frozen state,
  modification, redirects, and missing-projectile behavior.

## Claim ceiling

Do not claim Projectile hitpause parity, pause stacking, animation
interpolation, rollback/netplay serialization, dynamic controller values, or
complete Projectile lifecycle parity.

## Implementation

- `ProjectileControllerOp` and `ModifyProjectileControllerOp` carry static
  `pausemovetime` and `supermovetime` values into `RuntimeProjectile`.
- Non-negative authored values gain the official spawn-tick increment;
  positive counters decrement on every active projectile tick, `-1` remains
  unlimited, and zero or values below `-1` freeze under the matching pause.
- Paused presentation advances projectiles in helper -> projectile -> explod
  order, including the source-owned route when the source actor has movetime.
- Numeric `ProjVar` reads and effect snapshots expose the live counters.

## Port ledger

- Source: Ikemen GO `develop` commit `149402f`, MIT.
- Local seam: `ControllerOps.ts` -> `ProjectileSystem.ts` ->
  `EffectActorSystem.ts` / `EffectLifecycleSystem.ts` / `PauseSystem.ts` ->
  shared expression contexts and trace presets.
- Bounded claim: static controller values and current Pause/SuperPause
  lifecycle only; the claim ceiling above remains open.

## Verification

- Focused tests: 8 files / 278 tests passed.
- `pnpm typecheck`, `pnpm build`, `pnpm check:boundaries`, and
  `pnpm check:redirect-boundary` passed.
- `pnpm qa:trace`: 686/686 passed (652 required, 34 optional).
- Required `synthetic-imported-superpause-projectile-freeze` artifact checksum:
  `a88253a3`; final checksum: `d0c71cda`.
- Full suite: 13 failed files / 58 failed tests / 3369 passed / 3427 total.
  Failures remain in the inherited retired-roster, Studio/project expectation,
  movement-expectation, and imported-log-label families; no T549 focal test
  failed.
