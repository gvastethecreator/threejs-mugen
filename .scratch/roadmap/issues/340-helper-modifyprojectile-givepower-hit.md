# Issue 340 — Helper `ModifyProjectile` `givepower` hit

## Estado

- **T766 — closed-bounded (2026-08-15)**
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

## Resultado

- Evidence commit: `b2a300f1`.
- Required trace: `90cb9340` (initial `d26f12db`, final `508dbf8f`), status
  `passed`.
- The first-generation Helper creates a root-owned Projectile, applies
  `ModifyProjectile givepower=var(0)*4,var(0)-3` in Helper caller context,
  and the accepted hit leaves the defender at `life=5/power=44` with
  `GetHitVar(power)=44` visible in its hit state. Focused Helper and trace
  gates pass; typecheck and `git diff --check` pass.
- Aggregate `qa:trace` materializes this artifact but still stops on the
  inherited `synthetic-imported-helper-bind-to-target-redirect` missing target
  link. Guard contact, getpower mutation, nested/shared-resource topology,
  exact arithmetic/timing, rollback and full parity remain outside this slice.
