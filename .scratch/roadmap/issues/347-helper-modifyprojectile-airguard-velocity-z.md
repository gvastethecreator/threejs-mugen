# Issue 347 — Helper `ModifyProjectile` `airguard.velocity` Z component

## Estado

- **T773 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / air guard / velocity / depth
- **Dependencia:** T772 / issue 346

## Objetivo

Close the next Helper-owned live `ModifyProjectile airguard.velocity` slice:
one finite dynamic Z component must reach an accepted airborne guard on the
selected root-owned Projectile and remain observable through `GetHitVar(zvel)`
and the defender's depth response.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite dynamic Z component, controlled X/Y components, one accepted
  airborne guard, and one required trace with lifecycle, guarded contact,
  `GetHitVar(zvel)`, and physical depth evidence.
- Reuse T771/T772 X/Y routes as controls without reopening their seams.

## Fuera de alcance

- Fresh/default Z derivation, full partial-component preservation, ground guard,
  nested Helpers, multiple projectiles, shared/team topology, exact 3D
  localcoord/tick/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted airborne guard, changed Z velocity, `GetHitVar(zvel)`, and final
  defender depth response.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.

## Resultado

- **Evidence commit:** `44361ac3`
- **Required trace:** `c1d1e70f` (`b7850d2e` -> `76075e30`)
- **Gate:** passed; Helper, root-owned Projectile, live `ModifyProjectile`,
  accepted airborne guard, `GetHitVar(zvel)` and physical depth response are
  all present. The defender ends at life `998` and the guarded branch reaches
  state `5115` with `maxVelZ=9`.
- **Verification:** focused EffectActor and RuntimeTraceGatePresets tests pass;
  `pnpm run typecheck` and `git diff --check` pass. Aggregate `pnpm run
  qa:trace` still stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.
- **Ceiling:** fresh/default derivation, full partial-component preservation,
  ground guard, nested/shared-resource topology, exact 3D timing/rounding,
  rollback and full M.U.G.E.N/Ikemen parity remain outside this slice.
