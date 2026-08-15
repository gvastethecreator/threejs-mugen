# Issue 338 — Helper `ModifyProjectile` `AttackMulSet.RedLife` guard contact

## Estado

- **T764 — closed-bounded (2026-08-15)**
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

## Cierre

- Evidence/test commit: `90156937` (`test(evidence): close Helper ModifyProjectile redlife guard seam`).
- Required trace artifact: `4e97fdba` -> `eff1e719`, status `passed`.
- Focused trace coverage is green; the combined red-life trace selection is
  4/4, typecheck and `git diff --check` pass.
- `pnpm run qa:trace` stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link case;
  the T764 artifact itself passes. The pre-existing EffectActor guardpoints
  assertion remains separate.
- The first-generation Helper creates a root-owned Projectile, its caller
  context resolves `redlife=var(0),var(0)` to `40,40`, and the accepted guard
  ends at `life=20/redLife=20` while authored `GetHitVar(redlife)=40` remains
  separate.

T765 is queued separately for Helper-owned `ModifyProjectile getpower` hit
  readback.
