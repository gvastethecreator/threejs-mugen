# Research: stage layer scaling

## Question

Which source-backed stage layer scale fields can enter the current Three.js
projection without pretending to implement full parallax or camera parity?

## Primary sources

- [Elecbyte MUGEN 1.1b1 background documentation](https://www.elecbyte.com/mugendocs-11b1/bgs.html)
- [IKEMEN-GO stage renderer](https://github.com/ikemen-engine/Ikemen-GO/blob/master/src/stage.go)

Elecbyte defines `scalestart` as the initial scale, `scaledelta` as the
change per unit of camera movement, and `zoomdelta` as the share of camera
zoom applied to the element. A one-value `zoomdelta` applies to both axes.
IKEMEN-GO keeps the same fields and computes camera-movement scale from the
layer delta and camera position before applying the draw-scale path.

## Decision

Preserve authored `scalestart`, `scaledelta`, and scalar-or-pair `zoomdelta` in
`MugenStageLayer`. The pure stage projection resolves camera-movement scale
from the immutable snapshot, scales sprite dimensions around the SFF axis, and
scales asset/placeholder layers through the same helper. Because Three.js
already applies the global camera zoom, explicit `zoomdelta` is converted into
a bounded compensation factor: `1` keeps the default global behavior, while
`0` keeps the layer's screen size stable during zoom.

Tiling uses the resolved dimensions and scaled spacing. Window geometry remains
in the existing bounded rectangular path; exact MUGEN/IKEMEN window scaling,
parallax mesh deformation, localcoord normalization, and camera-anchor parity
remain separate gaps.

## Evidence

- `src/tests/StageDefParser.test.ts` proves scale fields and scalar
  `zoomdelta` survive import.
- `src/tests/stageProjection.test.ts` proves axis-centered dimensions,
  camera-movement scale, and zoom compensation.
- `src/tests/StageCompatibilityReport.test.ts` proves Studio/report scale
  visibility.
- Focal gate: `pnpm vitest run src/tests/StageDefParser.test.ts
  src/tests/stageProjection.test.ts src/tests/StageCompatibilityReport.test.ts`
  passed 3 files / 21 tests.
- `pnpm typecheck` passed.

## Claim ceiling

Allowed: bounded `scalestart`/`scaledelta`/`zoomdelta` projection for normal,
animated, asset, and placeholder layers in the current renderer.

Still blocked: exact parallax geometry, `xscale`/`yscalestart` legacy paths,
window/mask zoom behavior, camera-anchor/localcoord parity, and full
MUGEN/IKEMEN stage compatibility.
