# Issue 342 — Helper `ModifyProjectile` `getpower` guard

## Estado

- **T768 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / guard / getpower
- **Dependencia:** T765 / issue 339; T767 / issue 341

## Objetivo

Close the Helper-owned `ModifyProjectile getpower` evidence for an accepted
guard contact. The Helper caller-context replacement must reach the guarded
Projectile path and expose the authored attacker power delta without
conflating it with `givepower` or the unguarded hit branch. In the official
runtime, `getpower` changes the attacker's power bank; `GetHitVar(power)` is a
`givepower` readback on the defender and is therefore intentionally not used
as proof for this cut.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- One finite static or `var()` getpower pair, one accepted guard and one
  required trace with attacker power plus guarded `GetHitVar(guarded)=1`
  evidence.

## Fuera de alcance

- Unguarded hit, givepower mutation, nested Helpers, multiple projectiles,
  shared/team power banks, exact int32/clamp/timing parity, rollback and full
  M.U.G.E.N/Ikemen parity.
- Helper-owned RedirectID/custom-state ownership and unrelated
  `ModifyProjectile` fields.

## Evidencia requerida

- Required trace proving Helper/Projectile lifecycle, live `ModifyProjectile`,
  accepted guard, attacker power delta and guarded `GetHitVar(guarded)=1`
  readback. It must not use `GetHitVar(power)` as a proxy for `getpower`.
- Focused Helper/Projectile test, typecheck, `git diff --check`, and aggregate
  QA recorded with inherited blockers preserved.

## Evidencia de cierre

- Evidence commit: `c61755fa`.
- Required trace: `0c233b3f` (`8a99549b` -> `7587197d`), status `passed`.
- The Helper-owned `ModifyProjectile` resolves
  `getpower=var(0)*4,var(0)-3` in Helper context before an accepted guard;
  the root-owned Projectile adds the guard reward `8` to the attacker, whose
  final power is `8`, while the defender remains at life `20` and records
  `GetHitVar(guarded)=1`.
- Focused snapshot and Helper/Projectile getpower tests, `pnpm run typecheck`,
  and `git diff --check` pass.
- `GetHitVar(power)` is intentionally not claimed here: the pinned runtime
  exposes it as the defender's `givepower`, not the attacker's `getpower`.
- Aggregate `pnpm run qa:trace` remains stopped by the inherited
  `synthetic-imported-helper-bind-to-target-redirect` missing target-link case.

## Cierre y siguiente corte

This bounded evidence closes T768. T769 is closed in issue 343. T770 is queued
for the next Helper-owned `ModifyProjectile guard.velocity` guard slice; see
issue 344.
