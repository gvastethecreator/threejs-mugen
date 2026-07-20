# T334 - FightScreen Helper TargetLifeAdd cause

Status: resolved at bounded first-generation Helper target scope
Date: 2026-07-20

## Source evidence

Ikemen-GO runs `TargetLifeAdd` through the character selected by
`RedirectID`. That character reads its target memory, applies the life change
to each selected receiver, and lets the receiver finish the life-zero branch.
The port must therefore keep the Helper source identity separate from the
selected root victim.

Pinned source:

- `.scratch/external/Ikemen-GO/src/bytecode.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd.Run`
- `.scratch/external/Ikemen-GO/src/char.go`, revision
  `05b7d98af690c73c7bffe5cb4f4eeb6933fa2703`, `targetLifeAdd` and `lifeSet`

## Delivered

- Helper target dispatch reports selected `TargetLifeAdd` targets with their
  pre-operation life value.
- Production attribution accepts a first-generation Helper only when its
  `rootId`, immediate `parentId`, `playerNo`, and `rootPlayerNo` form a valid
  root-owned identity.
- The source actor may be that local Helper or a verified root destination
  reached through `RedirectID`.
- The selected victim must resolve to a root. Helper-to-Helper destination
  source changes and non-root victims remain fail closed.
- The hook is carried through active, hitpause, and post-fighter lifecycle
  adapters.

## Verification

- `pnpm exec vitest run src/tests/HelperSystem.test.ts src/tests/PlayableMatchRuntime.test.ts src/tests/TargetSystem.test.ts src/tests/RuntimeRoundWinTypeSystem.test.ts --testTimeout=30000`
  passed: 4 files / 349 tests.
- `pnpm typecheck` passed with the TypeScript 7 toolchain.
- `git diff --check` passed for the slice.
- No renderer or UI code changed; browser smoke and `qa:smoke` are not part of
  this runtime-only closeout.

## Claim ceiling

This ticket covers first-generation Helper `TargetLifeAdd` attribution to a
root victim. It does not claim nested Helpers, Helper-to-Helper source
ownership, cross-root target ancestry without a root destination, other target
resources, reversal/reflection, exact multi-target order, direct screenpack
proof, or complete MUGEN/IKEMEN result parity.

## Next boundary

Audit target red-life, guard, and dizzy resources separately. Keep result
attribution closed until each resource's receiver and source context match the
pinned upstream path.

## Sources

- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/bytecode.go
- https://github.com/ikemen-engine/Ikemen-GO/blob/05b7d98af690c73c7bffe5cb4f4eeb6933fa2703/src/char.go
- `.scratch/external/Ikemen-GO/src/bytecode.go`
- `.scratch/external/Ikemen-GO/src/char.go`
