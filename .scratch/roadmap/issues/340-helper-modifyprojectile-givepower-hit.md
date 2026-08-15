# Issue 340 — Helper `ModifyProjectile` `givepower` hit

## Estado

- **T766 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / hit / givepower
- **Dependencia:** T765 / issue 339; T629 root/Helper givepower plumbing

## Objetivo

Close the remaining Helper-owned `ModifyProjectile givepower` evidence for an
accepted unguarded hit. A first-generation Helper must mutate the live
Projectile givepower pair in its caller context and the contact path must
apply the authored defender power delta without conflating it with the
attacker's current power pool.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite static or `var()` givepower pair, one accepted unguarded hit and
  one required trace with defender power and `GetHitVar(power)` evidence.

## Fuera de alcance

- Guard contact, getpower mutation, nested Helpers, multiple projectiles,
  shared/team power banks, exact int32/clamp/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  ModifyProjectile fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted hit, target power delta and `GetHitVar(power)` readback.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
