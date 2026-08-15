# Issue 335 — ModifyProjectile `AttackMulSet.RedLife` guard contact

## Estado

- **T761 — queued (2026-08-14)**
- **Área:** runtime / Projectile / ModifyProjectile / guard / AttackMulSet / red-life
- **Dependencia:** T759 / issue 333; T760 / issue 334

## Objetivo

Close the next bounded red-life guard seam for a root-owned Projectile after
`ModifyProjectile` updates its live HitDef metadata. The accepted guard must
retain the Projectile's creation-time `AttackMulSet.RedLife` snapshot while
keeping authored `GetHitVar(redlife)` separate.

## Alcance permitido

- Root-owned first-generation Projectile selected by explicit `ModifyProjectile`.
- Static or finite caller-context redlife update before an accepted guard.
- One required trace plus focused integration coverage.

## Fuera de alcance

- Helper-authored ModifyProjectile, nested helpers, multi-projectile ordering,
  team/shared resource banks, exact clamp/rounding/timing, rollback and full
  M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Compiler/runtime proof that the ModifyProjectile mutation is admitted once
  and the guard consumes the creation snapshot rather than the later live
  multiplier.
- Required trace with Projectile lifecycle, ModifyProjectile operation,
  accepted guard, authored redlife readback and final defender red-life
  resource.
- Focused test, typecheck, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.
