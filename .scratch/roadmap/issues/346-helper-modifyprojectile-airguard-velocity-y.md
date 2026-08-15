# Issue 346 — Helper `ModifyProjectile` `airguard.velocity` Y component

## Estado

- **T772 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / air guard / velocity
- **Dependencia:** T771 / issue 345

## Objetivo

Close the next Helper-owned live `ModifyProjectile airguard.velocity` slice:
one finite dynamic Y component must reach an accepted airborne guard on the
selected root-owned Projectile and remain observable through `GetHitVar(yvel)`
and defender physics.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite dynamic Y component, one accepted airborne guard, one required
  trace with lifecycle, guarded contact, `GetHitVar(yvel)`, and physical Y
  evidence.
- Reuse T771's X route as a control without reopening its implementation.

## Fuera de alcance

- Dynamic Z, fresh/default derivation, full partial-component preservation,
  ground guard, nested Helpers, multiple projectiles, shared/team topology,
  exact localcoord/tick/rounding parity, rollback, and full M.U.G.E.N/Ikemen
  parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted airborne guard, changed Y velocity, `GetHitVar(yvel)`, and final
  defender physics.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
