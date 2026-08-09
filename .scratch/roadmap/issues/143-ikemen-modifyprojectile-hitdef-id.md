# Issue 143 — Ikemen ModifyProjectile HitDef ID

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `id` mutation with pinned Ikemen source without
collapsing it into Projectile selector `id` or Projectile `projid` mutation.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` uses ModifyProjectile's own `id`
for selection, then shared `hitDef_id` replaces the selected Projectile HitDef
target ID. The compiler namespace distinction needs an explicit port seam.

## Acceptance fixture

- Preserve T561 selector `id` and `projid` mutation behavior.
- Add a distinct typed HitDef target-ID mutation seam if the local CNS syntax
  can represent it without ambiguity.
- Prove selected active owner scope and later target metadata projection.
- Fail closed if the pinned syntax cannot be represented faithfully.

## Claim ceiling

Do not claim ambiguous syntax parity, dynamic expressions beyond the existing
resolver, chain/nochain behavior, exact tick order, rollback/netplay
serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Authored `id` both selects Projectiles and replaces their HitDef target ID. |
| Adapted | The local typed operation exposes selection and contact metadata separately. |
| Replaced | Explicit negative IDs clamp target metadata to zero after selecting all active matches. |
| Omitted | Chain/nochain behavior, exact tick order, and rollback serialization. |
| Local extension | Existing root/helper integration fixtures assert the resulting target metadata. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 264 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
