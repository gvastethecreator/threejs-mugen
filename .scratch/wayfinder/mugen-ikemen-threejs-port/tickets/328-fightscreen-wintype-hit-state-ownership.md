# T328 - FightScreen hit-state ownership

Status: resolved at bounded root hit-source scope  
Date: 2026-07-20

## Source evidence

Ikemen-GO checks `ghv.playerno` when a player root reaches zero in hit state.
The same player becomes `WT_Suicide`; a different player on the same team
becomes `WT_Teammate`. The source falls through to guard or attack cause for
an opposing player.

Pinned source:

- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `Char.lifeSet`

## Delivered

- Extended the root resource KO classifier to read explicit hit-source
  metadata while the victim remains in `MoveType = H`.
- Recorded `suicide` for a matching victim/source player number.
- Recorded `teammate` when the source root and victim root resolve to the same
  runtime team side.
- Left opposing-source and incomplete-source cases unchanged and fail-closed.

## Verification

- `pnpm exec vitest run src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/DirectCombatSystem.test.ts src/tests/ProjectileCombatSystem.test.ts`
  passed: 4 files / 347 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.

## Claim ceiling

This ticket covers root victims with explicit root-owned hit-source metadata.
It does not claim opponent attack-cause reconstruction after a later hit-state
resource KO, helper-owned source admission, redirected resources,
reversal/reflection, exact multi-team slot arbitration, direct screenpack
proof, or complete MUGEN/IKEMEN result parity.

## Next boundary

Carry source attack attr and guard-KO context through the same hit metadata so
a rival-owned hit-state resource KO can retain its normal/special/hyper/throw
base cause.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/char.go`
