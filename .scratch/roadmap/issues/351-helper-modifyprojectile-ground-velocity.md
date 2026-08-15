# Issue 351 — Helper `ModifyProjectile` `ground.velocity` matrix

## Estado

- **T777 — closed-bounded (2026-08-15)**
- **Área:** runtime / Helper / Projectile / ModifyProjectile / ground velocity
- **Dependencia:** T688 / issue 262; T776 / issue 350

## Objetivo

Close the next Helper-owned live `ModifyProjectile ground.velocity` slice for
one root-owned Projectile, preserving the caller-context and component rules
already proven for `down.velocity`.

## Alcance permitido

- One first-generation Helper and one root-owned Projectile selected by an
  explicit Helper-owned `ModifyProjectile`.
- Static and finite dynamic one-, two-, and three-component writes in the
  Helper caller context. Authored components replace the selected live
  Projectile components; omitted live siblings are preserved, and an omitted
  parameter is a no-op.
- One accepted grounded hit with `GetHitVar(xvel/yvel/zvel)`, physical response,
  target/lifecycle, and Helper/Projectile ownership evidence.

## Fuera de alcance

- Fresh/default derivation, dynamic `n`, `ModifyHitDef`, air/airguard/down
  selection, nested Helpers, multi-target or shared/team topology, exact
  timing/rounding parity, rollback, and full M.U.G.E.N/Ikemen parity.

## Authority

M.U.G.E.N 1.1 documents Projectile `ground.velocity`; live
`ModifyProjectile` is Ikemen-only. The pinned Ikemen runner evaluates the
authored components once in the Helper caller context, broadcasts the
component-wise replacement to the selected Projectiles, preserves omitted
live siblings, and leaves live values unchanged when the parameter is omitted.

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

## Closure evidence

- Evidence commit: `2a03d5db`.
- Required trace: `synthetic-imported-helper-modifyprojectile-ground-velocity`
  with trace checksum `52926706`; the artifact passed independently.
- Focused coverage passes: RuntimeCompiler `3/3`, ProjectileSystem
  ground-velocity coverage `4/4`, the Helper EffectActor matrix `1/1`, and the
  required trace `1/1`.
- The trace proves Helper caller variables `-7,-5` replace the selected
  root-owned Projectile ground X/Y while preserving Z, then reach an accepted
  grounded hit with `GetHitVar(xvel/yvel/zvel)=7/-5/0`, physical `HitVelSet`,
  target links, Helper/Projectile lifecycle, and root/helper/parent ownership.
- `pnpm run typecheck` and `git diff --check` pass. Aggregate
  `pnpm run qa:trace` still reports only the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.

## Next bounded slice

T778 is closed-bounded in issue 352 for the analogous Helper-owned live
`ModifyProjectile air.velocity` matrix on one accepted airborne hit. T779 is
queued in issue 353 for the multi-Projectile broadcast/isolation extension.
Fresh
defaults and other vector families remain separate.
