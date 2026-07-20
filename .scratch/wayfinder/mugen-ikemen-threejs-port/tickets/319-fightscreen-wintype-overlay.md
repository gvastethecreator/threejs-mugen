# T319 - FightScreen winType overlay

Status: resolved at bounded overlay scope
Date: 2026-07-20

## Source evidence

Ikemen-GO keeps each `winType` record beside the main winner result. The
record owns its background layout, bitmap text, offset, and display window.
The source draws the record only when `timer > time` and
`timer <= time + displaytime`. The record uses the winning team side even when
an AI result family selects a result asset for the other side.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FSBgTextSnd.step`, `FSBgTextSnd.bgDraw`, and `FSBgTextSnd.draw`

## Delivered

- Added separate Three.js groups and mesh pools for win-type backgrounds and
  bitmap text.
- Applied the source `time/displaytime` window, including the strict start
  edge and inclusive end edge.
- Carried the outer win-type offset into background layouts and text placement.
- Kept the main winner display and the win-type overlay alive in parallel when
  the main result completes first.
- Added `winType` diagnostics with selected name, winning side, active window,
  resolution state, text, and resolved background count.
- Added focused runtime timing and browser-renderer tests for an AI result with
  a p2 perfect overlay.

## Verification

- `pnpm exec vitest run src/tests/FightScreenAnnouncementRenderer.font.test.ts src/tests/RuntimeRoundSystem.test.ts`
  passed: 2 files / 33 tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket renders a selected imported `FSBgTextSnd` record with bounded
background and FNT text support. It does not schedule win-type sound playback,
derive perfect, clutch, or team state from live combat, reproduce every
AnimLayout runtime effect, or provide direct screenpack browser proof. Full
MUGEN/IKEMEN parity remains open.

## Next boundary

Add the win-type sound edge to the runtime/audio path, then widen direct
screenpack evidence and live combat derivation before changing compatibility
scores.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
