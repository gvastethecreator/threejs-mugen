# T301: Apply FightScreen layout window

- Type: task
- Status: resolved at bounded rectangular clip scope
- Date: 2026-07-20
- Depends on: T300

## Question

Which part of the source `AnimLayout.window` contract can the current
FightScreen top/background renderer carry without claiming the full layout
engine?

## Answer

`round.*.top` and `round.*.bgN` now accept a normalized integer window in the
typed system-asset model. The loader reads the four source endpoints, rounds
finite values, orders both axes, and stores `[x, y, width, height]`.

The renderer maps that local-coordinate rectangle into the active viewport,
clips the projected sprite quad, remaps the mesh UVs to the visible source
rectangle, and culls layouts with no overlap. Diagnostics expose resolved
window applications and window culls. Layouts without a window keep the
existing full-quad path.

## Evidence

- Focused loader, renderer, and projection tests: 3 files / 21 tests passed.
- `pnpm typecheck`: passed with the repository TypeScript 7 toolchain.
- `pnpm build`: passed with 322 transformed modules. The existing large-chunk
  warning remains.
- `pnpm qa:smoke`: passed with Vite plus Playwright, desktop/mobile runtime
  captures, Studio authoring/debug captures, and no smoke assertion failure.
- Visual review covered runtime desktop/mobile and Studio authoring/debug
  captures. The main canvas stayed visible and the tested layouts remained
  readable without visible critical overlap.
- `git diff --check`: passed; existing roadmap CRLF warnings remain unrelated.

## Claim ceiling

Allowed: source-shaped rectangular window transport and UV clipping for
FightScreen top/background `AnimLayout` entries in the current renderer.

Blocked: primary `AnimTextSnd` window clipping, tile, angle, shear,
perspective, focal length, layer-specific PalFX, exact action reset ownership,
KO/Double KO/Time Over/winner families, direct imported FightScreen browser
asset proof, and full MUGEN/IKEMEN parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
