# Issue 332 — Helper Projectile `AttackMulSet.RedLife` snapshot evidence

## Estado

- **T758 — closed-bounded (2026-08-14)**
- **Área:** runtime / Helper / Projectile / AttackMulSet / red-life resource
- **Dependencia:** T757 / issue 331

## Objetivo

Close an independent required trace for a Projectile created by a Helper. The
Projectile must retain the Helper/root effective `AttackMulSet redlife`
multiplier captured at creation after a later live multiplier change, while
authored `GetHitVar(redlife)` remains separate at contact.

## Alcance permitido

- Helper-parented Projectile creation snapshot using the T757 runtime seam.
- Root ownership, Helper parent topology, lifecycle, accepted hit and
  red-life resource evidence.
- One required trace plus focused integration coverage.

## Fuera de alcance

- ModifyProjectile, guarded contacts, team/shared resource banks,
  `TargetRedLifeAdd`, exact clamp/rounding/int32/timing parity, rollback and
  full M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Required trace with Helper and Projectile operations, dual ownership links,
  post-spawn `AttackMulSet redlife` mutation, authored GetHitVar value and
  final red-life resource delta.
- Focused test, typecheck and `git diff --check`.

## Evidencia de cierre

- Evidence commit: `092e0565`.
- Required artifact: `synthetic-imported-helper-projectile-attack-redlife-snapshot-golden`.
- Trace checksum `74274e6d`, final checksum `8dbd5b52`.
- Helper/Projectile lifecycle, root/helper target links, authored
  `GetHitVar(redlife)=20` and final defender `redLife=10` pass.
- `pnpm run typecheck`, focused trace test and `git diff --check` pass.
- Aggregate `pnpm qa:trace` still stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.

## Cierre acotado

The Helper-parented creation snapshot is closed for accepted hit contact.
Guarded contacts, ModifyProjectile, shared banks, exact resource arithmetic,
rollback and full M.U.G.E.N/Ikemen parity remain outside the claim.
