# Issue 343 — Helper `ModifyProjectile` `damage` guard

## Estado

- **T769 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / damage
- **Dependencia:** T709 / issue 283; T768 / issue 342

## Objetivo

Close the Helper-owned `ModifyProjectile damage` evidence for an accepted
guard contact. The Helper caller-context replacement must reach the guarded
Projectile path and expose the authored guard-damage component without
conflating it with the original Projectile damage or the hit branch.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite dynamic damage pair, one accepted guard and one required trace
  with `GetHitVar(guarddamage)` and defender life evidence.

## Fuera de alcance

- Unguarded hit, nested Helpers, multiple projectiles, complete damage scaling,
  negative/healing damage, exact rounding/int32/timing parity, shared/team
  resources, rollback and full M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted guard, changed guard-damage value, guarded `GetHitVar(guarddamage)`
  readback and final defender life.
- Focused trace test, typecheck, `git diff --check`, and aggregate QA recorded
  with inherited blockers preserved.

## Evidencia de cierre

- Evidence commit: `79c377cd`.
- Required trace: `65253f37` (`1c4e9c53` -> `fb2ad29f`), status `passed`.
- Helper `ModifyProjectile damage=var(0)*3,var(0)-1` resolves to guard damage
  `10`; the accepted guard leaves the defender at life `40` and the guarded
  branch proves `GetHitVar(guarddamage)=10`.
- Focused trace, typecheck and diff hygiene pass. Aggregate QA retains the
  inherited Helper bind-to-target missing-link blocker.
