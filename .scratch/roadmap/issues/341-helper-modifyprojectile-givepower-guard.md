# Issue 341 — Helper `ModifyProjectile` `givepower` guard

## Estado

- **T767 — queued (2026-08-15)**
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
