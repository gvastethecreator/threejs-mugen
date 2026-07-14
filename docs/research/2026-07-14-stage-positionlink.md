# Research: stage positionlink

## Question

How can linked background elements retain the authored relationship while the
Three.js adapter keeps snapshots immutable?

## Primary sources

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [IKEMEN-GO stage loader and runtime](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/stage.go)

Elecbyte defines `positionlink = 1` as an offset from the preceding linked
background position and says the linked element's `delta` is ignored. The
IKEMEN-GO loader carries the link from the last non-linked background, copies
its initial velocity and delta, and the runtime updates linked stage position
through the same background-control path.

## Decision

Preserve a typed `positionLink` target and authored offset in
`MugenStageLayer`. The parser resolves the static authored start/delta for
reports and fallback consumers. At render time, `resolveStageLayerForTick`
resolves the target at the same background tick, then applies the link offset
before the child layer's own bounded controllers. Recursive links are guarded
by a cycle set; missing targets fail closed to the authored layer, while a
hidden target hides the linked layer for that tick.

This keeps the stage snapshot immutable and lets linked layers follow bounded
target motion, visibility, and sinusoidal offsets without copying mutable
renderer state.

## Evidence

- `src/tests/StageDefParser.test.ts` proves authored offsets and inherited
  delta survive import.
- `src/tests/stageProjection.test.ts` proves a linked layer follows target
  `PosSet` motion at the same background tick.
- `src/tests/StageCompatibilityReport.test.ts` proves the relationship is
  visible in the compatibility report.
- Focal gate: `pnpm vitest run src/tests/StageDefParser.test.ts
  src/tests/stageProjection.test.ts src/tests/StageCompatibilityReport.test.ts`
  passed 3 files / 23 tests.
- `pnpm typecheck` passed after the Studio detail addition.

## Claim ceiling

Allowed: bounded static and same-tick target-following `positionlink` for the
current layer projection.

Still blocked: exact shared mutable BGCtrl state across link groups, all-target
controller ordering, parallax deformation, camera/window/mask parity, and full
MUGEN/IKEMEN stage compatibility.
