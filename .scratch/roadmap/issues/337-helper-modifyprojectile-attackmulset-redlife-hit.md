# Issue 337 — Helper `ModifyProjectile` `AttackMulSet.RedLife` hit contact

## Estado

- **T763 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / hit / red-life
- **Dependencia:** T762 / issue 336; T760 / issue 334

## Objetivo

Close the Helper-authored `ModifyProjectile` red-life snapshot for an accepted
unguarded hit. A Projectile created through a Helper must preserve its
creation-time `AttackMulSet.RedLife` multiplier after the Helper's live
`ModifyProjectile` update, while authored `GetHitVar(redlife)` remains separate.

## Alcance permitido

- One root-owned Projectile born from a first-generation Helper.
- One explicit Helper-owned `ModifyProjectile` selection in caller context.
- One required trace plus focused Helper/Projectile combat coverage.

## Fuera de alcance

- Nested Helpers, multiple selected Projectiles, shared/team resource banks,
  exact clamp/rounding/timing, rollback, and full M.U.G.E.N/Ikemen parity.
- Guard contact (separate after the hit route), unrelated red-life controllers,
  and resource-owner topology beyond the proven Helper-to-root Projectile link.

## Evidencia requerida

- Required trace proving Helper, Projectile spawn/active lifecycle,
  `ModifyProjectile`, accepted hit, target links, authored red-life readback
  and final red-life resource.
- Focused test, typecheck, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.
