# Issue 345 — Helper `ModifyProjectile` `airguard.velocity` air guard

## Estado

- **T771 — closed-bounded (2026-08-15)**
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

## Resultado

T771 is closed-bounded in evidence commit `c3438d6e`. The required trace
`synthetic-imported-helper-modifyprojectile-airguard-velocity` passes with
trace checksum `641792d6` (`b7850d2e` -> `61647146`). A first-generation Helper
spawns the root-owned Projectile, executes live `ModifyProjectile` with
`airguard.velocity = var(0)` (`var(0)=6`), and reaches an accepted airborne
guard. The defender ends at life `998`; the trace observes the replaced
physical X response (`maxVel.x=6`) and the guarded route. Sibling-component
preservation is intentionally not claimed by this one-component slice.

## Verificación

- Focused `RuntimeTraceGatePresets` test: 1/1 passed.
- `pnpm run typecheck`: passed.
- `git diff --check`: passed.
- Aggregate `pnpm run qa:trace`: T771 artifact passed; the command still exits
  on the inherited `synthetic-imported-helper-bind-to-target-redirect` target
  link blocker.

## Siguiente

Queue T772 in [issue 346](346-helper-modifyprojectile-airguard-velocity-y.md)
for the Helper-owned live `airguard.velocity` Y component. Keep Z and the
partial-component matrix separate.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted airborne guard, changed X velocity, `GetHitVar(xvel)` and final
  defender physics.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
