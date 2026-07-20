# T321 - FightScreen winType composition

Status: resolved at bounded special-plus-normal scope
Date: 2026-07-20

## Source evidence

Ikemen-GO steps and draws the selected win-type record. When the selected
type is `perfect` or `clutch`, it also steps and draws the base `normal`
record. Each `FSBgTextSnd` keeps its own timer, display window, background,
text, and sound edge.

Pinned source:

- `src/fightscreen.go`, revision `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`
- `FightScreenRound.update`, `FSBgTextSnd.step`, and winner draw flow

## Delivered

- Added ordered `winTypes` metadata to the winner selection contract.
- Expanded perfect and clutch selections to `[special, normal]` while
  retaining the singular `winType` field for existing consumers.
- Published one runtime sound edge per selected record, with absolute
  post-KO timing and the record name for stable same-frame deduplication.
- Let the audio system play multiple distinct win-type edges from one
  snapshot without replaying them on repeated snapshots.
- Rendered multiple win-type backgrounds and bitmap-text records in shared
  FightScreen groups with separate mesh slots and aggregate diagnostics.
- Preserved the existing strict-start and inclusive-end timing window for
  every record.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/MugenAudioSystem.test.ts src/tests/FightScreenAnnouncementRenderer.font.test.ts`
  passed: 3 files / 54 tests.
- `pnpm typecheck` passed with the repository TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket composes explicit imported `perfect` or `clutch` records with
`normal`, including bounded visual and audio timing. It does not derive the
win type from live combat, reproduce every source team/result loop, prove
direct screenpack browser audio, or claim exact SND mixing/device parity.
Full MUGEN/IKEMEN parity remains open.

## Next boundary

Derive the win type from live round/combat facts, then widen direct
screenpack evidence and multi-team result coverage before changing scores.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
