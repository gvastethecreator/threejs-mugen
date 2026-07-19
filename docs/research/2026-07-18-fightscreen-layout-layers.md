# Research: FightScreen top/background layout layers

Date: 2026-07-18
Question: What is the smallest source-backed `AnimLayout` slice that can be
presented by the existing FightScreen AIR/SFF renderer without flattening
unsupported transforms into false parity?

## Findings

- Pinned IKEMEN `fightscreen.go` reads `round.default.top`, 32
  `round.default.bgN` entries, `round.single.*`, `round.final.*`, and
  `fight.*` layout families.
- Pinned `common.go` `AnimLayout.Read` accepts `spr` first and replaces it
  with a resolved `anim` action when the action exists. The layout also carries
  offsets, facing, vertical facing, scale, blend, window, tile, rotation,
  shear, projection, and focal-length state.
- The source round draw path keeps default backgrounds behind a selected
  variant background, chooses a variant top when present, then draws the
  announcement and top layer. The browser port does not yet own the full
  source `AnimTextSnd` composition, so this slice exposes layout resolution as
  a separate typed boundary.
- The existing renderer already owns localcoord projection, AIR frame timing,
  SFF lookup, texture caching, and presentation ordering. Reusing those
  seams keeps layout layers observable without inventing a second sprite path.

## Port decision

- Add a typed `MugenFightScreenLayoutAsset` with optional `animationNo`,
  `sprite`, `offset`, `scale`, `facing`, `vfacing`, and `blend`.
- Parse at most 32 `bgN` entries and one `top` entry for every current
  FightScreen display prefix, retaining authored sparse indices in order.
- Render static `spr` layouts and AIR `anim` layouts with the announcement
  frame tick. Use a bounded overlay priority: backgrounds below the primary
  announcement, top above it.
- Keep `window`, `tile`, `angle`, `xangle`, `yangle`, `xshear`, `projection`,
  `focallength`, and PalFX outside the contract until a dedicated transform
  and effect boundary exists.
- Keep unresolved references fail-closed at the mesh boundary and expose
  layer counts/resolution in diagnostics.

## Uncertainty and next boundary

The current path is a bounded presentation slice, not a full IKEMEN
`AnimLayout` implementation. It does not prove source action reset semantics,
window clipping, advanced transforms, palette effects, or all KO/winner
families. The next high-value boundary is a source-shaped layout transform
contract, followed by an asset-backed browser fixture that exercises the
actual FightScreen top/background path.

## Evidence

- Focused loader, renderer, and selection tests pass: 3 files / 19 tests.
- TypeScript 7 typecheck passes.
- `pnpm qa:smoke`: first attempt timed out during Studio project reopen; the
  isolated retry completed with `status=passed`, started Vite, used Playwright,
  saved and reopened the authored project, and wrote the supported runtime and
  Studio captures. The smoke fixture remains separate from an exact FightScreen
  screenpack parity claim.
- Visual inspection covered `.scratch/qa/qa-smoke/runtime-desktop.png` and
  `.scratch/qa/qa-smoke/studio-project-authoring.png`; both were nonblank,
  coherent, and free of visible overlap.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/common.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
- `.scratch/external/Ikemen-GO/src/fightscreen.go`, same pinned revision.
