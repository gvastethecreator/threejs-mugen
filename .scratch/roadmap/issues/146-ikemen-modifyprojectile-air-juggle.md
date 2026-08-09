# Issue 146 — Ikemen ModifyProjectile air.juggle

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `air.juggle` mutation with pinned Ikemen source
and the current Projectile juggle-budget path.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces selected live Projectile
HitDef `air_juggle` values inside ModifyProjectile.

## Acceptance fixture

- Compile static values and resolve bounded dynamic root/helper expressions.
- Mutate only T561-selected active owner Projectiles.
- Preserve omitted values.
- Prove the changed cost reaches current IKEMEN root Projectile juggle debit.

## Claim ceiling

Do not claim complete helper ownership, full simul/tag juggle namespaces,
MUGEN parity, exact tick order, rollback/netplay serialization, or complete
ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `air_juggle` is replaced in place. |
| Adapted | Static and bounded dynamic numeric values normalize to an integer cost. |
| Replaced | The current IKEMEN root Projectile juggle budget is the consumer seam. |
| Omitted | Complete helper/team namespaces, MUGEN parity, exact tick order, and rollback. |
| Local extension | A combat fixture changes the cost before debit and proves the resulting budget. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 265 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
