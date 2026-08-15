# Issue 348 — Helper `ModifyProjectile` `airguard.velocity` component preservation

## Estado

- **T774 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / air guard / velocity
- **Dependencia:** T773 / issue 347

## Objetivo

Close the next bounded Helper-owned live `ModifyProjectile airguard.velocity`
preservation matrix after the X/Y/Z component traces. Verify that omitted,
single-component, and two-component mutations preserve the live sibling
components while an accepted airborne guard exposes the resulting vector.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Omitted, single-component, and X/Y pair mutations against a seeded live
  airguard vector, with one accepted airborne guard and one required trace or
  focused integration proving the final X/Y/Z vector.
- Reuse the T771/T772/T773 component traces as controls and keep the
  root-owned Projectile lifecycle and Helper caller context explicit.

## Fuera de alcance

- Fresh/default derivation, dynamic Z expression grammar beyond the existing
  scalar seam, ground guard, nested Helpers, multiple projectiles,
  RedirectID/custom-state ownership, shared/team topology, exact 3D
  localcoord/tick/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.
- Unrelated `ModifyProjectile` fields or a score movement claim.

## Evidencia requerida

- Focused EffectActor/Projectile regression covering omission and partial
  component preservation.
- Required trace or equivalent public runtime evidence for the accepted
  airborne guard, final `GetHitVar(xvel/yvel/zvel)`, and lifecycle/ownership.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.
