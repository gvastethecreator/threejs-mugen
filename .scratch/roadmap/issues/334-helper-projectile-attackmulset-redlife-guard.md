# Issue 334 — Helper Projectile `AttackMulSet.RedLife` guard contact

## Estado

- **T760 — queued (2026-08-14)**
- **Área:** runtime / Helper / Projectile / guard / AttackMulSet / red-life
- **Dependencia:** T758 / issue 332; T759 / issue 333

## Objetivo

Close the Helper-parented counterpart to the root Projectile red-life guard
snapshot. The Helper-created Projectile must retain its creation-time
`AttackMulSet.RedLife` multiplier through an accepted guard contact while
authored `GetHitVar(redlife)` remains separate.

## Alcance permitido

- First-generation Helper-parented, root-owned Projectile guard contact.
- Helper/projectile lifecycle and dual target links.
- One required trace plus focused integration coverage.

## Fuera de alcance

- ModifyProjectile, nested helpers, team/shared resource banks,
  `TargetRedLifeAdd`, exact clamp/rounding/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Required trace with Helper and Projectile operations, creation snapshot,
  later redlife multiplier mutation, accepted guard, authored readback and
  final defender red-life resource.
- Focused trace test, typecheck, `git diff --check`, and aggregate QA result
  recorded without hiding inherited blockers.
