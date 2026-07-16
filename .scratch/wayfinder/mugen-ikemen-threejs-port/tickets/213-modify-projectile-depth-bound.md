# Implement ModifyProjectile ProjDepthBound/v1

Type: task
Status: resolved
Blocked by: None

## Question

Does `ModifyProjectile` own the same `projdepthbound` parameter as `Projectile`,
and what is the smallest compatible mutation contract for the port?

## Answer

Add optional `depthBound` to the typed ModifyProjectile operation and runtime
resolver. Resolve static and dynamic `projdepthbound` values through the existing
number-parameter path, normalize finite values to the runtime's non-negative
bound, and apply the mutation only to active projectiles selected by the current
owner/id contract.

## Authority

- IKEMEN's `modifyProjectile` compiler calls the shared `projectileSub`, and that
  shared parser includes `projdepthbound`.
- IKEMEN stores `depthbound` on each projectile, so a ModifyProjectile update
  changes the same state used by active Z-bound removal.
- The changed-controller page defines `ProjDepthBound` as the Z-space removal
  boundary counterpart of `projedgebound`.

## Boundaries

Included: typed operation, static/dynamic controller resolution, active runtime
mutation, and focused diagnostics.

Deferred: redirect destination breadth, helper/team ownership expansion,
perspective rendering, collision admission, cancel timing, rollback/netplay,
and complete MUGEN/IKEMEN parity.

## Verification target

- Compiler test covers static `projdepthbound` lowering.
- Projectile runtime tests cover static, dynamic, negative normalization, and
  terminal/removal immutability.
- TypeScript 7, full suite, production build, boundaries, and trace QA at the
  next accumulated checkpoint.

## Sources

- `docs/research/2026-07-16-modify-projectile-depth-bound.md`

## Implementation result

- Added typed `ModifyProjectileControllerOp.depthBound` lowering from static
  `projdepthbound`.
- Added `projdepthbound` to the dynamic ModifyProjectile number resolver used by
  root and helper dispatch paths.
- Active matching projectiles now mutate their bound through the same
  non-negative finite normalization used at spawn; missing values are no-ops.
- Removed and terminal projectiles remain immutable, preserving lifecycle
  ownership and terminal playback behavior.

## Evidence

- Focused compiler/projectile/effect-spawn/helper tests: `118/118` passed.
- `pnpm typecheck`: passed.
- Full suite: `216/216` files and `2282/2282` tests passed.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed, `0` skipped; artifacts in
  `.scratch/qa/trace-gates`.
- Code commit: `f6b2a227` (`feat(runtime): mutate projectile depth bounds`).

Claim ceiling: typed/runtime mutation under the existing owner/id selection
contract is evidenced. Redirect breadth, perspective rendering, collision
admission, cancel timing, rollback/netplay, and complete parameter parity stay
open.
