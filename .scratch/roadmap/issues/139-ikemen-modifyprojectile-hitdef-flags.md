# Issue 139 — Ikemen ModifyProjectile HitDef flags

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align static ModifyProjectile HitDef `attr` and `guardflag` mutation with
pinned Ikemen source so selected live Projectiles use refreshed attack identity
and guard eligibility on later contacts.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` delegates ModifyProjectile shared
HitDef parameters into the live Projectile HitDef. `hitDef_attr` and
`hitDef_guardflag` replace the corresponding fields on every selected
Projectile.

## Acceptance fixture

- Compile static `attr` and `guardflag` into the typed ModifyProjectile
  operation while rejecting expression-shaped strings from the bounded path.
- Mutate only T561-selected active owner Projectiles.
- Prove later HitDef attribute reads and guard eligibility consume the changed
  fields.
- Preserve existing `hitflag` mutation and projectile combat behavior.

## Claim ceiling

Do not claim dynamic flag expressions, exact upstream integer-mask storage,
all shared HitDef fields, team/simul namespaces, exact tick order,
rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `attr` and `guardflag` fields are replaced in place. |
| Adapted | Local normalized strings feed existing attribute-overlap and guard-eligibility seams instead of upstream integer masks. |
| Replaced | Expression-shaped strings fail closed at the bounded compiler/runtime boundary. |
| Omitted | Dynamic masks, other shared HitDef fields, exact tick order, full team namespaces, and rollback serialization. |
| Local extension | Focused assertions prove changed metadata reaches current public combat predicates. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, EffectActorSystem, and EffectSpawnSystem:
  4 files / 192 tests pass.
- PlayableMatchRuntime focused dynamic ModifyProjectile gate: 1 test passes.
- Typecheck, build, boundaries, redirect boundaries, diff hygiene, and
  686/686 traces pass.
- Latest full-suite baseline: 13 failed files / 58 inherited failures with
  3383/3441 tests passing.
