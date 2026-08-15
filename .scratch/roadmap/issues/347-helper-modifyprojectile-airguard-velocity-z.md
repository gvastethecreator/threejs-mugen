# Issue 347 — Helper `ModifyProjectile` `airguard.velocity` Z component

## Estado

- **T773 — queued (2026-08-15)**
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
