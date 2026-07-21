# T361/T362 research report: Helper OverrideClsn local and RedirectID routes

Date: 2026-07-21

## Question

How should an IKEMEN Helper apply `OverrideClsn` to its own clsnproxy
geometry, and how should `RedirectID` write that override onto a verified
root or Helper target?

## Primary source

Ikemen-GO obtains a collision group by copying the current animation boxes and
walking the character's `clsnOverrides` list. Empty rectangles remove boxes;
index `-1` applies to every current box. Each tick resets collision scale,
angle, and override state before controller execution.

`overrideClsn.Run` resolves `RedirectID` before evaluating group, index, and
rectangle expressions. The original character remains the expression owner.
The target rectangle uses `c.localscl / crun.localscl`, then the engine
normalizes it before appending it to the target state.

- [getClsn and override list](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L10054-L10134)
- [per-tick collision reset](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go#L11678-L11682)
- [OverrideClsn RedirectID execution](https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go#L15338-L15392)

The source authority pin stays
`05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.

## Runtime mapping

`RuntimeHelperCollisionSystem` now asks the shared Helper current-frame
accessor for Clsn1 and Clsn2. The accessor applies Helper override state before
the existing Helper scale, facing, angle, and world-space proxy transform.
Helper snapshots and Helper HitDef read the same accessor.

For RedirectID, `HelperSystem` uses `resolveResourceRedirect`, which already
validates root ancestry, identity, target liveness, and destination revision.
The same lease then executes the collision state write and commits the target
only while it remains current. The redirect executor now owns the writeback
for resource, target, and collision paths, preserving one callback boundary.

The project represents the upstream local-scale relation as destination local
width divided by source local width. This is the same direction used by the
existing root RedirectID collision adapter because `localscl` is inverse to
local-coordinate width. Helper targets now expose their `localCoord` through
`runtimeHelperTargetActor` for that calculation.

## Evidence

- `HelperSystem.test.ts` covers dynamic local Helper values, frame reset,
  snapshot cloning, missing RedirectID target handling, Helper target
  writeback, source-context values, scaling, and redirected telemetry.
- `RuntimeHelperCollisionSystem.test.ts` covers an override before own Helper
  scale, facing, and angle composition.
- `PlayableMatchRuntime.test.ts` covers live clsnproxy geometry, a Helper to
  root resource lease, and a Helper to Helper resource lease under normal
  actor order.
- Focused Vitest passed `3/3` files and `328/328` tests.
- TypeScript 7 typecheck, `636/636` trace artifacts, production build,
  repository boundaries, redirect-boundary guard, and diff hygiene passed.

## Limits and next work

The trace corpus remains green as a regression gate, while focused runtime
tests provide the direct override geometry and lease evidence. This work does
not add a dedicated trace artifact for every OverrideClsn route.

Group-3 size overrides, exact same-tick lifetime under every actor order,
complete helper coordinate and animation-scale ordering, offset/postype,
renderer output, upstream/local differentials, rollback, and broad controller
parity remain separate work.
