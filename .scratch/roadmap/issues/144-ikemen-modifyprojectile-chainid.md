# Issue 144 — Ikemen ModifyProjectile ChainID

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `chainid` mutation with pinned Ikemen source and
the current Projectile contact metadata seam.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces selected live Projectile
HitDef `chainid` values inside ModifyProjectile.

## Acceptance fixture

- Compile static `chainid` into the typed ModifyProjectile operation.
- Resolve dynamic root/helper expressions through the existing bounded number
  resolver.
- Mutate only T561-selected active owner Projectiles.
- Prove later Projectile contact projects the changed chain ID.

## Claim ceiling

Do not claim `nochainid`, full chain admission semantics, exact tick order,
rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `chainid` is replaced in place. |
| Adapted | Static and existing bounded dynamic numeric resolvers share the typed field. |
| Replaced | Current GetHitVar contact metadata is the observable projection seam. |
| Omitted | `nochainid`, full chain admission, exact tick order, and rollback serialization. |
| Local extension | Root/helper integration and a Projectile combat fixture assert the changed value. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 264 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
