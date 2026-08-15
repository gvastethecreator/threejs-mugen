# Issue 338 — Helper `ModifyProjectile` `AttackMulSet.RedLife` guard contact

## Estado

- **T764 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / red-life
- **Dependencia:** T763 / issue 337; T761 / issue 335

## Objetivo

Close the Helper-authored `ModifyProjectile` red-life snapshot for an accepted
guard. A first-generation Helper Projectile must preserve its creation-time
`AttackMulSet.RedLife` multiplier after the Helper's live `ModifyProjectile`
update, while authored `GetHitVar(redlife)` remains separate.

## Alcance permitido

- One root-owned Projectile born from a first-generation Helper.
- One explicit Helper-owned `ModifyProjectile` selection in caller context.
- One accepted guard contact, one required trace, and focused runtime coverage.

## Fuera de alcance

- Nested Helpers, multiple selected Projectiles, shared/team resource banks,
  exact clamp/rounding/timing, rollback, and full M.U.G.E.N/Ikemen parity.
- Hit contact (closed by T763), unrelated red-life controllers, and resource
  ownership beyond the proven Helper-to-root Projectile link.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted guard, authored red-life readback, target links and final red-life
  resource.
- Focused test, typecheck, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.
