# Issue 334 — Helper Projectile `AttackMulSet.RedLife` guard contact

## Estado

- **T760 — closed-bounded (2026-08-14)**
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

## Cierre T760

- Evidence commit: `0844ffd1`.
- Required trace: `2b16f9c8` -> `e850cd44`, status `passed`.
- Focused gate: `RuntimeTraceGatePresets.test.ts` 1/1.
- `pnpm run typecheck` and `git diff --check` pass.
- Aggregate `pnpm run qa:trace` materializes this artifact as passed, then
  stops on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.
- The first-generation Helper-parented Projectile keeps the creation-time
  redlife multiplier through an accepted guard; authored
  `GetHitVar(redlife)=20` remains separate and the defender ends at
  `life=20/redLife=20`.

The trace uses the existing root-owned effective `AttackMulSet.RedLife`
snapshot seam with Helper/Projectile parentage; helper-local nested
controllers, ModifyProjectile, shared resource banks, exact clamp/rounding/
timing, rollback and full parity remain outside this bounded claim.
