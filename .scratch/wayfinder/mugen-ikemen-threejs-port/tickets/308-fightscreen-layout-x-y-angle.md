# T308: Carry FightScreen layout xangle and yangle

- Type: task
- Status: resolved at bounded orthographic transform scope
- Date: 2026-07-20
- Depends on: T307

## Question

Which part of the source `AnimLayout` X/Y rotation can the current
top/background mesh path carry without claiming perspective parity?

## Answer

The system-asset model and loader now carry finite `xangle` and `yangle`
values. The renderer applies them to the pooled plane with the source sign
for X rotation: `-xangle`, then `yangle`, then the existing Z `angle`.
Meshes reset all three Euler components on every render, so a reused entry
does not retain an old transform.

Any layout with `window` plus one of the three angles or `xshear` remains
culled and counted. The current clip path remaps UVs for an axis-aligned
rectangle and cannot clip the transformed polygon.

## Evidence

- Focused loader and FightScreen renderer tests: 2 files / 8 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 323 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with the Runtime/Studio desktop and mobile matrix.
- Reviewed Runtime desktop/mobile plus Studio authoring/debug captures. The
  main canvases stayed visible, and Runtime/Studio authoring reported zero
  browser errors and warnings. Studio debug kept one pre-existing missing
  stage sound warning.
- Scoped `git diff --check`: passed for the feature changes.

## Claim ceiling

Allowed: finite top/background `xangle` and `yangle` values applied as a
centered Three.js plane rotation in the current orthographic camera path,
with source X sign and applied/culled diagnostics.

Blocked: source aspect compensation, exact rotation center and anchor
correction, transformed-polygon window clipping, perspective and
`perspective2`, focal length, source palette math, primary/text transform
ownership, KO/winner families, direct imported FightScreen browser asset
proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/render.go
