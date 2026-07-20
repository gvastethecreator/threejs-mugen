# T317 - FightScreen winType assets

Status: resolved at bounded asset-contract scope
Date: 2026-07-20

## Source evidence

Ikemen-GO stores `winType` as ten base families for each side: normal,
special, hyper, cheese, time, throw, suicide, teammate, perfect, and clutch.
Each entry uses `FSBgTextSnd`, with a sound edge, sound time, active time,
display time, one background layout, outer position, and nested FSText data.
The source reads p1 and p2 prefixes separately.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FSBgTextSnd`, `readFSBgTextSnd`, and `FightScreenRound.winType`

## Delivered

- Added typed win-type names and p1/p2 asset maps.
- Loaded nested FSText text, font, color, palette effect, and layout data.
- Loaded background animation, position, active time, display time, sound,
  and sound time.
- Covered normal, perfect, and clutch fixture entries with focused tests.

## Verification

- `pnpm test -- src/tests/MugenSystemAssetsLoader.test.ts` passed: 1 file / 3
  tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket loads source-shaped win-type assets. The runtime does not yet
publish `winType` state, and the renderer/audio path does not select or present
these assets. Perfect, clutch, team result, direct screenpack browser proof,
and full parity remain open.

## Next boundary

Add a pure win-type selector with explicit p1/p2 side and type input, then use
it from the winner-display renderer only when runtime metadata declares the
selected type.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
