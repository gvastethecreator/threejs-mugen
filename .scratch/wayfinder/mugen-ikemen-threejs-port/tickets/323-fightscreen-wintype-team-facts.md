# T323 - FightScreen winType team facts

Status: resolved at bounded root-roster scope
Date: 2026-07-20

## Source evidence

Ikemen-GO's `roundEndDecision` does not inspect only the visible winner.
`checkPerfect(team)` and `checkClutch(team)` iterate the source character
slots for the winning team. Every participating member must satisfy the same
life rule before the result receives the upgraded type.

Pinned source:

- `.scratch/external/Ikemen-GO/src/system.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `roundEndDecision`

## Delivered

- Added optional team participants to the runtime round finish contract.
- The winner type resolver now evaluates every participant with the winner's
  normalized side when a roster is present.
- Missing, invalid, or incomplete `lifeMax` facts block inferred perfect and
  clutch results instead of guessing.
- Tag and Turns match closure now sends the character-root roster through the
  existing `PlayableMatchRuntime` bridge.
- The active pair remains the fallback for single-mode callers and old tests.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts src/tests/MugenSystemAssetsLoader.test.ts`
  passed: 3 files / 48 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers root participant life facts for the existing Tag/Turns
bridge. It does not claim exact source slot admission, helper-owned roster
entries, `teamside == -1` filtering, team KO arbitration, or cause-specific
special/hyper/throw/cheese/suicide/teammate classification. Full
MUGEN/IKEMEN parity remains open.

## Next boundary

Carry the source KO cause through direct combat and round finish without
using incomplete contact history to label a result.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- `.scratch/external/Ikemen-GO/src/system.go`
