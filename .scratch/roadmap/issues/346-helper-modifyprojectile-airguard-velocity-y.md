# Issue 346 — Helper `ModifyProjectile` `airguard.velocity` Y component

## Estado

- **T772 — closed-bounded (2026-08-15)**
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

## Resultado

T772 is closed-bounded in evidence commit `309eb94a`. The required trace
`synthetic-imported-helper-modifyprojectile-airguard-velocity-y` passes with
trace checksum `8b9552db` (`b7850d2e` -> `bce06ab9`). A first-generation Helper
spawns the root-owned Projectile, executes live
`ModifyProjectile airguard.velocity = -2,var(1)` with `var(1)=-8`, and reaches
an accepted airborne guard. The defender ends at life `998`; the trace
observes the replaced physical Y response and the guarded route. X is kept as
the control component; Z/default derivation remains outside this slice.

## Verificación

- Focused `EffectActorSystem` Helper test: passed.
- Focused `RuntimeTraceGatePresets` T772 test: 1/1 passed.
- `pnpm run typecheck`: passed.
- `git diff --check`: passed.
- Aggregate `pnpm run qa:trace`: T771 and T772 artifacts pass; the command
  still exits on inherited `synthetic-imported-helper-bind-to-target-redirect`
  target-link blocker.

## Siguiente

Queue T773 in [issue 347](347-helper-modifyprojectile-airguard-velocity-z.md)
for the Helper-owned live `airguard.velocity` Z component. Keep exact 3D
depth/rounding and the full component matrix separate.
