# Research: FightScreen layout xangle and yangle

Date: 2026-07-20

## Question

Which source rotation fields can reach the current FightScreen top/background
renderer while keeping the claim tied to the local camera model?

## Findings

- Pinned Ikemen `common.go` reads `xangle` and `yangle` into `Layout.rot`.
- Pinned `render.go` composes the rotation as `RotateX(-xangle)`,
  `RotateY(yangle)`, then `RotateZ(angle)`.
- The local FightScreen renderer uses pooled `PlaneGeometry` meshes and a
  `THREE.OrthographicCamera`. A mesh rotation gives the expected bounded
  orthographic plane transform; it does not implement the source frustum
  path.
- The local window path clips an axis-aligned rectangle and remaps UVs. A
  rotated or sheared polygon needs a different clip path.

## Port decision

- Add `xAngle` and `yAngle` to `MugenFightScreenLayoutAsset`.
- Parse `xangle` and `yangle` from each `top` and `bgN` section.
- Apply `rotation.set(-xangle, yangle, angle)` in radians after placement and
  before the existing centered shear.
- Count each applied field separately. Count transformed layouts with a
  `window` as culled instead of applying an invalid UV rectangle.
- Keep projection and focal-length fields outside this slice until a renderer
  path can own their camera and depth behavior.

## Uncertainty and next boundary

The result is a bounded orthographic plane transform. It does not yet carry
source aspect normalization, exact sprite-anchor rotation, perspective,
`perspective2`, focal length, or transformed-polygon clipping. Those fields
need a shared transform representation before they can be promoted to exact
parity claims.

## Evidence

- Focused loader and FightScreen renderer tests pass: 2 files / 8 tests.
- TypeScript 7 typecheck passes.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with the Runtime/Studio desktop and mobile matrix.
- Reviewed `.scratch/qa/qa-smoke/runtime-desktop.png`,
  `runtime-mobile.png`, `studio-project-authoring.png`, and `studio-debug.png`.
  The main canvases stayed visible; Studio debug retains one pre-existing
  missing stage sound warning.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go` and
  `.scratch/external/Ikemen-GO/src/render.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
