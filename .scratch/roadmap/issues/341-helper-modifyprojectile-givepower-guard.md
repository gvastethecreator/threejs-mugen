# Issue 341 — Helper `ModifyProjectile` `givepower` guard

## Estado

- **T767 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / givepower
- **Dependencia:** T766 / issue 340; T629 root/Helper givepower plumbing

## Objetivo

Close the Helper-owned `ModifyProjectile givepower` evidence for an accepted
guard contact. The Helper caller-context replacement must reach the guarded
Projectile path and expose the authored guard power delta without conflating
it with the attack-hit branch.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite static or `var()` givepower pair, one accepted guard and one
  required trace with defender power and `GetHitVar(power)` evidence.

## Fuera de alcance

- Unguarded hit, getpower mutation, nested Helpers, multiple projectiles,
  shared/team power banks, exact int32/clamp/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  ModifyProjectile fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted guard, target power delta and guarded `GetHitVar(power)` readback.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.

## Evidencia de cierre

- Evidence commit: `4b791ec8`.
- Required trace: `200a587b` (`1cffcc6b` -> `ab40f848`), status `passed`.
- The Helper-owned `ModifyProjectile` resolves
  `givepower=var(0)*4,var(0)-3` before the accepted guard; the root-owned
  Projectile leaves the defender at `life=20`, `power=8`, with the guarded
  lifecycle and `GetHitVar(power)=8` evidence present.
- Focused snapshot test, `pnpm run typecheck`, and `git diff --check` pass.
- Aggregate `pnpm run qa:trace`: required artifacts are green, but the suite
  still exits on the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link case.

## Cierre y siguiente corte

This bounded evidence closes T767. It does not claim unguarded/getpower
parity, nested Helpers, shared power banks, exact int32/clamp/timing, rollback,
or full M.U.G.E.N/Ikemen parity. T768 is queued in issue 342 for the analogous
Helper `ModifyProjectile getpower` guard readback.
