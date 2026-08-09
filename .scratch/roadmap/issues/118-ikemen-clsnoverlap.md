# Issue 118 — Ikemen `ClsnOverlap` player collision query

- Status: `closed-bounded`
- Lane: `R2 collision/runtime reads`
- Priority: `P1`

## Objective

Expose the official Ikemen `ClsnOverlap` trigger through the existing
transformed world-box collision system and shared expression contexts.

## Source gate

Use the official [Ikemen new triggers reference](https://github-wiki-see.page/m/ikemen-engine/Ikemen-GO/wiki/Triggers-%28new%29)
and current `develop` compiler/runtime source. The contract is
`ClsnOverlap(box_type_1, playerID, box_type_2)`, where both types are `clsn1`,
`clsn2`, or `size`. It returns `1` when the current player's selected boxes
overlap the target player's selected boxes and must use transformed collision
geometry, including angle and scale.

## Candidate fixture

- Resolve the target by dynamic player ID.
- Cover `clsn1`, `clsn2`, and `size` pairs.
- Reuse the existing transformed world-box intersection path.
- Prove overlap, separation, missing player, redirect, scale, and angle cases.
- Carry the result through CNS/controller contexts.

## Closeout

- `RuntimeFrameSystem.runtimeClsnOverlap` resolves current AIR, `OverrideClsn`,
  and `size` boxes through player-ID lookup.
- Non-size boxes apply `localcoord`, facing, scale, and angle before the shared
  world-box intersection. Size boxes keep Ikemen's no-scale/no-rotation rule.
- CNS/controller contexts accept dynamic IDs, inline redirects such as
  `EnemyNear, ID`, and return false for missing players.
- Focused coverage passes 5 files / 83 tests. Typecheck, production build,
  boundaries, and the fresh 686/686 trace corpus pass.

## Claim ceiling

Do not claim Projectile overlap, collision-proxy breadth, broad hit resolution,
Helper ownership, rollback/netplay serialization, or complete collision parity.
