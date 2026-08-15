# Issue 342 — Helper `ModifyProjectile` `getpower` guard

## Estado

- **T768 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / getpower
- **Dependencia:** T765 / issue 339; T767 / issue 341

## Objetivo

Close the Helper-owned `ModifyProjectile getpower` evidence for an accepted
guard contact. The Helper caller-context replacement must reach the guarded
Projectile path and expose the authored attacker power delta without
conflating it with `givepower` or the unguarded hit branch.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite static or `var()` getpower pair, one accepted guard and one
  required trace with attacker power and guarded `GetHitVar(power)` evidence.

## Fuera de alcance

- Unguarded hit, givepower mutation, nested Helpers, multiple projectiles,
  shared/team power banks, exact int32/clamp/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted guard, attacker power delta and guarded `GetHitVar(power)` readback.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
