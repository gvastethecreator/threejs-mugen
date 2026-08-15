# Issue 339 — Helper `ModifyProjectile` `getpower` hit readback

## Estado

- **T765 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / hit / getpower
- **Dependencia:** T764 / issue 338; T630 / root `ModifyProjectile getpower`

## Objetivo

Close the missing Helper-owned `ModifyProjectile getpower` evidence for an
accepted unguarded hit. A root-owned Projectile born from a first-generation
Helper must receive the Helper caller-context `getpower` replacement and expose
the authored hit-power delta through the accepted contact path.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite static or `var()` getpower pair, one accepted unguarded hit and
  one required trace with attacker power/readback evidence.

## Fuera de alcance

- Givepower mutation, guard contact, nested Helpers, multiple projectiles,
  shared/team power banks, exact int32/clamp/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and ModifyProjectile fields
  unrelated to `getpower`.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted hit, `GetHitVar(power)` and attacker power delta.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.
