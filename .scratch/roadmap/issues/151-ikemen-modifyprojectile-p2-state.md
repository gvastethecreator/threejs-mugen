# Issue 151 — Ikemen ModifyProjectile target state

- Status: `closed-bounded`
- Lane: `R2 projectile/runtime semantics`
- Priority: `P1`

## Objective

Align ModifyProjectile HitDef `p2stateno` and `p2getp1state` mutation with the
existing Projectile target-state transition path.

## Source gate

Pinned Ikemen GO `develop` commit `149402f` updates the selected Projectile
HitDef target state and state-owner flag through the shared HitDef mutation
switch. Setting `p2stateno` also enables the attacker-state-owner default.

## Acceptance fixture

- Compile static target-state values and retain dynamic values for runtime.
- Resolve bounded dynamic root/helper values.
- Mutate only T561-selected active owner Projectiles.
- Prove later contact uses the changed target state and owner flag.

## Claim ceiling

Do not claim every custom-state safety rule, StateChangeTmp parity, exact tick
order, rollback/netplay serialization, or complete ModifyProjectile parity.

## Port ledger

| Disposition | Detail |
| --- | --- |
| Copied | Selected Projectile HitDef target state and owner flag are replaced independently. |
| Adapted | Omitted `p2getp1state` defaults true when a new target state is supplied. |
| Replaced | None. |
| Omitted | Complete custom-state safety, StateChangeTmp, exact tick order, and rollback. |
| Local extension | Existing HitOverride/custom-target fixtures now begin from ModifyProjectile mutation. |

## Closure evidence

- RuntimeCompiler, ProjectileSystem, ProjectileCombatSystem, EffectActorSystem,
  and EffectSpawnSystem: 5 files / 266 tests pass.
- PlayableMatchRuntime focused root ModifyProjectile gate: 1 test passes.
- Typecheck and integration gates pass; the latest full-suite baseline remains
  13 failed files / 58 inherited failures with 3388/3446 tests passing.
