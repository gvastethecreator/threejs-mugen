# Issue 336 — ModifyProjectile `AttackMulSet.RedLife` hit contact

## Estado

- **T762 — queued (2026-08-14)**
- **Área:** runtime / Projectile / ModifyProjectile / hit / AttackMulSet / red-life
- **Dependencia:** T761 / issue 335; T759 / issue 333

## Objetivo

Close the root-owned `ModifyProjectile` red-life snapshot for an accepted
unguarded hit. The Projectile must keep the creation-time `AttackMulSet.RedLife`
multiplier after its live HitDef red-life pair is replaced by
`ModifyProjectile`, while authored `GetHitVar(redlife)` remains separate.

## Alcance permitido

- Root-owned first-generation Projectile selected by explicit
  `ModifyProjectile`.
- Static or finite caller-context red-life replacement before an accepted hit.
- One required trace plus focused combat/runtime coverage.

## Fuera de alcance

- Helper-authored or nested `ModifyProjectile`, shared/team resource banks,
  multi-projectile ordering, exact clamp/rounding/timing, rollback, and full
  M.U.G.E.N/Ikemen parity.
- Guard contact (closed by T761), `ModifyProjectile` creation semantics, or
  unrelated red-life controllers.

## Evidencia requerida

- Required trace with Projectile lifecycle, `AttackMulSet`,
  `ModifyProjectile`, accepted hit, authored red-life readback and final
  defender red-life resource.
- Focused test, typecheck, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.
