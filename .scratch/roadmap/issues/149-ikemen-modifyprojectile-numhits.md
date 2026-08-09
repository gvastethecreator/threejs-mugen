# Issue 149 — Ikemen ModifyProjectile numhits

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `numhits` mutation with pinned Ikemen source and
current Projectile impact metadata.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` evaluates `numhits` as one integer
and replaces the selected live Projectile HitDef value. This field is separate
from Projectile `projhits`, which controls remaining contact capacity.

## Acceptance fixture

- Compile a static `numhits` value and retain dynamic expressions for runtime.
- Resolve bounded dynamic root/helper values.
- Mutate only T561-selected active owner Projectiles.
- Prove later hit metadata exposes the changed count without changing
  `projhits` contact capacity.

## Claim ceiling

Do not claim combo-counter parity, `projhits` parity, exact tick order,
rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile HitDef `numhits` is replaced independently. |
| Adapted | Local runtime clamps the stored count to its existing non-negative metadata invariant. |
| Replaced | None. |
| Omitted | Complete combo-counter, exact tick-order, and rollback parity. |
| Local extension | Combat proves the authored count and mutable combo counter remain distinct. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 266 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
