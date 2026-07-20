# T333 - FightScreen root TargetLifeAdd cause

Status: resolved at bounded root TargetLifeAdd scope
Date: 2026-07-20

## Source evidence

The pinned Ikemen-GO `TargetLifeAdd` controller resolves `RedirectID` to the
character whose target memory it will read. Its target-life routine then
applies damage to each selected target and preserves the target receiver's
life-zero result context. The redirected memory owner is therefore the source
root for this bounded route; the selected target owns the transition.

Pinned source:

- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd.Run`
- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd` and `lifeSet`

## Delivered

- Target dispatch captures the pre-operation life for selected
  `TargetLifeAdd` targets.
- Root active and State -1 dispatches classify a root target KO only when both
  the redirected memory owner and selected target resolve to the active root
  pair.
- Existing hit-state source metadata remains authoritative for hit-state KOs;
  non-hit root targets use the verified source root plus retained target cause
  fields, with normal as the bounded fallback.
- Target resources still apply to Helpers, reserve actors, and other target
  classes, but those paths remain outside result attribution.

## Verification

- `pnpm exec vitest run src/tests/TargetSystem.test.ts src/tests/RuntimeRoundWinTypeSystem.test.ts src/tests/PlayableMatchRuntime.test.ts --testTimeout=30000`
  passed: 3 files / 316 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.
- No renderer or UI code changed; browser smoke and `qa:smoke` are not part of
  this runtime-only closeout.

## Claim ceiling

This ticket covers root active and State -1 `TargetLifeAdd` result attribution
for the active root pair. It does not claim Helper target ownership, nested or
cross-root target ancestry, target memory persistence parity, `TargetRedLifeAdd`
result semantics, reversal/reflection, exact multi-target ordering, direct
screenpack proof, or complete MUGEN/IKEMEN result parity.

## Next boundary

Carry the same verified source contract into first-generation Helper target
resources. Require Helper root, parent, destination actor, selected target,
and inherited player identity to agree before any result cause is admitted.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
