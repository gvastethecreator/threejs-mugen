# T318 - FightScreen winType selection contract

Status: resolved at bounded selection-contract scope
Date: 2026-07-20

## Source evidence

Ikemen-GO steps the main winner result and the selected `winType` family as
separate presentation records. The type belongs to the winning team side,
including perfect and clutch variants, while AI result text may use the human
side. The source therefore keeps result-family side and win-type side as
separate decisions.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FightScreenRound.update` winner branch and `winType` stepping

## Delivered

- Added the ten-name `RuntimeRoundWinTypeName` union.
- Added optional `winType` metadata to `RuntimeRoundWinnerDisplaySelection/v0`.
- Carried explicit participant win type through the bounded round finish path.
- Added a p1/p2 `resolveFightScreenWinTypeAsset` helper.
- Added focused tests for perfect and clutch selection plus runtime metadata.

## Verification

- `pnpm test -- src/tests/RuntimeRoundSystem.test.ts src/tests/FightScreenAnnouncementRenderer.font.test.ts src/tests/MugenSystemAssetsLoader.test.ts`
  passed: 3 files / 35 tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket publishes selection metadata and resolves typed assets. It does not
render the `FSBgTextSnd` record as a second overlay, does not apply its own
time/displaytime window, and does not derive perfect, clutch, team, or win type
state from live combat. Direct imported screenpack browser proof and full
parity remain open.

## Next boundary

Add a separate win-type overlay path with independent timing, background, text,
sound, and diagnostics. Keep it ordered beside the main winner result and
guarded by explicit runtime metadata.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
