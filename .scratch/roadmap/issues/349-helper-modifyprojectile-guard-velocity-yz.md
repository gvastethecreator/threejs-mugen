# Issue 349 — Helper `ModifyProjectile` `guard.velocity` Y/Z matrix

## Estado

- **T775 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / ground guard / velocity
- **Dependencia:** T770 / issue 344; T774 / issue 348

## Objetivo

Close the next bounded Helper-owned live `ModifyProjectile guard.velocity`
ground-guard extension after the proven X path. Verify the Ikemen-only Y/Z
components reach the selected root-owned Projectile and are consumed by an
accepted ground guard without conflating the airborne `airguard.velocity`
route.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Static and finite dynamic Y/Z component writes, with the pinned
  zero-filled one/two/three-component matrix and an omitted-parameter no-op.
- One accepted ground guard with `GetHitVar(yvel/zvel)`, physical velocity,
  lifecycle, owner, and target evidence.

## Fuera de alcance

- Fresh/default derivation, airborne guard, nested Helpers, multiple
  projectiles, RedirectID/custom-state ownership, shared/team topology, exact
  localcoord/tick/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.
- Reopening the already-closed Helper X path or adding new Projectile fields.

## Authority

M.U.G.E.N 1.1 documents the ground `guard.velocity` X contract; Y/Z are an
Ikemen extension. The pinned Ikemen `ModifyProjectile` runner evaluates the
authored components in the caller context, writes the selected Projectile's
components, and zero-fills omitted trailing components when the controller is
present. An omitted parameter is a no-op.

## Evidencia requerida

- Focused compiler/Projectile/Helper coverage for omission, Y-only, Y/Z pair,
  and explicit triple replacement, including preservation of the selected
  X path where applicable.
- Required runtime evidence for Helper/Projectile lifecycle, accepted ground
  guard, `GetHitVar(yvel/zvel)`, physical response, owner, and target links.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

## Claim allowed / blocked

Allowed: bounded Helper caller-context Y/Z `ModifyProjectile guard.velocity`
replacement for one root-owned Projectile and one accepted ground guard.
Blocked: M.U.G.E.N claim for Y/Z, fresh defaults, airborne guard, nested/shared
topology, exact physical/tick parity, rollback, and full parity.

