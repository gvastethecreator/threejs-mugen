# Issue 147 — Ikemen ModifyProjectile damage

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `damage` mutation with pinned Ikemen source and
current Projectile hit/guard damage adjudication.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces selected live Projectile
HitDef hit and guard damage from the one- or two-value `damage` parameter.

## Acceptance fixture

- Compile static one- and two-value damage without conflating omitted guard
  damage with pair replication.
- Resolve bounded dynamic root/helper pairs.
- Mutate only T561-selected active owner Projectiles.
- Prove later hit and guarded contacts consume changed non-negative damage.

## Claim ceiling

Do not claim complete damage scaling, red-life/dizzy/guard-point coupling,
exact tick order, rollback/netplay serialization, or complete ModifyProjectile
parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile hit and guard damage fields are replaced together. |
| Adapted | Local mutation clamps negative damage to zero before current combat scaling. |
| Replaced | A single authored value sets guard damage to zero instead of duplicating hit damage. |
| Omitted | Complete scaling, red-life/dizzy/guard-point coupling, exact tick order, and rollback. |
| Local extension | Hit and guarded combat fixtures consume the changed values. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 265 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
