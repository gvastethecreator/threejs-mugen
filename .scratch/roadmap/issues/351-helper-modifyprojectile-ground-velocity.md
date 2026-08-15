# Issue 351 — Helper `ModifyProjectile` `ground.velocity` matrix

## Estado

- **T777 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / ground velocity
- **Dependencia:** T688 / issue 262; T776 / issue 350

## Objetivo

Close the next Helper-owned live `ModifyProjectile ground.velocity` slice for
one root-owned Projectile, preserving the caller-context and component rules
already proven for `down.velocity`.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Static and finite dynamic one-, two-, and three-component writes using the
  pinned Ikemen zero-filled matrix `[x,0,0]`, `[x,y,0]`, or `[x,y,z]`.
- One accepted grounded hit with `GetHitVar(xvel/yvel/zvel)`, physical response,
  target/lifecycle, and Helper/Projectile ownership evidence.

## Fuera de alcance

- Fresh/default derivation, dynamic `n`, `ModifyHitDef`, air/airguard/down
  selection, nested Helpers, multi-target or shared/team topology, exact
  timing/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.

## Authority

M.U.G.E.N 1.1 documents Projectile `ground.velocity`; live
`ModifyProjectile` is Ikemen-only. The pinned Ikemen runner evaluates the
selected components once in the Helper caller context, broadcasts to the
selected Projectiles, zero-fills omitted trailing components, and leaves live
values unchanged when the parameter is omitted.

## Acceptance evidence

- Focused compiler/Projectile/Helper tests for omission, one/two/three
  component replacement and caller-context variables.
- Required Helper -> Projectile trace with an accepted grounded hit, physical
  vector and `GetHitVar` evidence plus owner/root/parent/target links.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

Allowed claim: bounded Helper caller-context `ModifyProjectile ground.velocity`
replacement for one root-owned Projectile and one accepted grounded hit.
Blocked claim: M.U.G.E.N live-Modify parity, dynamic `n`, fresh defaults,
down/air/airguard breadth, nested/shared topology, exact timing/rounding,
rollback, and full parity.
