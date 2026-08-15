# Issue 344 — Helper `ModifyProjectile` `guard.velocity` guard

## Estado

- **T770 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / velocity
- **Dependencia:** T687 / issue 261; T769 / issue 343

## Objetivo

Close the Helper-owned live `ModifyProjectile guard.velocity` evidence for an
accepted ground guard. The Helper caller-context replacement must reach the
selected root-owned Projectile and change the guarded velocity metadata and
physical response without conflating it with `airguard.velocity`.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite dynamic X component, one accepted ground guard, and one required
  trace with `GetHitVar(xvel)` plus defender velocity evidence.

## Fuera de alcance

- Airborne guard, Y/Z extension breadth, partial-component matrix beyond the
  single X value, nested Helpers, multiple projectiles, shared/team topology,
  exact localcoord/tick/rounding parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted ground guard, changed X velocity, `GetHitVar(xvel)` and final
  defender physics.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.

## Evidencia de cierre

- **T770 — closed-bounded (2026-08-15).** Evidence commit: `3c7ca64c`.
- Required trace: `3d47deb8` (`fcbebd7b` -> `ae032d99`), status `passed`.
- The Helper resolves `ModifyProjectile guard.velocity=var(0)` with
  `var(0)=-8` before the accepted ground guard. The root-owned Projectile
  replaces the seeded X value `-1`; the defender records
  `GetHitVar(xvel)=8`, receives the physical guard velocity, and ends at life
  `20` after the authored guard damage.
- Focused trace, `pnpm run typecheck`, and `git diff --check` pass. Aggregate
  `pnpm run qa:trace` still stops only at the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link case.

## Siguiente corte

T771 is queued for the bounded Helper-owned `ModifyProjectile airguard.velocity`
air-guard slice. Keep Y/Z breadth beyond the selected component, nested/shared
resource topology, aggregate QA repair, exact timing/rounding, rollback and
full M.U.G.E.N/Ikemen parity separate.
