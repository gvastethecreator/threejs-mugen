# Issue 140 — Ikemen ModifyProjectile AffectTeam

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `affectteam` mutation with pinned Ikemen source
and the existing normalized Projectile team-affinity field.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` handles shared
`hitDef_affectteam` inside ModifyProjectile and replaces the selected live
Projectile HitDef team-affinity value.

## Acceptance fixture

- Compile valid static `affectteam` values into the typed ModifyProjectile
  operation and reject unsupported values.
- Mutate only T561-selected active owner Projectiles.
- Preserve existing `teamside` behavior as a separate field.
- Prove the changed team-affinity value reaches current Projectile combat
  eligibility and snapshots without widening team topology claims.

## Claim ceiling

Do not claim full simul/tag/turns targeting, helper/team namespace parity,
dynamic enum expressions, exact tick order, rollback/netplay serialization,
or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `affectteam` is replaced in place. |
| Adapted | Ikemen's integer enum is normalized to the existing `F/B/E` `-1/0/1` runtime policy. |
| Replaced | Unsupported static values fail closed at compiler/runtime boundaries. |
| Omitted | Dynamic enum expressions, full team-mode topology, exact tick order, and rollback serialization. |
| Local extension | Current combat eligibility and renderer snapshots consume the changed policy. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, EffectActorSystem, and EffectSpawnSystem:
  4 files / 192 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; broader build, boundary, trace, and diff gates are recorded
  on the execution board after the integration boundary.
- Latest full-suite baseline: 13 failed files / 58 inherited failures with
  3386/3444 tests passing after the T572 integration run.
