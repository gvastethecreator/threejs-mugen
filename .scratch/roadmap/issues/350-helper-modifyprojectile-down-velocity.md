# Issue 350 — Helper `ModifyProjectile` `down.velocity` matrix

## Estado

- **T776 — queued (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / lying hit / velocity
- **Dependencia:** T684 / issue 258; T775 / issue 349

## Objetivo

Close the next Helper-owned live `ModifyProjectile down.velocity` slice. The
selected root-owned Projectile must receive the Helper caller's finite vector
replacement and later expose it through an accepted lying hit.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Static and finite dynamic one-, two-, and three-component writes using the
  pinned Ikemen zero-filled matrix: `[x,0,0]`, `[x,y,0]`, or `[x,y,z]`.
- One accepted lying hit with `GetHitVar(xvel/yvel/zvel)`, physical response,
  target/lifecycle, and Helper/Projectile ownership evidence.

## Fuera de alcance

- Fresh/default derivation, inheritance recalculation, dynamic `n`,
  `ModifyHitDef`, air/airguard/ground selection, nested Helpers, multi-target
  or shared/team topology, exact landing/tick/rounding parity, rollback, and
  full M.U.G.E.N/Ikemen parity.

## Authority

M.U.G.E.N 1.1 documents Projectile `down.velocity` and its inheritance from
HitDef; `ModifyProjectile` is Ikemen-only. The pinned Ikemen runner evaluates
the selected components once in the Helper caller context, broadcasts to the
selected Projectiles, zero-fills omitted trailing components, and leaves live
values unchanged when the parameter is omitted.

## Acceptance evidence

- Focused compiler/Projectile/Helper tests for omission, one/two/three
  component replacement and caller-context variables.
- Required Helper -> Projectile trace with a real lying guard/hit route,
  physical vector and `GetHitVar` evidence plus owner/root/parent/target links.
- `pnpm run typecheck`, `git diff --check`, and aggregate QA recorded with
  inherited blockers preserved.

Allowed claim: bounded Helper caller-context `ModifyProjectile down.velocity`
replacement for one root-owned Projectile and one accepted lying hit.
Blocked claim: M.U.G.E.N live-Modify parity, dynamic `n`, fresh defaults,
air/airguard/ground breadth, nested/shared topology, exact timing/landing,
rollback, and full parity.
