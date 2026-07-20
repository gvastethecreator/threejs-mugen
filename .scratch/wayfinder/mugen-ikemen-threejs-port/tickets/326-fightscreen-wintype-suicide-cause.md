# T326 - FightScreen suicide KO cause

Status: resolved at bounded root-state scope  
Date: 2026-07-20

## Source evidence

Ikemen-GO checks the source player identity when `Char.lifeSet` reaches zero.
For a player root outside a hit state, a life-zero transition owned by the
same player becomes `WT_Suicide`. Helper-owned and hit-state ownership remain
separate source branches.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`

## Delivered

- Added a root self-KO classifier beside the shared FightScreen win-type
  classifier.
- Captured life before root `LifeAdd`/`LifeSet` controller dispatch in active
  and State -1 paths.
- Recorded `suicide` on the opposing active root when the source owner is the
  victim root, the transition reaches zero, and the victim is outside hit
  state.
- Kept helpers, disabled/non-player roots, hit-state actors, and mismatched
  source owners fail-closed.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts`
  passed: 2 files / 281 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers root-owned self `LifeAdd`/`LifeSet` KO evidence outside hit
state. It does not claim suicide from hit-state `LifeAdd`, teammate ownership,
helper suicide, redirected resource ownership, reversal/reflection, exact
source player-slot admission, direct screenpack proof, or complete
MUGEN/IKEMEN result parity.

## Next boundary

Carry source player identity through received-hit metadata before classifying
hit-state suicide and teammate KO causes.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/char.go`
