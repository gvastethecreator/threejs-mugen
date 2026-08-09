# Issue 153 — Ikemen ModifyProjectile missonoverride

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `missonoverride` mutation with current active
HitOverride admission.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` updates the selected Projectile
HitDef `missonoverride` flag through the shared HitDef mutation switch.

## Acceptance fixture

- Compile static boolean values and retain dynamic values for runtime.
- Resolve bounded dynamic root/helper values.
- Mutate only T561-selected active owner Projectiles.
- Prove a later active HitOverride consumes the changed flag.

## Claim ceiling

Do not claim complete HitOverride parity, every custom-state interaction, exact
tick order, rollback/netplay serialization, or complete ModifyProjectile
parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `missonoverride` is replaced. |
| Adapted | Local boolean normalization accepts any non-zero dynamic value. |
| Replaced | None. |
| Omitted | Complete HitOverride/custom-state ordering, exact tick order, and rollback. |
| Local extension | The existing active HitOverride fixture starts from a true flag and proves a false mutation admits the redirect. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  EffectSpawnSystem, and RuntimeCombatResolutionSystem: 6 files / 314 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
