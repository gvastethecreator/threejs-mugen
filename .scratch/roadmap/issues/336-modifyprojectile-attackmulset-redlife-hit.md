# Issue 336 — ModifyProjectile `AttackMulSet.RedLife` hit contact

## Estado

- **T762 — closed-bounded (2026-08-15)**
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

## Cierre

- Evidence/test commit: `a98fb9c0` (`test(evidence): close ModifyProjectile redlife hit seam`).
- Required trace artifact: `a09849a1` -> `fff29f85`, status `passed`.
- Projectile combat suite: `111/111`; focused trace: `1/1`; typecheck and
  `git diff --check` pass.
- `pnpm run qa:trace` still stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link
  blocker; the T762 artifact itself passes.
- The accepted hit keeps `GetHitVar(redlife)=40` separate and ends at
  `life=5/redLife=20` after the creation multiplier `0.5`, even though the
  live attacker multiplier becomes `2`.

T763 is queued separately for the Helper-authored `ModifyProjectile` route.
