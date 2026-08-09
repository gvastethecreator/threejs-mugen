# Issue 152 — Ikemen Projectile attacker state

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align Projectile and ModifyProjectile HitDef `p1stateno` with the attacker-side
custom state transition path.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` stores `p1stateno` inside the
Projectile HitDef and allows ModifyProjectile to replace it through the shared
HitDef mutation switch.

## Acceptance fixture

- Compile static spawn and mutation values; retain dynamic mutation values.
- Resolve bounded dynamic root/helper values.
- Mutate only T561-selected active owner Projectiles.
- Prove later contact enters the changed attacker state while the defender
  still follows the normal get-hit or authored `p2stateno` path.

## Claim ceiling

Do not claim every custom-state safety rule, complete Helper-parented state
ownership, StateChangeTmp parity, exact tick order, rollback/netplay
serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Projectile HitDef `p1stateno` is stored at spawn and replaced on selected live Projectiles. |
| Adapted | Existing shared hit-state transition ownership applies attacker then defender transitions. |
| Replaced | None. |
| Omitted | Complete Helper-parented ownership, StateChangeTmp, exact tick order, and rollback. |
| Local extension | A p1-only fixture proves the imported defender default get-hit path still runs. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  EffectSpawnSystem, and RuntimeCombatResolutionSystem: 6 files / 314 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
