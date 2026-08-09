# Issue 145 — Ikemen ModifyProjectile kill flags

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `kill`, `guard.kill`, and `fall.kill` mutation
with pinned Ikemen source and current Projectile combat adjudication.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` replaces selected live Projectile
HitDef kill, guard-kill, and fall-kill booleans inside ModifyProjectile.

## Acceptance fixture

- Compile static booleans and resolve bounded dynamic numeric booleans.
- Mutate only T561-selected active owner Projectiles.
- Preserve omitted lethal fields independently.
- Prove current hit, guard, and fall damage paths consume the changed flags.

## Claim ceiling

Do not claim all KO/win-state variants, complete fall-state parity, exact tick
order, rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected live Projectile hit, guard, and fall kill booleans are replaced in place. |
| Adapted | Static and bounded dynamic numeric values normalize to local booleans. |
| Replaced | Existing combat and stored fall-state seams adjudicate lethal clamping. |
| Omitted | Full KO/win-state variants, exact tick order, and rollback serialization. |
| Local extension | Focused hit and guard fixtures prove modified flags clamp lethal damage. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 265 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck passes; the latest full-suite baseline remains 13 failed files /
  58 inherited failures with 3386/3444 tests passing after T572 integration.
