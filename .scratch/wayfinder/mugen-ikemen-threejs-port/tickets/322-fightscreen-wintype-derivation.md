# T322 - FightScreen winType derivation

Status: resolved at bounded active-pair scope
Date: 2026-07-20

## Source evidence

Pinned Ikemen-GO `system.go` derives the winner type during
`roundEndDecision`:

- `checkPerfect(team)` keeps `perfect` only when every participating member
  on the winning team still has `life >= lifeMax`.
- `checkClutch(team)` uses `clutch.threshold / 100` and keeps `clutch` when
  every participating member is at or below that life ratio.
- Perfect takes precedence over clutch for KO and time-over decisions.
- The source keeps the earlier KO cause as the base type and upgrades it to
  perfect or clutch.

Pinned source:

- `.scratch/external/Ikemen-GO/src/system.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `roundEndDecision`
- `.scratch/external/Ikemen-GO/src/fightscreen.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `WinType.SetPerfect` and
  `WinType.SetClutch`

## Delivered

- Parsed `[Round] clutch.threshold` into `MugenFightScreenTiming`.
- Carried the imported threshold into `RuntimeRoundOutcomeTiming`, with the
  source default of 10 percent and a 0-100 bound.
- Propagated active actor `lifeMax` through `RuntimeMatchRoundWorld`.
- Derived `perfect` and `clutch` from the winner's current life, with perfect
  checked first and missing or invalid `lifeMax` left as an explicit fallback.
- Preserved an explicit base win type so an upgrade can compose
  `[perfect, special]` or `[clutch, special]`; the existing normal fallback
  remains for callers without base evidence.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundSystem.test.ts src/tests/RuntimeMatchRoundSystem.test.ts src/tests/MugenSystemAssetsLoader.test.ts`
  passed: 3 files / 46 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket proves source-shaped derivation for the active p1/p2 pair when
current life and `lifeMax` are available, plus imported threshold loading and
base-record ordering. The source team loop across simul/tag/turns members,
KO-cause derivation for special/hyper/throw/cheese/suicide/teammate, direct
screenpack browser proof, and exact full MUGEN/IKEMEN parity remain open.

## Next boundary

Provide team participant facts to the same decision boundary, then carry the
source KO cause into the base record without inferring it from incomplete
combat history.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/system.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/fightscreen.go
- `.scratch/external/Ikemen-GO/src/system.go`
- `.scratch/external/Ikemen-GO/src/fightscreen.go`
