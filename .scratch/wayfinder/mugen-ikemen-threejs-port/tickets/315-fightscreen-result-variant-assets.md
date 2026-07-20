# T315 - FightScreen result variant assets

Status: resolved at bounded asset-contract scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO `FightScreenRound` model declares four `ResultAnnouncement`
slots for `win`, `aiWin`, and `aiLose`. Each slot carries two side entries for
text, top layout, and background layouts. The loader accepts common prefixes
and `p1.`/`p2.` overrides, then records which AI result slots exist. The update
path selects the active team side and winner slot after checking the player or
AI conditions.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `ResultAnnouncement` and `readFightScreenRound`
- `FightScreenRound.update` winner announcement branch

## Delivered

- Added typed `result.win`, `result.aiWin`, and `result.aiLose` families.
- Loaded four source variant slots for each family and two side assets per
  slot, including common and `p1.`/`p2.` prefixes.
- Added a pure renderer resolver for family, side, and variant selection.
- Preserved the existing flat `display.win` asset for current callers.
- Applied the source fallback for missing `win3`/`win4` slots to `win2` during
  selection.
- Added loader and renderer tests for side overrides, AI families, and the
  variant fallback.

## Verification

- `pnpm test -- src/tests/MugenSystemAssetsLoader.test.ts src/tests/FightScreenAnnouncementRenderer.font.test.ts`
  passed: 2 files / 13 tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers source-shaped asset loading and a pure selection helper.
The runtime does not yet publish human-versus-AI context, team size, active
side, win type, or perfect state. It also does not claim exact source
component-level fallback, result animation timing, or direct imported
screenpack browser parity.

## Next boundary

Carry a typed result selection context through `RuntimeRoundOutcome/v0` so the
renderer can select p1/p2 and AI result assets from an actual round snapshot.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
