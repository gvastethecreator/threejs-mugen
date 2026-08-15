# Issue 352 — Helper `ModifyProjectile` `air.velocity` matrix

## Estado

- **T778 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / airborne hit / velocity
- **Dependencia:** T686 / issue 260; T777 / issue 351

## Objetivo

Close the next Helper-owned live `ModifyProjectile air.velocity` slice for
one root-owned Projectile and one accepted airborne hit, reusing the caller
context and component-preservation seam proven by T777.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Static and finite dynamic one-, two-, and three-component writes evaluated
  once in the Helper caller context. Authored components replace the selected
  live Projectile components; omitted live siblings are preserved, and an
  omitted parameter is a no-op.
- One accepted airborne hit with `GetHitVar(xvel/yvel/zvel)`, physical response,
  target/lifecycle, and Helper/Projectile ownership evidence.

## Fuera de alcance

- Fresh/default derivation, dynamic `n`, `ModifyHitDef`, down/ground/airguard
  selection, nested Helpers, multi-target or shared/team topology, exact
  timing/rounding/landing parity, rollback, and full M.U.G.E.N/Ikemen parity.

## Authority

M.U.G.E.N 1.1 documents Projectile `air.velocity`; live `ModifyProjectile` is
Ikemen-only. The pinned Ikemen runner evaluates authored components once in the
Helper caller context, broadcasts the component-wise replacement to selected
Projectiles, preserves omitted live siblings, and treats an omitted parameter
as a no-op. The M.U.G.E.N-facing claim is limited to the documented Projectile
vector; live mutation remains an Ikemen compatibility slice.

## Acceptance evidence

- Focused compiler/Projectile/Helper tests for omission, one/two/three
  component replacement, sibling preservation, and caller-context variables.
- Required Helper -> Projectile trace with an accepted airborne hit, physical
  vector and `GetHitVar` evidence plus owner/root/parent/target links.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

Allowed claim: bounded Helper caller-context `ModifyProjectile air.velocity`
replacement for one root-owned Projectile and one accepted airborne hit.
Blocked claim: M.U.G.E.N live-Modify parity, dynamic `n`, fresh defaults,
down/ground/airguard breadth, nested/shared topology, exact timing/landing,
rollback, and full parity.
