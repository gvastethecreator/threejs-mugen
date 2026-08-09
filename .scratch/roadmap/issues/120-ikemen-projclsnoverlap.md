# Issue 120 — Ikemen `ProjClsnOverlap` projectile collision query

- Status: `closed-bounded`
- Lane: `R2 collision/runtime reads`
- Priority: `P1`

## Objective

Compare the official Ikemen `ProjClsnOverlap` trigger with the port's live
Projectile and transformed collision boundaries. Select the smallest typed
runtime seam before adding expression support.

## Source gate

The current official Ikemen reference defines
`ProjClsnOverlap(index, playerID, box_type)`. The index addresses all
projectiles owned by the caller, the target is resolved by player ID, and the
target type is `clsn1`, `clsn2`, or `size`. Current `develop` source checks the
selected projectile's Clsn1 or Clsn2 against the target, applies projectile and
target scale/angle/local coordinates, and keeps the target size box unscaled
and unrotated.

## Implementation

- `EffectActorWorld.projectilesOwnedBy` selects active caller-owned projectiles
  in insertion order, oldest first.
- `ProjectileSystem` exposes raw current AIR Clsn1/Clsn2 groups and applies
  projectile local coordinates, facing, collision scale, and collision angle
  through the shared world-box intersection boundary.
- `ExpressionEvaluator` accepts dynamic projectile index and player ID values,
  including redirected target expressions. Missing or invalid selections are
  false.
- Projectile and `ModifyProjectile` controllers now carry the official
  `projclsnscale` and `projclsnangle` fields separately from draw scale.
- The trigger is read-only and does not change combat arbitration.

## Verification

- Focused: 8 files / 258 tests pass.
- Full suite: 3363/3421 tests pass; the remaining 58 failures are the inherited
  retired-roster, Studio, and imported-log baseline.
- `pnpm typecheck`, `pnpm build`, `pnpm qa:trace` (686/686),
  `pnpm check:boundaries`, `pnpm check:redirect-boundary`, and diff hygiene
  pass.
- No browser gate was needed because this slice does not change UI behavior.

## Claim ceiling

Do not claim projectile combat arbitration, collision-proxy breadth,
perspective/depth collision scaling, complete Projectile/ModifyProjectile
parity, rollback/netplay serialization, or full Ikemen collision parity.
