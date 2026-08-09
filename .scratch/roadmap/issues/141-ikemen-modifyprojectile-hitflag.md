# Issue 141 — Ikemen ModifyProjectile HitFlag

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align static ModifyProjectile HitDef `hitflag` mutation with pinned Ikemen
source so selected live Projectiles use the refreshed contact-admission mask.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` handles shared `hitDef_hitflag`
inside ModifyProjectile and replaces the selected live Projectile HitDef mask.

## Acceptance fixture

- Compile static `hitflag` into the typed ModifyProjectile operation and reject
  expression-shaped values from the bounded path.
- Mutate only T561-selected active owner Projectiles.
- Prove later Projectile contact admission and snapshots consume the changed
  mask.
- Preserve T565 `attr`/`guardflag` and T566 `affectteam` behavior.

## Claim ceiling

Do not claim dynamic flag expressions, exact upstream integer-mask storage,
all shared HitDef fields, exact controller evaluation order, rollback/netplay
serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `hitflag` is replaced in place. |
| Adapted | The port retains normalized string masks used by current shared admission. |
| Replaced | Expression-shaped masks fail closed at the bounded compiler/runtime seam. |
| Omitted | Dynamic masks, exact integer storage, exact tick order, and rollback serialization. |
| Local extension | A public Projectile combat fixture proves the changed mask rejects later contact. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 263 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
