# Research: FightScreen outcome display families

Date: 2026-07-20

## Question

How should the port expose the source KO, Double KO, Time Over, and Draw
families while the full Round outro remains outside the current runtime
boundary?

## Findings

- The pinned IKEMEN `FightScreenRound` definition includes `ko`, `dko`, `to`,
  `drawgame`, and separate top/background lists for the terminal display
  families.
- `readFightScreenRound` reads `ko.time`/`ko.sndtime`, the `dko` timing and
  `showdraw` flag, the Time Over timing, the Win timing, and the four
  `AnimTextSnd` families.
- `handleRoundOutro` chooses KO, Double KO, or Time Over from the finish
  result, then chooses draw or win content from the result and source flags.
  Exact delay and phase order remain source runtime responsibilities.
- The local runtime already exposes `round.state`, `round.winner`,
  `round.message`, and `round.postRound.frame`. Those facts support a bounded
  display-family selector without inventing a second outcome state machine.
- The loader now preserves the source display and timing fields in typed
  `MugenFightScreenAssets` contracts.
- The renderer gives terminal families the same shared AIR/FSText and layout
  path as Round/Fight, including transformed windows and completion handling.
  Existing visible Round/Fight announcements keep selection priority.

## Port decision

- Add `ko`, `doubleKo`, `timeOver`, and `draw` to the display definition model.
- Map `dko` to `doubleKo` and `to` to `timeOver` in the loader while retaining
  the source prefixes in the import layer.
- Derive `double-ko` from a KO snapshot with winner `Draw`, and `draw` from a
  Time Over snapshot with winner `Draw`.
- Reuse `ko` for a missing `dko` asset and `timeOver` for a missing `draw`
  asset. Keep this fallback visible in the asset contract rather than hiding
  missing source definitions.
- Keep exact `dko.showdraw`, winner assets, outro delays, and sound routing as
  separate runtime slices.

## Uncertainty and next boundary

The family names and source fields are pinned to the imported IKEMEN revision.
The current selector consumes the local terminal snapshot and does not yet
reproduce the complete source outro state machine. Direct imported screenpack
browser evidence, exact source timing consumption, dialogue/motif ownership,
winner-specific content, and full parity remain open.

## Evidence

- Focused loader and FightScreen renderer tests pass: 2 files / 12 tests.
- TypeScript 7 typecheck passes for the changed contract and renderer path.
- Full tests, build, smoke, and capture review are recorded in the global
  checkpoint after T312.

## Primary sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/common.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go

## Local source cache

- `.scratch/external/Ikemen-GO/src/fightscreen.go`,
  `.scratch/external/Ikemen-GO/src/common.go`, and
  `.scratch/external/Ikemen-GO/src/system.go`, pinned at revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`.
