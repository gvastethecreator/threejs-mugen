# T300: Present FightScreen top/background layouts

- Type: task
- Status: resolved at bounded `AnimLayout` presentation scope
- Date: 2026-07-18
- Depends on: T294, T295, T296, T299

## Question

Which `round.*.top` and `round.*.bgN` data can the current Three.js
FightScreen path transport and present without claiming the complete IKEMEN
layout engine?

## Answer

Carry up to 32 background layout entries and one top layout per FightScreen
display definition. Each entry accepts the source `spr` or `anim` reference,
`offset`, `scale`, `facing`, `vfacing`, and the bounded additive `trans`
blend hint. AIR-backed layouts reuse the existing FightScreen frame clock and
SFF provider. Background entries render below the primary announcement and
the top entry renders above it through the shared overlay presentation order.

Round layouts resolve the default background first and append a numbered,
single, or final variant background when one is present. Top layout selection
uses the active variant with default fallback; Fight uses its own layers.
Unknown AIR actions or sprites remain diagnostic-only and do not create a
phantom mesh.

## Evidence

- `pnpm exec vitest run src/tests/MugenSystemAssetsLoader.test.ts src/tests/FightScreenAnnouncementRenderer.font.test.ts src/tests/ThreeMugenRenderer.test.ts`: 3 files / 19 tests passed.
- `pnpm typecheck`: passed with TypeScript 7.0.2.
- `git diff --check`: passed; existing roadmap CRLF warnings are unrelated.
- Loader fixture proves `round.default.top.spr`, `round.default.bg0.anim`, and
  their layout metadata survive into `MugenFightScreenAssets`.
- Renderer fixture proves one AIR-backed background and one static top sprite
  resolve, remain visible as a layout-only display, and receive ordered
  background/top overlay render orders.
- `pnpm qa:smoke`: the first attempt timed out while reopening the Studio
  project; the isolated retry completed with `status=passed`, Vite plus
  Playwright, runtime desktop/mobile and Studio authoring captures, and no
  smoke assertion failure. The accepted retry produced
  `.scratch/qa/qa-smoke/diagnostics.json` and confirmed the authored project
  saved and reopened. The smoke fixture does not contain a direct FightScreen
  top/background screenpack asset.
- Visual inspection covered the updated runtime desktop and Studio authoring
  captures; both were nonblank, coherent, and free of visible overlap.

## Claim ceiling

Allowed: bounded top/background `AnimLayout` transport and presentation for
the current round/fight announcement path, with `spr|anim`, offset, scale,
facing, vfacing, and additive blend selection.

Blocked: window clipping, tile, angle/shear, perspective/focal length,
layer-specific PalFX, exact source animation reset/action ownership, KO/Double
KO/Time Over/winner layout families, complete default-plus-variant primary
`AnimTextSnd` composition, exact browser asset parity, and full MUGEN/IKEMEN
parity.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
