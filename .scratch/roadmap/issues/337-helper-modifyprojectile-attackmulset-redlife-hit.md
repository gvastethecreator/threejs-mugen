# Issue 337 — Helper `ModifyProjectile` `AttackMulSet.RedLife` hit contact

## Estado

- **T763 — closed-bounded (2026-08-15)**
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

## Cierre

- Evidence/test commit: `d96c7015` (`test(evidence): close Helper ModifyProjectile redlife hit seam`).
- Required trace artifact: `938303dd` -> `0073df18`, status `passed`.
- Focused Helper runtime and trace tests pass; typecheck and `git diff --check`
  pass. The full trace suite is `810/811`; its only failure is the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link case.
- `pnpm run qa:trace` reaches the same inherited blocker; the T763 artifact
  itself passes. An unrelated existing EffectActorSystem assertion still
  reports guardpoints `44` vs `0`.
- The first-generation Helper creates a root-owned Projectile, the helper's
  caller-context `ModifyProjectile` resolves `redlife=var(0),0` to `40,0`,
  and the accepted hit ends at `life=5/redLife=20` while authored
  `GetHitVar(redlife)=40` remains separate.

T764 is queued separately for the accepted guard route.
