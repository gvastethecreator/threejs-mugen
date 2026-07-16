# Implement Projectile ProjDepthBound removal/v1

Type: task
Status: resolved
Blocked by: None

## Question

What bounded runtime contract closes the remaining projectile depth-bound gap
without conflating Z removal with Z collision admission or render ordering?

## Answer

Implement optional `projdepthbound`/`ProjDepthBound` on authored projectiles.
Keep omission equivalent to IKEMEN's effectively infinite default. When a stage
has depth bounds, convert those stage-local limits into projectile-local units,
expand them by the authored depth bound, and mark the projectile for ordinary
`bounds` removal after its Z position crosses either limit. Apply the same
contract to root and helper-owned projectile actors through the shared advance
path.

## Authority

- IKEMEN `char.go` stores projectile `pos`, `velocity`, `localscl`, and
  `depthbound`; its update path removes an active projectile when Z crosses the
  stage depth limits expanded by `depthbound`.
- IKEMEN's changed-controller documentation names `ProjDepthBound` and defines
  it as the Z-space counterpart of `projedgebound`.
- Repository stage research already pins `topbound`/`botbound` conversion by
  stage and actor localcoord.

## Boundaries

Included: compiler lowering, runtime spawn state, root/helper advance, stage
localcoord conversion, bounds removal, and snapshot observability.

Deferred: depth collision, projection/render ordering, perspective scaling,
cancel timing, rollback/netplay, and complete MUGEN/IKEMEN parity.

## Verification target

- Focused compiler/projectile/effect-actor tests with disabled, inclusive-edge,
  and separated-stage-bound cases.
- TypeScript 7, full suite, production build, boundaries, and trace QA at the
  accumulated checkpoint.

## Sources

- `docs/research/2026-07-16-projectile-depth-bound-removal.md`

## Implementation result

- Added typed `depthBound` lowering from `projdepthbound`.
- Preserved omission as `undefined`, so legacy stages do not gain a synthetic
  Z-removal boundary.
- Converted stage `depthBounds` into projectile-local units using the shared
  localcoord scale and applied inclusive `bounds` removal in the common
  projectile advance path.
- Propagated stage depth metadata through the runtime stage source and effect
  world, covering root and helper-owned projectiles without changing collision
  admission or presentation ordering.
- Exposed authored depth bounds in projectile snapshots for diagnostics.

## Evidence

- Focused compiler/projectile/effect-actor tests: `140/140` passed.
- `pnpm typecheck`: passed.
- Full suite: `216/216` files and `2281/2281` tests passed.
- `pnpm build`: passed; existing large-chunk warning remains.
- `pnpm check:boundaries`: passed.
- `pnpm qa:trace`: `633/633` artifacts passed, `0` skipped; artifacts in
  `.scratch/qa/trace-gates`.
- Code commit: `fa225104` (`feat(runtime): implement projectile depth-bound removal`).

Claim ceiling: runtime/compiler compatibility and shared root/helper advance
are evidenced. Perspective rendering, proxy/helper collision depth, cancel
timing, rollback/netplay, and complete upstream parity remain open.
