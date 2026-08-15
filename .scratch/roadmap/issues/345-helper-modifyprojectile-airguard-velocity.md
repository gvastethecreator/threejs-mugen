# Issue 345 — Helper `ModifyProjectile` `airguard.velocity` air guard

## Estado

- **T771 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / air guard / velocity
- **Dependencia:** T770 / issue 344

## Objetivo

Close the Helper-owned live `ModifyProjectile airguard.velocity` evidence for
one accepted airborne guard. The Helper caller-context replacement must reach
the selected root-owned Projectile and change the guarded air velocity without
conflating it with ground `guard.velocity`.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite dynamic X component, one accepted airborne guard, one required
  trace with `GetHitVar(xvel)` and defender velocity evidence.

## Fuera de alcance

- Ground guard, Y/Z breadth, partial-component matrices beyond the selected X
  value, nested Helpers, multiple projectiles, shared/team topology, exact
  localcoord/tick/rounding parity, rollback and full M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted airborne guard, changed X velocity, `GetHitVar(xvel)` and final
  defender physics.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
