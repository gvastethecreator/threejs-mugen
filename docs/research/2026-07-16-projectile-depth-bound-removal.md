# Research: IKEMEN projectile ProjDepthBound removal

Date: 2026-07-16
Status: implementation completed (Wayfinder 212)

## Question

How should the port remove a projectile that leaves stage depth bounds while
preserving the separate collision-depth contract from Wayfinder 211?

## Primary sources

- [IKEMEN `char.go` at develop](https://github.com/ikemen-engine/Ikemen-GO/blob/develop/src/char.go)
- [IKEMEN changed state-controller documentation](https://github.com/ikemen-engine/Ikemen-GO/wiki/State-controllers-%28changed%29#projectile-parameters)
- [Repository stage-depth research](2026-07-12-ikemen-stage-depth-bounds.md)

## Findings

The official projectile model stores three-component position and velocity,
projectile `localscl`, and an integer depth-bound field. During the active
projectile update, IKEMEN removes the projectile when its Z position is below
the stage minimum minus the depth bound or above the stage maximum plus the
depth bound. The source condition is equivalent to:

```text
posz < stageTop / projectileLocalScale - depthBound
or
posz > stageBottom / projectileLocalScale + depthBound
```

The changed-controller page names the authored parameter `ProjDepthBound` and
describes it as the Z-space counterpart of `projedgebound`: it controls how far
outside the Z boundaries a projectile may travel before removal. IKEMEN's
projectile default is effectively unbounded (`math.MaxInt32`), so omission must
not add removal to stages that already had the legacy 2D behavior.

The repository stage model stores `depthBounds` in stage-local coordinates.
Existing actor depth code converts a stage limit into actor-local units with
`(320 / stageWidth) / (320 / actorWidth)`. The projectile path should use the
same conversion with projectile `localCoord` and check only when both stage
depth bounds and an authored finite depth bound are available.

## Decision

Add optional `depthBound` to the typed Projectile operation and runtime
projectile. Use `projdepthbound` from the controller when present, clamp it to
the existing non-negative bound range, and leave it undefined when omitted.
Pass stage depth metadata through the shared projectile advance path. Mark
out-of-range Z projectiles with the existing `bounds` removal reason; do not
change collision admission, terminal animation semantics, or renderer order.

## Uncertainty and ceiling

The exact upstream integer limits and perspective draw behavior remain outside
this slice. No claim is made for proxy/helper-specific ownership beyond the
shared helper advance path, or for complete upstream parity.

## Implementation evidence

- `projdepthbound` now lowers into typed `ProjectileControllerOp.depthBound`
  and optional `RuntimeProjectile.depthBound`.
- The runtime carries stage `depthBounds` and partial stage `localCoord` through
  the shared root/helper projectile advance path.
- Stage bounds are converted with the repository's existing localcoord ratio;
  a finite authored bound expands both sides, while omission leaves Z removal
  disabled.
- Out-of-range projectiles use the existing `bounds` removal reason and expose
  their authored bound in snapshots.
- Focused tests: `140/140` passed; full suite: `216/216` files and
  `2281/2281` tests passed.
- TypeScript 7 typecheck, production build, boundary check, and trace QA all
  passed. Trace QA covered `633/633` artifacts with `0` skipped.
- Implementation commit: `fa225104`.
