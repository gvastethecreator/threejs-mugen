# Issue 335 — ModifyProjectile `AttackMulSet.RedLife` guard contact

## Estado

- **T761 — closed-bounded (2026-08-14)**
- **Área:** runtime / Projectile / ModifyProjectile / guard / AttackMulSet / red-life
- **Dependencia:** T759 / issue 333; T760 / issue 334

## Objetivo

Close the next bounded red-life guard seam for a root-owned Projectile after
`ModifyProjectile` updates its live HitDef metadata. The accepted guard must
retain the Projectile's creation-time `AttackMulSet.RedLife` snapshot while
keeping authored `GetHitVar(redlife)` separate.

## Alcance permitido

- Root-owned first-generation Projectile selected by explicit `ModifyProjectile`.
- Static or finite caller-context redlife update before an accepted guard.
- One required trace plus focused integration coverage.

## Fuera de alcance

- Helper-authored ModifyProjectile, nested helpers, multi-projectile ordering,
  team/shared resource banks, exact clamp/rounding/timing, rollback and full
  M.U.G.E.N/Ikemen parity.

## Evidencia requerida

- Compiler/runtime proof that the ModifyProjectile mutation is admitted once
  and the guard consumes the creation snapshot rather than the later live
  multiplier.
- Required trace with Projectile lifecycle, ModifyProjectile operation,
  accepted guard, authored redlife readback and final defender red-life
  resource.
- Focused test, typecheck, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

## Cierre

- Evidence/test commit: `8fd655c8` (`test(evidence): close ModifyProjectile redlife guard seam`).
- Required trace artifact: `abc0756c` -> `0d1eef66`, status `passed`.
- Focused Projectile combat and trace gates: `1/1` each; `pnpm run typecheck`
  and `git diff --check` pass.
- `pnpm run qa:trace` still stops only on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link
  blocker; the T761 artifact itself passes.
- The accepted guard keeps `GetHitVar(redlife)=40` separate and ends the
  defender at `life=20/redLife=20` after the creation multiplier `0.5`, even
  though the live attacker multiplier becomes `2`.

T762 is queued separately for the accepted unguarded-hit counterpart; it must
not widen this issue into Helper-authored `ModifyProjectile`, shared-resource
ownership, or full timing/resource parity.
