# Research: legacy stage vertical scale

## Question

Which part of the deprecated `yscalestart`/`yscaledelta` contract is safe to
carry into the current stage projection while `parallax` geometry remains
bounded?

## Primary sources

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [IKEMEN-GO stage renderer](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/stage.go)

Elecbyte documents `yscalestart` as an inverse percentage scale and
`yscaledelta` as its per-camera-unit change. The reference formula is
`scale = 1 / (yscalestart/100 + yscaledelta/100 * camera_y)` and the document
explicitly describes these fields as deprecated in favor of `scalestart` and
`scaledelta`. IKEMEN-GO retains the legacy fields in its stage background
loader and render path.

## Decision

Preserve the legacy values as optional layer metadata and apply their bounded
vertical scale only when the general `scalestart`/`scaledelta` contract is not
authored. The scale resolver clamps non-positive results to zero so malformed
or singular imported values cannot create inverted geometry. The existing
sprite-axis, asset, placeholder, and tiling paths consume the same resolved
scale helper.

This improves imported legacy stage evidence without classifying it as full
parallax support: `xscale`, trapezoid deformation, camera anchor math,
window/mask behavior, and exact localcoord normalization stay outside this
slice.

## Evidence

- `src/tests/StageDefParser.test.ts` proves legacy values survive import.
- `src/tests/stageProjection.test.ts` proves the documented reciprocal formula
  at a camera position.
- `src/tests/StageCompatibilityReport.test.ts` proves legacy fields are
  visible in the scale report object.
- Focal gate: `pnpm vitest run src/tests/StageDefParser.test.ts
  src/tests/stageProjection.test.ts src/tests/StageCompatibilityReport.test.ts`
  passed 3 files / 25 tests.
- `pnpm typecheck` passed.

## Claim ceiling

Allowed: bounded legacy vertical scaling for imported stage layers.

Still blocked: exact parallax mesh deformation, legacy `xscale`, camera/window/
mask parity, and full MUGEN/IKEMEN stage compatibility.
