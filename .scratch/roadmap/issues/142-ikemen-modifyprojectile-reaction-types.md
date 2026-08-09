# Issue 142 — Ikemen ModifyProjectile reaction types

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align static ModifyProjectile HitDef `animtype`, `air.animtype`, and
`fall.animtype` mutation with pinned Ikemen source and current reaction
metadata projection.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces the selected Projectile
HitDef `animtype`, `air_animtype`, and `fall_animtype` fields inside
ModifyProjectile.

## Acceptance fixture

- Compile named or numeric static reaction types into the typed operation.
- Mutate only T561-selected active owner Projectiles.
- Preserve omitted fields and replace authored fields independently.
- Prove later Projectile combat projects the changed reaction types.

## Claim ceiling

Do not claim `ground.type`/`air.type`, dynamic enum expressions, exact reaction
state selection, exact tick order, rollback/netplay serialization, or complete
ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Three selected live Projectile reaction-type fields are replaced in place. |
| Adapted | Existing normalized numeric reaction metadata is reused. |
| Replaced | Unsupported named or expression-shaped values fail closed. |
| Omitted | Ground/air hit type, dynamic enums, exact tick order, and rollback serialization. |
| Local extension | Current Projectile combat GetHitVar projection consumes the changed values. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 264 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
