# Issue 350 — Helper `ModifyProjectile` `down.velocity` matrix

## Estado

- **T776 — closed-bounded (2026-08-15)**
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

## Closure evidence

- Evidence commit: `a47c329c`.
- Required trace: `synthetic-imported-helper-modifyprojectile-down-velocity`
  with trace checksum `becc3b9c` (final artifact checksum recorded by the QA
  runner in `.scratch/qa/trace-gates/`), passed independently.
- Focused compiler/Projectile/Helper coverage passes: RuntimeCompiler `3/3`,
  ProjectileSystem `2/2`, EffectActorSystem ModifyProjectile selection `12/12`,
  and the required trace `1/1`.
- The trace proves Helper caller variables `-3,-5` replace adversarial live
  down velocity `-1,-1,9` with the pinned zero-filled pair `[3,-5,0]` before an
  accepted lying hit. `GetHitVar(xvel/yvel/zvel)`, physical `HitVelSet`, target
  links, Helper/Projectile lifecycle, and root/helper ownership all pass.
- `pnpm run typecheck` and `git diff --check` pass. Aggregate `pnpm run
  qa:trace` still reports only the inherited
  `synthetic-imported-helper-bind-to-target-redirect` target-link blocker.

## Next bounded slice

T777 is closed in issue 351. T778 is closed-bounded in issue 352 for the
analogous Helper-owned live `ModifyProjectile air.velocity` component matrix.
T779 is queued in issue 353 for its multi-Projectile broadcast/isolation
extension; it remains
separate from down/ground/airguard selection and from fresh/default derivation.
