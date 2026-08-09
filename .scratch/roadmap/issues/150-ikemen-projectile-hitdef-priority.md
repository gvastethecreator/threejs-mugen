# Issue 150 — Ikemen Projectile HitDef priority

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Separate Projectile HitDef `priority` and trade type from Projectile
`projpriority` across spawn, ModifyProjectile, and later impact metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` stores HitDef `priority` in the
nested Projectile HitDef and stores `projpriority` in the Projectile itself.
ModifyProjectile updates the two fields through separate parameter IDs.

## Acceptance fixture

- Compile static `priority = value, type` separately from `projpriority`.
- Resolve bounded dynamic root/helper priority values.
- Preserve `projpriority` clash behavior while changing only HitDef priority.
- Project the changed HitDef numeric priority through later contact metadata.

## Claim ceiling

Do not claim full projectile-vs-HitDef trade arbitration, every priority trade
type interaction, exact tick order, rollback/netplay serialization, or complete
ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | HitDef `priority` and `projpriority` are stored and mutated independently. |
| Adapted | The local contact seam projects numeric HitDef priority through GetHitVar metadata. |
| Replaced | None. |
| Omitted | Full projectile-vs-HitDef trade arbitration and rollback. |
| Local extension | Dynamic root/helper values and trade-type retention are covered together. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 266 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
