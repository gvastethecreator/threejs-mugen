# T320 - FightScreen winType sounds

Status: resolved at bounded sound-edge scope
Date: 2026-07-20

## Source evidence

Ikemen-GO advances each `FSBgTextSnd` record during the winner-display
window. Its `step` method plays the record sound when `timer == sndtime`,
then advances the timer. The sound edge can therefore occur before the main
winner phase becomes visible.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FSBgTextSnd.step`, `FightScreenRound.update`, and winner-display draw flow

## Delivered

- Added p1/p2 win-type sound maps to `RuntimeRoundOutcomeTiming/v0`.
- Normalized invalid sound references and bounded sound times at the runtime
  boundary.
- Carried the selected win type and winning side into a timed sound edge.
- Allowed the edge to fire while the winner display remains pending.
- Routed all same-snapshot outcome edges through `MugenAudioSystem` while
  retaining actor/archive lookup and one-shot deduplication.
- Mapped imported `winType` asset sound and `sndtime` fields into runtime
  timing.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/MugenAudioSystem.test.ts src/tests/MugenSystemAssetsLoader.test.ts`
  passed: 3 files / 44 tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket schedules and plays the selected imported win-type sound record.
It does not co-step the base `normal` record with `perfect` or `clutch`,
derive the win type from live combat, prove direct screenpack audio in the
browser, or claim exact SND mixing and device parity. Full MUGEN/IKEMEN parity
remains open.

## Next boundary

Compose the source-equivalent special and base win-type records, then widen
direct screenpack evidence before changing compatibility scores.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
