# Issue 148 — Ikemen ModifyProjectile givepower

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `givepower` mutation with pinned Ikemen source
and current Projectile contact metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces selected live Projectile
HitDef hit and guard `givepower` values from one or two authored values.

## Acceptance fixture

- Compile static one- and two-value `givepower` values.
- Resolve bounded dynamic root/helper pairs.
- Mutate only T561-selected active owner Projectiles.
- Prove hit and guarded contacts project the changed effective power metadata.

## Claim ceiling

Do not claim direct power-pool mutation, `getpower`, power sharing, exact tick
order, rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile hit and guard `givepower` fields are replaced together. |
| Adapted | Local runtime stores the values as impact metadata consumed by GetHitVar. |
| Replaced | A single authored value sets guard power to zero instead of duplicating hit power. |
| Omitted | Direct power-pool mutation, `getpower`, sharing, exact tick order, and rollback. |
| Local extension | Hit and guarded contact fixtures expose the changed effective metadata. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 265 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
